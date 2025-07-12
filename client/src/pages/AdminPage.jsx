import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import pb from '@/services/pocketbase';
import { searchMedia, getMovieDetails, getImageUrl } from '@/services/tmdb';
import { Link, RefreshCw, LogOut } from 'lucide-react';

/**
 * AdminPage Component
 *
 * This component provides an interface for administrators to manage the media library.
 * Its primary function is to find media in the local PocketBase database that
 * hasn't been enriched with TMDB data, and then allow the admin to fetch and
 * link that data.
 */
const AdminPage = () => {
  const [unlinkedMovies, setUnlinkedMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch movies that don't have a tmdb_id
  const fetchUnlinkedMovies = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('movies').getFullList({
        filter: 'tmdb_id = null || tmdb_id = 0',
        sort: '-created',
      });
      setUnlinkedMovies(records);
    } catch (error) {
      console.error('Failed to fetch unlinked movies:', error);
      toast({ title: 'Error', description: 'Could not fetch movies from the library.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnlinkedMovies();
  }, []);

  // Handle refreshing the media list
  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast({ title: 'Refreshing...', description: 'Fetching latest movies from database.' });
    await fetchUnlinkedMovies();
    setIsRefreshing(false);
    toast({ title: 'Refreshed!', description: 'Movie list has been updated.' });
  };

  // Handle logout
  const handleLogout = () => {
    pb.authStore.clear();
    toast({ title: 'Logged Out', description: 'You have been logged out successfully.' });
    navigate('/login');
  };

  // Handle searching TMDB for a specific movie
  const handleSearch = async (movie) => {
    setSelectedMovie(movie);
    setSearchResults([]); // Clear previous results
    toast({ title: 'Searching TMDB...', description: `Looking for "${movie.title}"` });
    const results = await searchMedia(movie.title, 'movie');
    if (results && results.length > 0) {
      setSearchResults(results.slice(0, 5)); // Show top 5 results
    } else {
      toast({ title: 'No Results', description: `No matches found for "${movie.title}" on TMDB.`, variant: 'destructive' });
    }
  };

  // Handle selecting a search result and updating PocketBase
  const handleSelectResult = async (tmdbResult) => {
    if (!selectedMovie) return;

    toast({ title: 'Enriching Data...', description: `Fetching details for "${tmdbResult.title}"` });

    try {
      // Fetch full details for the selected movie
      const details = await getMovieDetails(tmdbResult.id);
      if (!details) {
        throw new Error('Could not fetch full details from TMDB.');
      }

      // Prepare the data payload for PocketBase
      const dataToUpdate = {
        tmdb_id: details.id,
        title: details.title,
        description: details.overview,
        rating: parseFloat(details.vote_average.toFixed(1)),
        year_released: new Date(details.release_date).getFullYear(),
        duration_in_minutes: details.runtime,
        // Store genres as JSON array (using 'genres' field name to match your schema)
        ...(details.genres && details.genres.length > 0 ? { 
          genres: details.genres.map((g) => g.name) 
        } : {}),
        // Add country from TMDB production_countries
        ...(details.production_countries && details.production_countries.length > 0 ? {
          country: details.production_countries[0].name  // Take the first country
        } : {}),
        // Store full TMDB image URLs (change poster/backdrop fields to Text/URL type in PocketBase)
        ...(details.poster_path ? { 
          poster: getImageUrl(details.poster_path, 'w500')  // Full TMDB URL
        } : {}),
        ...(details.backdrop_path ? { 
          backdrop: getImageUrl(details.backdrop_path, 'w1280')  // Full TMDB URL
        } : {}),
        
        // Note: languages and subtitles will be filled by media scanner/manually, not TMDB
      };

      console.log('Updating movie with data:', dataToUpdate);
      console.log('TMDB details received:', {
        genres: details.genres,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        production_countries: details.production_countries
      });

      // Update the record in PocketBase
      await pb.collection('movies').update(selectedMovie.id, dataToUpdate);

      toast({ title: 'Success!', description: `"${details.title}" has been updated.` });

      // Reset state and refresh the list of unlinked movies
      setSearchResults([]);
      setSelectedMovie(null);
      fetchUnlinkedMovies();

    } catch (error) {
      console.error('Failed to update movie:', error);
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white p-8">
      <Helmet>
        <title>Admin Panel - StreamFlix</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admin - Media Enrichment
          </h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="border-purple-500/30 text-white hover:bg-purple-500/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Media'}
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Unlinked Movies Column */}
          <Card className="bg-slate-900/50 backdrop-blur-lg border-purple-500/30">
            <CardHeader>
              <CardTitle>Unlinked Library Items</CardTitle>
              <CardDescription>Movies in your library that need TMDB data.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : unlinkedMovies.length > 0 ? (
                <ul className="space-y-3">
                  {unlinkedMovies.map((movie) => (
                    <li key={movie.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="font-medium">{movie.title}</span>
                      <Button onClick={() => handleSearch(movie)} size="sm">
                        <Link className="w-4 h-4 mr-2" /> Find Match
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">All movies are linked!</p>
              )}
            </CardContent>
          </Card>

          {/* TMDB Search Results Column */}
          <Card className="bg-slate-900/50 backdrop-blur-lg border-purple-500/30">
            <CardHeader>
              <CardTitle>TMDB Search Results</CardTitle>
              <CardDescription>
                {selectedMovie ? `Showing results for "${selectedMovie.title}"` : 'Select a movie to search for matches.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchResults.length > 0 ? (
                <ul className="space-y-4">
                  {searchResults.map((result) => (
                    <li key={result.id} className="flex items-start gap-4 p-3 bg-gray-800/50 rounded-lg">
                      <img
                        src={getImageUrl(result.poster_path, 'w92')}
                        alt={result.title}
                        className="w-16 rounded-md"
                      />
                      <div className="flex-1">
                        <p className="font-bold">{result.title} ({new Date(result.release_date).getFullYear()})</p>
                        <p className="text-sm text-gray-400 line-clamp-2">{result.overview}</p>
                      </div>
                      <Button onClick={() => handleSelectResult(result)} size="sm" variant="secondary">Select</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-center py-8">No results to display.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPage;
