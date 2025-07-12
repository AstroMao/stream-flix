import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from '@/components/MovieCard';

const MoviesGrid = ({ movies, onPlay }) => {
  return (
    <>
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
      >
        <AnimatePresence>
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onPlay={onPlay} />
          ))}
        </AnimatePresence>
      </motion.div>

      {movies.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-2xl font-bold text-white mb-2">No content found</h3>
          <p className="text-gray-400">Try adjusting your search or filters.</p>
        </motion.div>
      )}
    </>
  );
};

export default MoviesGrid;