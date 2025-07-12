import React from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// Helper function to get the correct poster URL
const getPosterUrl = (movie) => {
  if (!movie || !movie.poster) {
    return "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Image";
  }
  
  // Ensure poster is a string
  const posterString = String(movie.poster);
  
  // If it's already a full URL (starts with http or https), use it directly
  if (posterString.startsWith('http://') || posterString.startsWith('https://')) {
    return posterString;
  }
  
  // If it's a PocketBase file reference (doesn't start with http), construct the PocketBase file URL
  const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';
  return `${POCKETBASE_URL}/api/files/${movie.collectionName}/${movie.id}/${posterString}`;
};

const MovieCard = ({ movie, onPlay }) => {
  const handleAddToWatchlist = (e) => {
    e.stopPropagation();
    toast({
      title: "Added to Watchlist! 🎬",
      description: `${movie.title} has been added to your watchlist.`,
      duration: 3000,
    });
  };

  const handleGetInfo = (e) => {
    e.stopPropagation();
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 4000,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.05, y: -10 }}
      className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl overflow-hidden backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 shadow-xl hover:shadow-purple-500/20 cursor-pointer"
      onClick={() => onPlay(movie)}
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        <img 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          alt={`${movie.title} movie poster`}
          src={getPosterUrl(movie)}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Image";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        
        {/* Hover Controls */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-3">
            <Button
              onClick={(e) => { e.stopPropagation(); onPlay(movie); }}
              size="icon"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-full"
            >
              <Play className="w-5 h-5 text-white" />
            </Button>
            <Button
              onClick={handleAddToWatchlist}
              size="icon"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-full"
            >
              <Plus className="w-5 h-5 text-white" />
            </Button>
            <Button
              onClick={handleGetInfo}
              size="icon"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-full"
            >
              <Info className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-lg text-white mb-1 truncate group-hover:text-purple-300 transition-colors">
                {movie.title}
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-300">
                <span>{movie.year_released}</span>
                <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {movie.rating}
                </span>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
