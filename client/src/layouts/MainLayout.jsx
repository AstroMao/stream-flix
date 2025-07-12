
import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import HeroSection from '@/components/HeroSection';
import MoviesGrid from '@/components/MoviesGrid';
import VideoPlayer from '@/components/VideoPlayer';
import useContent from '@/hooks/useContent';
import useMoviePlayer from '@/hooks/useMoviePlayer';
import MovieDetails from '@/components/MovieDetails';
import { motion, AnimatePresence } from 'framer-motion';

function MainLayout({ user, onShowLogin, onLogout }) {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTopCategory, setActiveTopCategory] = useState('Movies');

  // Fetch content from PocketBase
  const {
    movies,
    series,
    liveChannels,
    availableGenres,
    availableYears,
    channelCategories,
    loading,
    error,
    getContentByCategory,
    filterContent,
    searchContent,
    getStreamUrl
  } = useContent();

  const {
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
    setCurrentTime
  } = useMoviePlayer();

  // Get current content based on active category
  const currentContent = useMemo(() => {
    return getContentByCategory(activeTopCategory);
  }, [getContentByCategory, activeTopCategory]);

  // Apply filters to current content
  const filteredContent = useMemo(() => {
    let content = [...currentContent];

    // Apply text search if present
    if (searchQuery.trim()) {
      content = content.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    const filters = {
      genre: selectedGenre,
      year: selectedYear,
      category: selectedCategory
    };

    return filterContent(content, filters);
  }, [currentContent, searchQuery, selectedGenre, selectedYear, selectedCategory, filterContent]);

  // Get hero content (first movie or fallback)
  const heroContent = useMemo(() => {
    if (movies.length > 0) return movies[0];
    if (series.length > 0) return series[0];
    return null;
  }, [movies, series]);

  // Enhanced play handler that gets stream URL
  const handlePlayContent = async (content) => {
    try {
      const streamUrl = await getStreamUrl(content);
      if (streamUrl) {
        // Add stream URL to content object
        const contentWithStream = { ...content, streamUrl };
        handlePlayMovie(contentWithStream);
      } else {
        console.error('No stream URL available for content:', content);
      }
    } catch (error) {
      console.error('Error getting stream URL:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
      <Helmet>
        <title>StreamFlix - Premium Movie Streaming Platform</title>
        <meta name="description" content="Discover and stream the latest movies and TV shows in stunning quality. Your premium entertainment destination." />
      </Helmet>

      <div className="flex h-screen">
        <LeftSidebar 
          isCollapsed={isLeftSidebarCollapsed}
          toggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          availableGenres={availableGenres}
          availableYears={availableYears}
          channelCategories={channelCategories}
          activeTopCategory={activeTopCategory}
          user={user}
          onLogout={onLogout}
          onShowLogin={onShowLogin}
        />
        <main 
          className="flex-1 flex flex-col transition-all duration-300"
          style={{ 
            marginLeft: isLeftSidebarCollapsed ? '4rem' : '16rem',
            
          }}
        >
          <Header 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTopCategory={activeTopCategory}
            setActiveTopCategory={setActiveTopCategory}
            isLeftSidebarCollapsed={isLeftSidebarCollapsed}
            isRightSidebarCollapsed={isRightSidebarCollapsed}
          />
          
          <div className="flex-1 overflow-y-auto pt-20">
            <AnimatePresence mode="wait">
              {showPlayer && selectedMovie ? (
                <motion.div
                  key="player-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <VideoPlayer
                    movie={selectedMovie}
                    onClose={handleClosePlayer}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    isMuted={isMuted}
                    setIsMuted={setIsMuted}
                    currentTime={currentTime}
                    duration={duration}
                    setCurrentTime={setCurrentTime}
                  />
                  <MovieDetails movie={selectedMovie} />
                </motion.div>
              ) : (
                <motion.div
                  key="browse-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading content...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button 
                          onClick={() => window.location.reload()} 
                          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {heroContent && <HeroSection movie={heroContent} onPlay={handlePlayContent} />}
                      <div className="p-6">
                        {activeTopCategory === 'IPTV' ? (
                          <div>
                            <h2 className="text-2xl font-bold mb-6">Live TV Channels</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                              {filteredContent.map(channel => (
                                <div
                                  key={channel.id}
                                  className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-700/50 transition-colors cursor-pointer"
                                  onClick={() => handlePlayContent(channel)}
                                >
                                  <div className="aspect-square mb-3 bg-slate-700 rounded-lg overflow-hidden">
                                    <img
                                      src={channel.logo}
                                      alt={channel.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <h3 className="font-semibold text-sm text-white mb-1">{channel.name}</h3>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">{channel.category}</span>
                                    {channel.isHd && (
                                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">HD</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <MoviesGrid movies={filteredContent} onPlay={handlePlayContent} />
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}

export default MainLayout;
