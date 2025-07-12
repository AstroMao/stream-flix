import { useState, useEffect } from 'react';

const useMoviePlayer = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(7320); // Static duration for now, e.g., 2h 2m

  useEffect(() => {
    let interval;
    if (isPlaying && showPlayer) {
      interval = setInterval(() => {
        setCurrentTime(prev => Math.min(prev + 1, duration));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, showPlayer, duration]);

  const handlePlayMovie = (movie) => {
    setSelectedMovie(movie);
    setShowPlayer(true);
    setIsPlaying(true);
    setCurrentTime(0);
    // A real implementation would parse movie.duration to set the duration state
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setIsPlaying(false);
    // We keep selectedMovie so MovieDetails can still be shown, but player is hidden
  };

  return {
    selectedMovie,
    showPlayer,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    handlePlayMovie,
    handleClosePlayer,
    setIsPlaying,
    setIsMuted,
    setCurrentTime,
  };
};

export default useMoviePlayer;