const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Get API key from environment variables
const getApiKey = () => {
  return import.meta.env.VITE_TMDB_API_KEY;
};

/**
 * Search for media (movies or TV shows) on TMDB
 * @param {string} query - The search query
 * @param {string} type - The media type ('movie' or 'tv')
 * @returns {Promise<Array>} Array of search results
 */
export const searchMedia = async (query, type = 'movie') => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error('TMDB API key not found. Please add VITE_TMDB_API_KEY to your .env.local file');
    return [];
  }

  try {
    const endpoint = type === 'movie' ? 'search/movie' : 'search/tv';
    const response = await fetch(
      `${TMDB_BASE_URL}/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return [];
  }
};

/**
 * Search for multiple media types (movies and TV shows) on TMDB.
 * @param {string} query - The search query.
 * @returns {Promise<Array>} Array of search results, filtered to only include movies and TV shows.
 */
export const searchMulti = async (query) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('TMDB API key not found.');
    return [];
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    // Filter out results that are not movies or TV shows (e.g., people)
    return data.results.filter(result => result.media_type === 'movie' || result.media_type === 'tv') || [];
  } catch (error) {
    console.error('Error performing multi-search on TMDB:', error);
    return [];
  }
};

/**
 * Get detailed information about a movie
 * @param {number} movieId - The TMDB movie ID
 * @returns {Promise<Object|null>} Movie details object or null if error
 */
export const getMovieDetails = async (movieId) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error('TMDB API key not found. Please add VITE_TMDB_API_KEY to your .env.local file');
    return null;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

/**
 * Get detailed information about a TV show
 * @param {number} tvId - The TMDB TV show ID
 * @returns {Promise<Object|null>} TV show details object or null if error
 */
export const getTvDetails = async (tvId) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error('TMDB API key not found. Please add VITE_TMDB_API_KEY to your .env.local file');
    return null;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}?api_key=${apiKey}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching TV details:', error);
    return null;
  }
};

/**
 * Generate a full image URL from TMDB image path
 * @param {string} imagePath - The image path from TMDB (e.g., "/abc123.jpg")
 * @param {string} size - The image size (w92, w154, w185, w342, w500, w780, original)
 * @returns {string} Full image URL or placeholder if path is null
 */
export const getImageUrl = (imagePath, size = 'w500') => {
  if (!imagePath) {
    // Return a placeholder image if no path is provided
    return `https://via.placeholder.com/500x750/1a1a1a/ffffff?text=No+Image`;
  }
  
  return `${TMDB_IMAGE_BASE_URL}/${size}${imagePath}`;
};

/**
 * Get popular movies from TMDB
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Array>} Array of popular movies
 */
export const getPopularMovies = async (page = 1) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error('TMDB API key not found. Please add VITE_TMDB_API_KEY to your .env.local file');
    return [];
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=en-US&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

/**
 * Get movie genres from TMDB
 * @returns {Promise<Array>} Array of genre objects
 */
export const getMovieGenres = async () => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error('TMDB API key not found. Please add VITE_TMDB_API_KEY to your .env.local file');
    return [];
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${apiKey}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error('Error fetching movie genres:', error);
    return [];
  }
};
