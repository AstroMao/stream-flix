import React from 'react';
import { motion } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const HeroSection = ({ movie, onPlay }) => {
  const handleGetInfo = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 4000,
    });
  };

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-[60vh] md:h-[80vh] flex items-center justify-start overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
      <img 
        className="absolute inset-0 w-full h-full object-cover"
        alt="Epic space battle scene with starships"
       src="https://images.unsplash.com/photo-1687293342106-bcfaa9576068" />
      
      <div className="relative z-20 max-w-4xl px-6 md:px-12 text-left">
        <motion.h1 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
        >
          {movie.title}
        </motion.h1>
        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl"
        >
          {movie.description}
        </motion.p>
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-start"
        >
          <Button 
            onClick={() => onPlay(movie)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <Play className="w-5 h-5" />
            Play Now
          </Button>
          <Button 
            onClick={handleGetInfo}
            variant="outline" 
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-8 py-3 rounded-full text-lg font-semibold flex items-center gap-2"
          >
            <Info className="w-5 h-5" />
            More Info
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;