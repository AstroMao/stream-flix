import React, { useState, useEffect } from 'react';
// Import the new API functions from your service file
import { moviesAPI, seriesAPI } from '../../services/pocketbase';
import MoviesGrid from '../MoviesGrid';
import ImportMedia from './ImportMedia';

const Library = () => {
  const [activeTab, setActiveTab] = useState('Movies');
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      // Use the new API functions to get all movies and series
      // We set a high perPage limit to get all items, as getFullList is not used in your API
      const moviesResult = await moviesAPI.getMovies(1, 9999);
      setMovies(moviesResult.items);

      const seriesResult = await seriesAPI.getSeries(1, 9999);
      setSeries(seriesResult.items);

    } catch (error) {
      console.error('Failed to fetch media:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleRefresh = () => {
    fetchMedia();
  }

  const renderContent = () => {
    if (loading) {
      return <p>Loading media...</p>;
    }

    switch (activeTab) {
      case 'Movies':
        return <MoviesGrid movies={movies} />;
      case 'Series':
        return <MoviesGrid movies={series} />;
      case 'Import Media':
        return <ImportMedia onLinkSuccess={handleRefresh} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Library</h2>
      <div className="flex border-b border-gray-700 mb-6">
        <button onClick={() => setActiveTab('Movies')} className={`py-2 px-4 ${activeTab === 'Movies' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Movies</button>
        <button onClick={() => setActiveTab('Series')} className={`py-2 px-4 ${activeTab === 'Series' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Series</button>
        <button onClick={() => setActiveTab('Import Media')} className={`py-2 px-4 ${activeTab === 'Import Media' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Import Media</button>
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Library;