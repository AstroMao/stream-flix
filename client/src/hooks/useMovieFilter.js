import { useState, useEffect } from 'react';

const useMovieFilter = (initialMovies) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [filteredMovies, setFilteredMovies] = useState(initialMovies);

  useEffect(() => {
    let movies = initialMovies;
    
    if (selectedGenre !== 'All') {
      movies = movies.filter(movie => movie.genre === selectedGenre);
    }
    
    // Add filtering for year, language, and country here once implemented
    // if (selectedYear !== 'All') { ... }
    // if (selectedLanguage !== 'All') { ... }
    // if (selectedCountry !== 'All') { ... }

    if (searchQuery) {
      movies = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredMovies(movies);
  }, [searchQuery, selectedGenre, selectedYear, selectedLanguage, selectedCountry, initialMovies]);

  return {
    filteredMovies,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    selectedYear,
    setSelectedYear,
    selectedLanguage,
    setSelectedLanguage,
    selectedCountry,
    setSelectedCountry
  };
};

export default useMovieFilter;