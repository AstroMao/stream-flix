import { useState, useEffect, useCallback } from 'react';
import { moviesAPI, seriesAPI, liveChannelsAPI, utils, getFileUrl } from '@/services/pocketbase';

export function useContent() {
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [liveChannels, setLiveChannels] = useState([]);
  const [availableGenres, setAvailableGenres] = useState(['All']);
  const [availableYears, setAvailableYears] = useState(['All']);
  const [availableCountries, setAvailableCountries] = useState(['All']);
  const [channelCategories, setChannelCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all content data
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch content sequentially to avoid overwhelming the API
      const moviesResult = await moviesAPI.getMovies(1, 50);
      const seriesResult = await seriesAPI.getSeries(1, 50);
      const channelsResult = await liveChannelsAPI.getChannels();
      const genres = await utils.getAvailableGenres();
      const years = await utils.getAvailableYears();
      const countries = await utils.getAvailableCountries();
      const categories = await liveChannelsAPI.getChannelCategories();

      // Helper function to get correct URL (handles both full URLs and file references)
      const getCorrectUrl = (record, field, placeholder) => {
        if (!field) return placeholder;
        // If it's already a full URL, use it directly
        if (field.startsWith('http://') || field.startsWith('https://')) {
          return field;
        }
        // Otherwise, treat it as a PocketBase file reference
        return getFileUrl(record, field);
      };

      // Transform movies data to match existing component structure
      const transformedMovies = moviesResult.items.map(movie => ({
        id: movie.id,
        title: movie.title,
        description: movie.description,
        genre: Array.isArray(movie.genre) ? movie.genre : [movie.genre].filter(Boolean),
        year: movie.year_released,
        rating: movie.rating,
        duration: movie.duration_in_minutes,
        poster: getCorrectUrl(movie, movie.poster, '/api/placeholder/300/450'),
        backdrop: getCorrectUrl(movie, movie.backdrop, '/api/placeholder/1920/1080'),
        folderName: movie.folder_name,
        playedCount: movie.played_count || 0,
        resolutions: movie.resolutions || [1080, 720, 480],
        type: 'movie'
      }));

      // Transform series data
      const transformedSeries = seriesResult.items.map(show => ({
        id: show.id,
        title: show.title,
        description: show.description,
        genre: Array.isArray(show.genre) ? show.genre : [show.genre].filter(Boolean),
        startYear: show.start_year,
        endYear: show.end_year,
        status: show.status,
        poster: getCorrectUrl(show, show.poster, '/api/placeholder/300/450'),
        backdrop: getCorrectUrl(show, show.backdrop, '/api/placeholder/1920/1080'),
        type: 'series'
      }));

      // Transform live channels data
      const transformedChannels = channelsResult.map(channel => ({
        id: channel.id,
        name: channel.name,
        category: channel.category,
        logo: channel.logo ? getFileUrl(channel, channel.logo) : '/api/placeholder/100/100',
        sourceUrl: channel.source_url,
        epgId: channel.epg_id,
        isHd: channel.is_hd,
        type: 'live'
      }));

      setMovies(transformedMovies);
      setSeries(transformedSeries);
      setLiveChannels(transformedChannels);
      setAvailableGenres(genres);
      setAvailableYears(years);
      setAvailableCountries(countries);
      setChannelCategories(categories);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Search content across movies and series
  const searchContent = useCallback(async (query, filters = {}) => {
    if (!query.trim()) {
      return [];
    }

    try {
      const [movieResults, seriesResults] = await Promise.all([
        moviesAPI.searchMovies(query, filters),
        seriesAPI.searchSeries(query, filters)
      ]);

      const transformedMovies = movieResults.map(movie => ({
        id: movie.id,
        title: movie.title,
        description: movie.description,
        genre: Array.isArray(movie.genre) ? movie.genre : [movie.genre].filter(Boolean),
        year: movie.year_released,
        rating: movie.rating,
        duration: movie.duration_in_minutes,
        poster: movie.poster ? getFileUrl(movie, movie.poster) : '/api/placeholder/300/450',
        backdrop: movie.backdrop ? getFileUrl(movie, movie.backdrop) : '/api/placeholder/1920/1080',
        folderName: movie.folder_name,
        playedCount: movie.played_count || 0,
        resolutions: movie.resolutions || [1080, 720, 480],
        type: 'movie'
      }));

      const transformedSeries = seriesResults.map(show => ({
        id: show.id,
        title: show.title,
        description: show.description,
        genre: Array.isArray(show.genre) ? show.genre : [show.genre].filter(Boolean),
        startYear: show.start_year,
        endYear: show.end_year,
        status: show.status,
        poster: show.poster ? getFileUrl(show, show.poster) : '/api/placeholder/300/450',
        backdrop: show.backdrop ? getFileUrl(show, show.backdrop) : '/api/placeholder/1920/1080',
        type: 'series'
      }));

      return [...transformedMovies, ...transformedSeries];
    } catch (err) {
      console.error('Error searching content:', err);
      return [];
    }
  }, []);

  // Get content by category
  const getContentByCategory = useCallback((category) => {
    switch (category) {
      case 'Movies':
        return movies;
      case 'Series':
        return series;
      case 'IPTV':
        return liveChannels;
      default:
        return [...movies, ...series];
    }
  }, [movies, series, liveChannels]);

  // Filter content
  const filterContent = useCallback((content, filters = {}) => {
    let filtered = [...content];

    if (filters.genre && filters.genre !== 'All') {
      filtered = filtered.filter(item => {
        if (item.type === 'live') return true; // Live channels don't have genres in the same way
        return item.genre && item.genre.includes(filters.genre);
      });
    }

    if (filters.year && filters.year !== 'All') {
      filtered = filtered.filter(item => {
        if (item.type === 'live') return true; // Live channels don't have years
        const itemYear = item.year || item.startYear;
        return itemYear && itemYear.toString() === filters.year;
      });
    }

    if (filters.category && filters.category !== 'All' && filters.category) {
      filtered = filtered.filter(item => {
        if (item.type !== 'live') return true; // Only filter live channels by category
        return item.category === filters.category;
      });
    }

    return filtered;
  }, []);

  // Get stream URL for a piece of content
  const getStreamUrl = useCallback(async (content) => {
    if (content.type === 'live') {
      return content.sourceUrl;
    }
    
    if (content.folderName) {
      return await utils.buildStreamUrl(content); // Pass the whole content object
    }
    
    return null;
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    movies,
    series,
    liveChannels,
    availableGenres,
    availableYears,
    availableCountries,
    channelCategories,
    loading,
    error,
    refetch: fetchContent,
    searchContent,
    getContentByCategory,
    filterContent,
    getStreamUrl
  };
}

export default useContent;
