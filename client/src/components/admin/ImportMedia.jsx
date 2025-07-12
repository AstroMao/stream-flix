import React, { useState, useEffect } from 'react';
import pb, { moviesAPI, seriesAPI } from '../../services/pocketbase';
// Import all necessary functions from your tmdb.js
import { searchMulti, getImageUrl, getMovieDetails, getTvDetails } from '../../services/tmdb';
import { toast } from 'react-hot-toast';

const ImportMedia = ({ onLinkSuccess }) => {
  const [unlinkedContent, setUnlinkedContent] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tmdbId, setTmdbId] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false); // Add state for linking process

  const fetchUnlinkedContent = async () => {
    setIsLoading(true);
    try {
      const filter = 'tmdb_id = 0 || tmdb_id = null';
      const unlinkedMoviesResult = await moviesAPI.getMovies(1, 9999, filter);
      const unlinkedSeriesResult = await seriesAPI.getSeries(1, 9999, filter);
      const moviesWithType = unlinkedMoviesResult.items.map(item => ({ ...item, type: 'movies' }));
      const seriesWithType = unlinkedSeriesResult.items.map(item => ({ ...item, type: 'series' }));
      setUnlinkedContent([...moviesWithType, ...seriesWithType]);
    } catch (error) {
        console.error("Failed to fetch unlinked content", error);
        toast.error("Could not load unlinked items.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUnlinkedContent();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setIsLoading(true);
    const results = await searchMulti(searchTerm);
    setSearchResults(results);
    setIsLoading(false);
  };

  const handleLinkItem = async (tmdbResult) => {
    if (!selectedContent || isLinking) {
      toast.error('Please select an item from your library first or wait for the current process to finish!');
      return;
    }

    setIsLinking(true); // Disable button during the process
    const isMovie = tmdbResult.media_type === 'movie';
    const collectionName = isMovie ? 'movies' : 'series';

    if (selectedContent.type !== collectionName) {
        toast.error(`The selected library item is a '${selectedContent.type}', but the TMDB result is a '${collectionName}'. Please select a matching item.`);
        setIsLinking(false);
        return;
    }

    try {
      // Fetch the full details for the selected item
      const details = isMovie ? await getMovieDetails(tmdbResult.id) : await getTvDetails(tmdbResult.id);

      if (!details) {
        throw new Error("Could not fetch details from TMDB.");
      }

      let data;
      if (isMovie) {
          data = {
              tmdb_id: details.id,
              title: details.title,
              description: details.overview,
              poster: getImageUrl(details.poster_path, 'original'),
              backdrop: getImageUrl(details.backdrop_path, 'original'),
              year_released: details.release_date ? new Date(details.release_date).getFullYear() : 0,
              rating: details.vote_average || 0,
              duration_in_minutes: details.runtime || 0,
              genres: details.genres ? details.genres.map(g => g.name) : [],
              languages: details.spoken_languages ? details.spoken_languages.map(l => l.english_name) : [],
              country: details.production_countries && details.production_countries.length > 0 ? details.production_countries[0].name : "",
          };
      } else { // It's a TV show
          data = {
              tmdb_id: details.id,
              title: details.name,
              description: details.overview,
              poster: getImageUrl(details.poster_path, 'original'),
              backdrop: getImageUrl(details.backdrop_path, 'original'),
              start_year: details.first_air_date ? new Date(details.first_air_date).getFullYear() : 0,
              end_year: details.last_air_date ? new Date(details.last_air_date).getFullYear() : 0,
              status: details.status,
              genres: details.genres ? details.genres.map(g => g.name) : [],
              // Add any other series-specific fields you need
          };
      }

      await pb.collection(collectionName).update(selectedContent.id, data);
      toast.success(`${selectedContent.title || selectedContent.folder_name} has been linked!`);
      
      setSelectedContent(null);
      setSearchResults([]);
      setSearchTerm('');
      fetchUnlinkedContent(); 
      if (onLinkSuccess) onLinkSuccess();

    } catch (error) {
      toast.error(`Failed to link item. ${error.message}`);
      console.error(error);
    } finally {
      setIsLinking(false); // Re-enable button
    }
  };
  
  const handleManualLink = async () => {
    toast.info('Manual linking functionality to be implemented.');
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Unlinked Items */}
      <div>
        <h3 className="text-xl font-bold mb-4">Unlinked Library Items</h3>
        <div className="bg-gray-800 p-4 rounded-lg h-96 overflow-y-auto">
          {isLoading ? <p>Loading...</p> : unlinkedContent.map((item) => (
            <div
              key={item.id}
              className={`p-2 rounded cursor-pointer flex justify-between items-center ${selectedContent?.id === item.id ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setSelectedContent(item)}
            >
              <div>
                <p className="font-bold">{item.title || item.folder_name}</p>
                <p className="text-sm text-gray-400">{item.file_name || 'Series'}</p>
              </div>
              <span className="text-xs font-semibold uppercase bg-gray-600 px-2 py-1 rounded-full">{item.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TMDB Search and Link */}
      <div>
        <h3 className="text-xl font-bold mb-4">Find and Link Item</h3>
        {selectedContent && (
            <p className="mb-4">Selected: <span className='font-bold text-blue-400'>{selectedContent.title || selectedContent.folder_name}</span></p>
        )}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search TMDB for movies & TV..."
            className="flex-grow bg-gray-700 p-2 rounded text-white"
          />
          <button onClick={handleSearch} className="bg-blue-600 p-2 rounded">Find Item</button>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={tmdbId}
            onChange={(e) => setTmdbId(e.target.value)}
            placeholder="Or enter TMDB ID manually..."
            className="flex-grow bg-gray-700 p-2 rounded text-white"
          />
          <button onClick={handleManualLink} className="bg-green-600 p-2 rounded">Link</button>
        </div>

        {/* Search Results */}
        <div className="h-80 overflow-y-auto">
            {isLoading ? <p>Searching...</p> :
              searchResults.map((result) => (
                <div key={result.id} className="flex items-center gap-4 bg-gray-800 p-2 rounded mb-2">
                  <img src={getImageUrl(result.poster_path, 'w92')} alt="Poster" className="w-12 h-auto rounded" />
                  <div className="flex-grow">
                    <p className="font-bold">{result.title || result.name}</p>
                    <p className="text-sm text-gray-400">{result.release_date || result.first_air_date}</p>
                    <p className="text-xs font-semibold uppercase text-blue-400">{result.media_type}</p>
                  </div>
                  <button onClick={() => handleLinkItem(result)} disabled={isLinking} className="bg-blue-600 p-2 rounded disabled:bg-gray-500">
                    {isLinking ? 'Linking...' : 'Select'}
                  </button>
                </div>
              ))
            }
        </div>
      </div>
    </div>
  );
};

export default ImportMedia;
