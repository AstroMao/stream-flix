
import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const TOP_CATEGORIES = ['Movies', 'Series', 'IPTV'];

const Header = ({ searchQuery, setSearchQuery, activeTopCategory, setActiveTopCategory, isLeftSidebarCollapsed, isRightSidebarCollapsed }) => {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 right-0 z-40 bg-black/50 backdrop-blur-lg border-b border-purple-500/20 transition-all duration-300"
      style={{
        left: isLeftSidebarCollapsed ? '4rem' : '16rem',

      }}
    >
      <div className="w-full mx-auto px-6 py-4 flex items-center justify-between">
        <div className="hidden md:flex items-center space-x-8">
          {TOP_CATEGORIES.map(category => (
            <button 
              key={category}
              onClick={() => setActiveTopCategory(category)}
              className={`text-sm font-medium transition-colors relative ${activeTopCategory === category ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {category}
              {activeTopCategory === category && (
                <motion.div
                  layoutId="active-category-underline"
                  className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"
                />
              )}
            </button>
          ))}
        </div>
        
        <div className="flex-1 md:flex-none flex items-center justify-end space-x-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 w-full focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
