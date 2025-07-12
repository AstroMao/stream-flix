import React from 'react';
import { motion } from 'framer-motion';
import { Film, Clapperboard, Languages, Calendar, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Sci-Fi',
  'Romance',
  'Documentary',
  'Thriller'
];
const LANGUAGES = ['English', 'Spanish', 'Japanese', 'French', 'Korean'];
const YEARS = ['2025', '2024', '2023', '2022', '2021', 'Older'];

const FilterSection = ({ title, icon, children }) => (
  <div className="mb-6">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-3 px-4">
      {icon} {title}
    </h3>
    <div className="space-y-1">{children}</div>
  </div>
);

const FilterButton = ({ label, isSelected, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
      isSelected 
        ? 'bg-purple-600/30 text-purple-300 font-semibold' 
        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
    }`}
  >
    {label}
    {isSelected && <motion.div layoutId="selected-filter-dot" className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
  </button>
);

const Sidebar = ({ selectedGenre, setSelectedGenre, selectedYear, setSelectedYear, selectedLanguage, setSelectedLanguage }) => {
  const handleNotImplemented = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 4000,
    });
  }
  return (
    <motion.aside 
      initial={{ x: -256 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed top-0 left-0 h-full w-64 bg-slate-900/80 backdrop-blur-lg border-r border-purple-500/20 hidden md:flex flex-col z-50"
    >
      <div className="p-6 flex items-center justify-center border-b border-purple-500/20">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent cursor-pointer"
        >
          StreamFlix
        </motion.div>
      </div>

      <div className="flex-1 py-6 overflow-y-auto sidebar-scroll">
        <FilterSection title="Genres" icon={<Clapperboard size={16} />}>
          <FilterButton label="All" isSelected={selectedGenre === 'All'} onClick={() => setSelectedGenre('All')} />
          {GENRES.map(genre => (
            <FilterButton key={genre} label={genre} isSelected={selectedGenre === genre} onClick={() => setSelectedGenre(genre)} />
          ))}
        </FilterSection>

        <FilterSection title="Language" icon={<Languages size={16} />}>
            <FilterButton label="All" isSelected={selectedLanguage === 'All'} onClick={() => setSelectedLanguage('All')} />
            {LANGUAGES.map(lang => (
                <FilterButton key={lang} label={lang} isSelected={selectedLanguage === lang} onClick={handleNotImplemented} />
            ))}
        </FilterSection>

        <FilterSection title="Year" icon={<Calendar size={16} />}>
            <FilterButton label="All" isSelected={selectedYear === 'All'} onClick={() => setSelectedYear('All')} />
            {YEARS.map(year => (
                <FilterButton key={year} label={year} isSelected={selectedYear === year} onClick={handleNotImplemented} />
            ))}
        </FilterSection>
      </div>

      <div className="p-4 border-t border-purple-500/20 mt-auto">
        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/30">
          <Star size={16} /> Go Premium
        </button>
      </div>
    </motion.aside>
  );
};

// Deleting this file as it's replaced by LeftSidebar.jsx
// I am keeping the content here just in case, but the file path change indicates deletion.
// The new component is LeftSidebar.jsx which is almost identical but has collapsible features.
// To be safe, I'll create a new file `LeftSidebar.jsx` and the system should handle the old `Sidebar.jsx`
// as unused. I cannot delete files. I will just create LeftSidebar and let the system figure it out.

export default Sidebar;
