
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Clapperboard, Calendar, Star, ChevronLeft, ChevronRight, Globe, ChevronDown, User, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const COUNTRIES = ['USA', 'India', 'UK', 'Canada', 'Australia'];

const CollapsibleFilterSection = ({ title, icon, isCollapsed, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-2">
      <AnimatePresence>
        {!isCollapsed && (
          <motion.button
            initial={false}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-400 mb-2 px-4 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              {icon} {title}
            </span>
            <ChevronDown size={16} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </motion.button>
        )}
      </AnimatePresence>
      {isCollapsed && <div className="px-4 mb-3 text-gray-400">{icon}</div>}
      <AnimatePresence>
        {isOpen && !isCollapsed && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pl-2 pr-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterButton = ({ label, isSelected, onClick, isCollapsed }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
      isSelected ? 'bg-purple-600/30 text-purple-300 font-semibold' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
    }`}
  >
    <AnimatePresence>
      {!isCollapsed && (
        <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
        >
            {label}
        </motion.span>
      )}
    </AnimatePresence>
    {isSelected && (
      isCollapsed ? 
      <motion.div layoutId="selected-filter-dot-collapsed" className="w-1.5 h-1.5 rounded-full bg-purple-400" /> :
      <motion.div layoutId="selected-filter-dot" className="w-1.5 h-1.5 rounded-full bg-purple-400" />
    )}
  </button>
);

const LeftSidebar = ({ isCollapsed, toggleCollapse, selectedGenre, setSelectedGenre, selectedYear, setSelectedYear, selectedLanguage, setSelectedLanguage, selectedCountry, setSelectedCountry, user, onLogout, onShowLogin, availableGenres = ['All'], availableYears = ['All'], channelCategories = ['All'], activeTopCategory = 'Movies', selectedCategory, setSelectedCategory }) => {
  const handleNotImplemented = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 4000,
    });
  }
  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? '4rem' : '16rem' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 h-full bg-slate-900/80 backdrop-blur-lg border-r border-purple-500/20 flex flex-col z-50"
    >
      <div className={`p-4 flex items-center border-b border-purple-500/20 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent cursor-pointer"
        >
          {isCollapsed ? 'S' : 'StreamFlix'}
        </motion.div>
      </div>

      <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden sidebar-scroll">
        {activeTopCategory === 'IPTV' ? (
          // IPTV-specific filters
          <CollapsibleFilterSection title="Categories" icon={<Clapperboard size={16} />} isCollapsed={isCollapsed}>
            <FilterButton label="All" isSelected={selectedCategory === 'All'} onClick={() => setSelectedCategory && setSelectedCategory('All')} isCollapsed={isCollapsed} />
            {channelCategories.filter(cat => cat !== 'All').map(category => (
              <FilterButton key={category} label={category} isSelected={selectedCategory === category} onClick={() => setSelectedCategory && setSelectedCategory(category)} isCollapsed={isCollapsed}/>
            ))}
          </CollapsibleFilterSection>
        ) : (
          // Movies and Series filters
          <>
            <CollapsibleFilterSection title="Genres" icon={<Clapperboard size={16} />} isCollapsed={isCollapsed}>
              <FilterButton label="All" isSelected={selectedGenre === 'All'} onClick={() => setSelectedGenre('All')} isCollapsed={isCollapsed} />
              {availableGenres.filter(genre => genre !== 'All').map(genre => (
                <FilterButton key={genre} label={genre} isSelected={selectedGenre === genre} onClick={() => setSelectedGenre(genre)} isCollapsed={isCollapsed}/>
              ))}
            </CollapsibleFilterSection>

            <CollapsibleFilterSection title="Year" icon={<Calendar size={16} />} isCollapsed={isCollapsed}>
                <FilterButton label="All" isSelected={selectedYear === 'All'} onClick={() => setSelectedYear('All')} isCollapsed={isCollapsed} />
                {availableYears.filter(year => year !== 'All').map(year => (
                    <FilterButton key={year} label={year} isSelected={selectedYear === year} onClick={() => setSelectedYear(year)} isCollapsed={isCollapsed} />
                ))}
            </CollapsibleFilterSection>

            <CollapsibleFilterSection title="Country" icon={<Globe size={16} />} isCollapsed={isCollapsed}>
                <FilterButton label="All" isSelected={selectedCountry === 'All'} onClick={() => setSelectedCountry('All')} isCollapsed={isCollapsed} />
                {COUNTRIES.map(country => (
                    <FilterButton key={country} label={country} isSelected={selectedCountry === country} onClick={handleNotImplemented} isCollapsed={isCollapsed} />
                ))}
            </CollapsibleFilterSection>
          </>
        )}
      </div>

      <div className="p-2 border-t border-purple-500/20 mt-auto">
        {user ? (
          <div className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0 flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex-1 overflow-hidden">
                    <p className="font-semibold text-sm text-white truncate">{user.name || user.email}</p>
                    <p className="text-xs text-gray-400">Logged In</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.button onClick={onLogout} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-gray-400 hover:text-white">
                    <LogOut size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="p-2">
            {isCollapsed ? (
              <button
                onClick={onShowLogin}
                className="w-full p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                <User size={20} className="text-white" />
              </button>
            ) : (
              <Button
                onClick={onShowLogin}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 rounded-lg transition-all duration-300"
              >
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>
      <button
        onClick={toggleCollapse}
        className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg"
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </motion.aside>
  );
};

export default LeftSidebar;
