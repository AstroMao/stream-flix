import PocketBase from 'pocketbase';

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL)

// Helper function to get the file URL
export const getFileUrl = (record, filename) => {
  if (!record || !filename) return null;
  return pb.files.getURL(record, filename);
};

// Settings API
export const settingsAPI = {
  async getSettings() {
    try {
      const records = await pb.collection('settings').getFullList();
      return records[0] || null; // Should be only one record
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  },

  async updateSettings(data) {
    try {
      const records = await pb.collection('settings').getFullList();
      if (records.length > 0) {
        return await pb.collection('settings').update(records[0].id, data);
      } else {
        return await pb.collection('settings').create(data);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
};

// Movies API
export const moviesAPI = {
  async getMovies(page = 1, perPage = 20, filter = '', sort = '-created') {
    try {
      const result = await pb.collection('movies').getList(page, perPage, {
        filter,
        sort
      });
      return result;
    } catch (error) {
      console.error('Error fetching movies:', error);
      return { items: [], page: 1, perPage: 20, totalItems: 0, totalPages: 0 };
    }
  },

  async getMovie(id) {
    try {
      return await pb.collection('movies').getOne(id);
    } catch (error) {
      console.error('Error fetching movie:', error);
      return null;
    }
  },

  async searchMovies(query, filters = {}) {
    try {
      let filter = `title ~ "${query}"`;
      
      if (filters.genre && filters.genre !== 'All') {
        filter += ` && genre ~ "${filters.genre}"`;
      }
      
      if (filters.year && filters.year !== 'All') {
        filter += ` && year_released = ${filters.year}`;
      }

      return await pb.collection('movies').getFullList({
        filter,
        sort: '-created'
      });
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  },

  async incrementPlayCount(id) {
    try {
      const movie = await pb.collection('movies').getOne(id);
      return await pb.collection('movies').update(id, {
        played_count: (movie.played_count || 0) + 1
      });
    } catch (error) {
      console.error('Error incrementing play count:', error);
      throw error;
    }
  }
};

// Series API
export const seriesAPI = {
  async getSeries(page = 1, perPage = 20, filter = '', sort = '-created') {
    try {
      const result = await pb.collection('series').getList(page, perPage, {
        filter,
        sort
      });
      return result;
    } catch (error) {
      console.error('Error fetching series:', error);
      return { items: [], page: 1, perPage: 20, totalItems: 0, totalPages: 0 };
    }
  },

  async getSeriesById(id) {
    try {
      return await pb.collection('series').getOne(id);
    } catch (error) {
      console.error('Error fetching series:', error);
      return null;
    }
  },

  async searchSeries(query, filters = {}) {
    try {
      let filter = `title ~ "${query}"`;
      
      if (filters.genre && filters.genre !== 'All') {
        filter += ` && genre ~ "${filters.genre}"`;
      }
      
      if (filters.year && filters.year !== 'All') {
        filter += ` && start_year = ${filters.year}`;
      }

      return await pb.collection('series').getFullList({
        filter,
        sort: '-created'
      });
    } catch (error) {
      console.error('Error searching series:', error);
      return [];
    }
  }
};

// Episodes API
export const episodesAPI = {
  async getEpisodesBySeries(seriesId, season = null) {
    try {
      let filter = `series = "${seriesId}"`;
      if (season !== null) {
        filter += ` && season_number = ${season}`;
      }

      return await pb.collection('episodes').getFullList({
        filter,
        sort: 'season_number, episode_number',
        expand: 'series'
      });
    } catch (error) {
      console.error('Error fetching episodes:', error);
      return [];
    }
  },

  async getEpisode(id) {
    try {
      return await pb.collection('episodes').getOne(id, {
        expand: 'series'
      });
    } catch (error) {
      console.error('Error fetching episode:', error);
      return null;
    }
  },

  async getSeasonsBySeries(seriesId) {
    try {
      const episodes = await pb.collection('episodes').getFullList({
        filter: `series = "${seriesId}"`,
        sort: 'season_number'
      });

      // Get unique seasons
      const seasons = [...new Set(episodes.map(ep => ep.season_number))].sort((a, b) => a - b);
      return seasons;
    } catch (error) {
      console.error('Error fetching seasons:', error);
      return [];
    }
  },

  async incrementPlayCount(id) {
    try {
      const episode = await pb.collection('episodes').getOne(id);
      return await pb.collection('episodes').update(id, {
        played_count: (episode.played_count || 0) + 1
      });
    } catch (error) {
      console.error('Error incrementing play count:', error);
      throw error;
    }
  }
};

// Live Channels API
export const liveChannelsAPI = {
  async getChannels(category = null) {
    try {
      let filter = '';
      if (category && category !== 'All') {
        filter = `category = "${category}"`;
      }

      return await pb.collection('live_channels').getFullList({
        filter,
        sort: 'name'
      });
    } catch (error) {
      console.error('Error fetching live channels:', error);
      return [];
    }
  },

  async getChannel(id) {
    try {
      return await pb.collection('live_channels').getOne(id);
    } catch (error) {
      console.error('Error fetching channel:', error);
      return null;
    }
  },

  async getChannelCategories() {
    try {
      const channels = await pb.collection('live_channels').getFullList();
      const categories = [...new Set(channels.map(ch => ch.category))].filter(Boolean);
      return ['All', ...categories.sort()];
    } catch (error) {
      console.error('Error fetching channel categories:', error);
      return ['All'];
    }
  }
};

// Ads API
export const adsAPI = {
  async getActiveAds() {
    try {
      const settings = await settingsAPI.getSettings();
      if (!settings?.ads_enabled || !settings?.active_ads?.length) {
        return [];
      }

      // Get active ads from settings
      const activeAdIds = settings.active_ads;
      const filter = activeAdIds.map(id => `id = "${id}"`).join(' || ');

      return await pb.collection('ads').getFullList({
        filter: `(${filter}) && is_enabled = true`,
        sort: '-weight'
      });
    } catch (error) {
      console.error('Error fetching active ads:', error);
      return [];
    }
  },

  async getRandomAd() {
    try {
      const ads = await this.getActiveAds();
      if (ads.length === 0) return null;

      // Weighted random selection
      const totalWeight = ads.reduce((sum, ad) => sum + (ad.weight || 1), 0);
      let random = Math.random() * totalWeight;

      for (const ad of ads) {
        random -= (ad.weight || 1);
        if (random <= 0) {
          return ad;
        }
      }

      return ads[0]; // Fallback
    } catch (error) {
      console.error('Error getting random ad:', error);
      return null;
    }
  },

  async incrementPlayCount(id) {
    try {
      const ad = await pb.collection('ads').getOne(id);
      return await pb.collection('ads').update(id, {
        played_count: (ad.played_count || 0) + 1
      });
    } catch (error) {
      console.error('Error incrementing ad play count:', error);
      throw error;
    }
  }
};

// Generic utility functions
export const utils = {
  // Build stream URL from settings and folder name
  async buildStreamUrl(content) {
    if (!content || !content.folderName || !content.type) {
        console.warn('buildStreamUrl requires a content object with folderName and type.');
        return null;
    }
    
    try {
      const settings = await settingsAPI.getSettings();
      if (!settings?.publicStreamUrl) {
        console.warn('No public_stream_url configured in PocketBase settings.');
        return null;
      }

      // Use CDN URL if available, otherwise fall back to public stream URL
      const baseUrl = settings.cdnStreamUrl || settings.publicStreamUrl;
      
      let mediaTypePath;
      if (content.type === 'movie') {
        mediaTypePath = 'movies';
      } else if (content.type === 'episode') {
        mediaTypePath = 'series';
      } else {
        console.warn(`Unsupported content type for streaming: ${content.type}`);
        return null;
      }

      // Example result: http://yourdomain.com/stream/movies/The.Matrix.1999/master.m3u8
      return `${baseUrl}/stream/${mediaTypePath}/${content.folderName}/master.m3u8`;

    } catch (error) {
      console.error('Error building stream URL:', error);
      return null;
    }
  },

  // Get available genres from movies and series
  async getAvailableGenres() {
    try {
      const [movies, series] = await Promise.all([
        pb.collection('movies').getFullList(),
        pb.collection('series').getFullList()
      ]);

      const allGenres = [
        ...movies.flatMap(m => m.genre || []),
        ...series.flatMap(s => s.genre || [])
      ];

      return ['All', ...new Set(allGenres)].filter(Boolean).sort();
    } catch (error) {
      console.error('Error fetching genres:', error);
      return ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Documentary', 'Thriller'];
    }
  },

  // Get available years from movies and series
  async getAvailableYears() {
    try {
      const [movies, series] = await Promise.all([
        pb.collection('movies').getFullList(),
        pb.collection('series').getFullList()
      ]);

      const movieYears = movies.map(m => m.year_released).filter(Boolean);
      const seriesYears = series.map(s => s.start_year).filter(Boolean);
      const allYears = [...new Set([...movieYears, ...seriesYears])].sort((a, b) => b - a);

      return ['All', ...allYears.map(year => year.toString())];
    } catch (error) {
      console.error('Error fetching years:', error);
      return ['All', '2025', '2024', '2023', '2022', '2021', 'Older'];
    }
  },

  // Get available countries from movies and series
  async getAvailableCountries() {
    try {
      const [movies, series] = await Promise.all([
        pb.collection('movies').getFullList(),
        pb.collection('series').getFullList()
      ]);

      const allCountries = [
        ...movies.map(m => m.country).filter(Boolean),
        ...series.map(s => s.country).filter(Boolean)
      ];

      return ['All', ...new Set(allCountries)].filter(Boolean).sort();
    } catch (error) {
      console.error('Error fetching countries:', error);
      return ['All', 'United States of America', 'India', 'United Kingdom', 'Canada', 'Australia'];
    }
  }
};

export default pb;
