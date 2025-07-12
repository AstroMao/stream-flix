import fs from 'fs/promises';
import path from 'path';
import pb from './pocketbase-client.js';
import config from '../config/index.js';

// --- HELPER FUNCTIONS ---

/**
 * Extracts a clean title and year from a folder name using regex.
 * @param {string} folderName - The name of the folder (e.g., "The.Matrix.1999").
 * @returns {{title: string, year: number|null}} An object with the cleaned title and year.
 */
function extractTitleAndYear(folderName) {
  // Remove common tags and quality indicators first
  let cleanName = folderName
    .replace(/\b(1080p|720p|4k|2160p|web-dl|webrip|bluray|dvdrip|brrip|x264|x265|h264|h265)\b/gi, '')
    .replace(/[\[({].*?[\])}]/g, '') // Remove content in brackets/parentheses
    .trim();

  // Look for a 4-digit year
  const yearMatch = cleanName.match(/\b(\d{4})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

  // Title is what's left after removing dots, underscores, and extra spaces
  let title = year ? cleanName.replace(yearMatch[0], '').trim() : cleanName;
  title = title.replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim();
  // Capitalize each word
  title = title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return { title, year };
}

/**
 * Detects available video resolutions by checking for subfolders (e.g., "1080p").
 * @param {string} mediaPath - The path to the media item's folder.
 * @returns {Promise<string[]>} A sorted array of resolution strings (e.g., ["720", "1080"]).
 */
async function detectResolutions(mediaPath) {
    const resolutions = new Set();
    const resolutionMap = {
        '360p': '360', '480p': '480', '720p': '720', '1080p': '1080', '1440p': '1440', '2160p': '2160', '4k': '2160'
    };
    try {
        const entries = await fs.readdir(mediaPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const entryLower = entry.name.toLowerCase();
                for (const [key, value] of Object.entries(resolutionMap)) {
                    if (entryLower.includes(key)) {
                        resolutions.add(value);
                    }
                }
            }
        }
    } catch (error) {
        console.warn(`Could not read directory for resolution detection: ${mediaPath}`, error.message);
    }
    return Array.from(resolutions).sort((a, b) => parseInt(a) - parseInt(b));
}

/**
 * Parses season and episode numbers from a path fragment like "Season 01/Episode 01".
 * @param {string} pathFragment - The relative path of an episode.
 * @returns {{seasonNum: number|null, episodeNum: number|null}}
 */
function parseEpisodePath(pathFragment) {
    const seasonMatch = pathFragment.match(/[Ss](?:eason)?\s*[-_]?(\d+)/i);
    const episodeMatch = pathFragment.match(/[Ee](?:pisode)?\s*[-_]?(\d+)/i);
    return {
        seasonNum: seasonMatch ? parseInt(seasonMatch[1], 10) : null,
        episodeNum: episodeMatch ? parseInt(episodeMatch[1], 10) : null,
    };
}

// --- GENERIC SYNC LOGIC ---

/**
 * A generic function to sync items between the filesystem and a PocketBase collection.
 * @param {string} mediaType - A display name for the media type (e.g., "Movie").
 * @param {string} collectionName - The PocketBase collection name.
 * @param {Map<string, object>} itemsOnDisk - A map where keys are folder names and values are the data payloads.
 * @param {string} [folderNameField='folder_name'] - The field in PocketBase that stores the folder name.
 */
async function syncCollection(mediaType, collectionName, itemsOnDisk, folderNameField = 'folder_name') {
    console.log(`\n--- Syncing ${mediaType.toUpperCase()}S ---`);
    
    // 1. Get all existing records from PocketBase to compare against
    const itemsInDbRaw = await pb.collection(collectionName).getFullList({ fields: `id,${folderNameField}` });
    const itemsInDb = new Map(itemsInDbRaw.map(item => [item[folderNameField], item]));
    console.log(`Found ${itemsInDb.size} ${mediaType} records in DB.`);
    
    const diskFolders = new Set(itemsOnDisk.keys());
    const dbFolders = new Set(itemsInDb.keys());

    // 2. Add new items that are on disk but not in the DB
    for (const folder of diskFolders) {
        if (!dbFolders.has(folder)) {
            const payload = itemsOnDisk.get(folder);
            console.log(`[${mediaType}] CREATING: ${folder}`);
            try {
                await pb.collection(collectionName).create(payload);
            } catch (error) {
                console.error(`[${mediaType}] FAILED to create ${folder}:`, error.message);
            }
        }
    }

    // 3. Delete items that are in the DB but no longer on disk
    for (const folder of dbFolders) {
        if (!diskFolders.has(folder)) {
            const recordId = itemsInDb.get(folder).id;
            console.log(`[${mediaType}] DELETING: ${folder} (Record ID: ${recordId})`);
            try {
                await pb.collection(collectionName).delete(recordId);
            } catch (error) {
                console.error(`[${mediaType}] FAILED to delete ${folder}:`, error.message);
            }
        }
    }
}

// --- MEDIA-SPECIFIC SCANNERS ---

