import React from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, Clock, Film, PlusCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const MovieDetails = ({ movie }) => {
  if (!movie) return null;

  const handleNotImplemented = (feature) => {
    toast({
      title: `🚧 ${feature} is not implemented yet!`,
      description: "But don't worry! You can request it in your next prompt! 🚀",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-6 md:p-8 text-white"
    >
      <div className="flex flex-col md:flex-row gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:w-1/3 lg:w-1/4"
        >
          <img
            src="https://images.unsplash.com/photo-1548912803-8355e980322d"
            alt={`${movie.title} poster`}
            className="w-full h-auto object-cover rounded-2xl shadow-2xl shadow-purple-900/40"
          />
        </motion.div>
        <div className="md:w-2/3 lg:w-3/4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent"
          >
            {movie.title}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-gray-300"
          >
            <span className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400" /> {movie.rating}</span>
            <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-400" /> {movie.year}</span>
            <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-pink-400" /> {movie.duration}</span>
            <span className="flex items-center gap-2"><Film className="w-5 h-5 text-cyan-400" /> {movie.genre}</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-200 mb-8 leading-relaxed max-w-3xl"
          >
            {movie.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <Button
              onClick={() => handleNotImplemented('Add to Watchlist')}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 px-6 py-3 rounded-full font-semibold flex items-center gap-2"
            >
              <PlusCircle size={20} /> Watchlist
            </Button>
            <Button
              onClick={() => handleNotImplemented('Share')}
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-full font-semibold flex items-center gap-2"
            >
              <Share2 size={20} /> Share
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieDetails;