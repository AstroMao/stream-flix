import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Tv, Film, ListVideo } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const MovieItem = ({ movie, onPlay, isCollapsed }) => (
  <motion.div
    onClick={() => onPlay(movie)}
    whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
    className="flex items-center gap-3 p-2 mx-2 rounded-lg cursor-pointer overflow-hidden"
  >
    <img 
      src="https://images.unsplash.com/photo-1620145648299-f926ac0a9470?w=100"
      alt={movie.title}
      className="w-12 h-16 object-cover rounded-md flex-shrink-0"
    />
    <AnimatePresence>
      {!isCollapsed && (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <p className="font-semibold text-sm text-white truncate">{movie.title}</p>
          <p className="text-xs text-gray-400">{movie.genre}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const PlaceholderItem = ({ text, icon, isCollapsed }) => {
    const handleNotImplemented = () => {
        toast({
            title: "🚧 This feature isn't implemented yet!",
            description: "Content for Series and Anime is coming soon. You can request it next! 🚀",
        });
    };

    return (
        <motion.div
            onClick={handleNotImplemented}
            whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
            className="flex items-center gap-3 p-2 mx-2 rounded-lg cursor-pointer overflow-hidden"
        >
            <div className="w-12 h-16 bg-gray-800 rounded-md flex-shrink-0 flex items-center justify-center">
                {icon}
            </div>
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <p className="font-semibold text-sm text-white truncate">{text}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};


const RightSidebar = ({ isCollapsed, toggleCollapse, movies, onPlay, activeTopCategory, selectedMovie }) => {
  const content = useMemo(() => {
    if (activeTopCategory === 'Movies') {
      const newMovies = [...movies].sort((a, b) => b.year.localeCompare(a.year)).slice(0, 4);
      let relatedMovies = [];
      if (selectedMovie) {
        relatedMovies = movies.filter(m => m.genre === selectedMovie.genre && m.id !== selectedMovie.id);
      }
      const combined = [...newMovies, ...relatedMovies];
      const uniqueMovies = Array.from(new Map(combined.map(m => [m.id, m])).values());
      return uniqueMovies.map(movie => <MovieItem key={movie.id} movie={movie} onPlay={onPlay} isCollapsed={isCollapsed} />);
    }
    
    if (activeTopCategory === 'Series' || activeTopCategory === 'Anime') {
        return (
            <>
                <PlaceholderItem text="Seasons" icon={<ListVideo className="text-gray-500" />} isCollapsed={isCollapsed} />
                <PlaceholderItem text="Episodes" icon={<Tv className="text-gray-500" />} isCollapsed={isCollapsed} />
                <PlaceholderItem text="Related" icon={<Film className="text-gray-500" />} isCollapsed={isCollapsed} />
            </>
        );
    }

    return null;
  }, [activeTopCategory, movies, onPlay, isCollapsed, selectedMovie]);

  const title = activeTopCategory === 'Movies' ? 'Up Next' : activeTopCategory;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '4rem' : '20rem' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 right-0 h-full bg-slate-900/80 backdrop-blur-lg border-l border-purple-500/20 flex flex-col z-50"
    >
      <div className="relative flex-1 flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-purple-500/20 h-[69px]">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-semibold text-white"
              >
                {title}
              </motion.h3>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 py-4 overflow-y-auto sidebar-scroll space-y-2">
          {content}
        </div>

        <button
          onClick={toggleCollapse}
          className="absolute top-1/2 -left-4 transform -translate-y-1/2 w-8 h-8 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg z-10"
        >
          {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default RightSidebar;