/**
 * Scans the movies directory and syncs with the 'movies' collection.
 */
async function scanMovies() {
    const moviesOnDisk = new Map();
    try {
        const entries = await fs.readdir(config.media.moviesRoot, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(config.media.moviesRoot, entry.name);
            if (entry.isDirectory()) {
                try {
                    // A valid media folder must contain a master playlist file
                    await fs.access(path.join(fullPath, 'master.m3u8'));
                    const { title, year } = extractTitleAndYear(entry.name);
                    const resolutions = await detectResolutions(fullPath);
                    moviesOnDisk.set(entry.name, {
                        title,
                        year_released: year,
                        resolutions,
                        folder_name: entry.name,
                    });
                } catch (e) { /* Not a valid media folder, skip */ }
            }
        }
        console.log(`Found ${moviesOnDisk.size} valid movie folders on disk.`);
        await syncCollection('Movie', 'movies', moviesOnDisk);
    } catch (error) {
        console.error('Error scanning movies directory:', error.message);
    }
}

/**
 * Scans the series and episodes directories and syncs them with their collections.
 */
async function scanSeriesAndEpisodes() {
    console.log(`\n--- Scanning SERIES & EPISODES ---`);
    const episodesOnDisk = new Map();
    const seriesCache = new Map(); // Cache to avoid re-fetching series records

    try {
        const seriesFolders = await fs.readdir(config.media.seriesRoot, { withFileTypes: true });

        for (const seriesEntry of seriesFolders) {
            if (!seriesEntry.isDirectory()) continue;
            
            const seriesTitle = seriesEntry.name;
            let seriesRecord;

            // Get or create the series record in PocketBase
            if (seriesCache.has(seriesTitle)) {
                seriesRecord = seriesCache.get(seriesTitle);
            } else {
                try {
                    // Use getFirstListItem for efficiency
                    seriesRecord = await pb.collection('series').getFirstListItem(`title="${seriesTitle.replace(/"/g, '""')}"`);
                } catch (e) {
                    if (e.status === 404) { // Not found, so create it
                        console.log(`[Series] CREATING: ${seriesTitle}`);
                        seriesRecord = await pb.collection('series').create({ title: seriesTitle });
                    } else { throw e; }
                }
                seriesCache.set(seriesTitle, seriesRecord);
            }

            if (!seriesRecord) continue;

            // Walk through season and episode subfolders
            const seriesPath = path.join(config.media.seriesRoot, seriesTitle);
            const seasonFolders = await fs.readdir(seriesPath, { withFileTypes: true });
            for (const seasonEntry of seasonFolders) {
                if (!seasonEntry.isDirectory()) continue;
                
                const seasonPath = path.join(seriesPath, seasonEntry.name);
                const episodeFolders = await fs.readdir(seasonPath, { withFileTypes: true });

                for (const episodeEntry of episodeFolders) {
                    const episodePath = path.join(seasonPath, episodeEntry.name);
                    try {
                        await fs.access(path.join(episodePath, 'master.m3u8'));
                        const relativePath = path.join(seriesTitle, seasonEntry.name, episodeEntry.name);
                        const { seasonNum, episodeNum } = parseEpisodePath(relativePath);

                        if (seasonNum !== null && episodeNum !== null) {
                            const resolutions = await detectResolutions(episodePath);
                            episodesOnDisk.set(relativePath, {
                                series: seriesRecord.id,
                                season_number: seasonNum,
                                episode_number: episodeNum,
                                resolutions,
                                folder_name: relativePath,
                                title: `Season ${seasonNum} Episode ${episodeNum}`, // Default title
                            });
                        }
                    } catch (e) { /* Not a valid episode folder */ }
                }
            }
        }
        console.log(`Found ${episodesOnDisk.size} valid episode folders on disk.`);
        await syncCollection('Episode', 'episodes', episodesOnDisk);

    } catch (error) {
        console.error('Error scanning series directory:', error.message);
    }
}

/**
 * Scans the ads directory and syncs with the 'ads' collection.
 */
async function scanAds() {
    const adsOnDisk = new Map();
    try {
        const entries = await fs.readdir(config.media.adsRoot, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                adsOnDisk.set(entry.name, { folder_name: entry.name });
            }
        }
        console.log(`Found ${adsOnDisk.size} ad folders on disk.`);
        await syncCollection('Ad', 'ads', adsOnDisk);
    } catch (error) {
        console.error('Error scanning ads directory:', error.message);
    }
}

// --- MAIN EXPORT ---

let isScanning = false; // A simple lock to prevent multiple scans at once

/**
 * Initiates a full scan of all media types.
 */
export async function scanAllMedia() {
  if (isScanning) {
    console.log('Scan is already in progress. Skipping.');
    return;
  }

  console.log('--- Starting Full Media Scan ---');
  isScanning = true;

  try {
    await scanMovies();
    await scanSeriesAndEpisodes();
    await scanAds();
  } catch (error) {
    console.error('An unexpected error occurred during the scan:', error);
  } finally {
    isScanning = false;
    console.log('--- Scan Complete ---');
  }
}
