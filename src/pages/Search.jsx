import React, { useState, useEffect, useContext } from 'react';
import { PiMagnifyingGlass, PiSliders, PiX, PiPlayCircle, PiPauseCircle, PiHeart, PiHeartFill, PiPlus, PiClockCounterClockwise } from 'react-icons/pi';
import { LibraryContext } from '../contexts/LibraryContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Search.css';
import { songs, searchSongs, genres, categories } from '../data';

const Search = () => {
  const navigate = useNavigate();
  const { addToLibrary, removeFromLibrary, likedSongs, setLikedSongs } = useContext(LibraryContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    genre: 'all',
    year: 'all',
    duration: 'all',
    sortBy: 'relevance'
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  // Use categories from data.js
  const categoryOptions = [
    { id: 'all', name: 'All' },
    { id: categories.MOVIES, name: 'Movies' },
    { id: categories.ALBUMS, name: 'Albums' },
    { id: categories.PLAYLISTS, name: 'Playlists' },
    { id: categories.GENRES, name: 'Genres' }
  ];

  // Use genres from data.js
  const genreOptions = ['All', ...Object.values(genres)];

  const years = [
    'All', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'
  ];

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      // Use the searchSongs function from data.js
      const results = searchSongs(searchQuery);
      
      // Apply filters
      let filteredResults = results;
      
      if (filters.genre !== 'all') {
        filteredResults = filteredResults.filter(song => song.genre === filters.genre);
      }
      
      if (filters.year !== 'all') {
        filteredResults = filteredResults.filter(song => song.year.toString() === filters.year);
      }
      
      // Sort results
      if (filters.sortBy === 'relevance') {
        // Results are already sorted by relevance from searchSongs
      } else if (filters.sortBy === 'title') {
        filteredResults.sort((a, b) => a.title.localeCompare(b.title));
      } else if (filters.sortBy === 'artist') {
        filteredResults.sort((a, b) => a.artist.localeCompare(b.artist));
      } else if (filters.sortBy === 'year') {
        filteredResults.sort((a, b) => b.year - a.year);
      }
      
      setSearchResults(filteredResults);
      setIsSearching(false);
      
      // Save to recent searches
      if (!recentSearches.includes(searchQuery)) {
        const updatedSearches = [searchQuery, ...recentSearches].slice(0, 5);
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      }
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, filters]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handlePlayPause = (song) => {
    setCurrentlyPlaying(song);
    // Implement play/pause functionality
  };

  const handleAddToLibrary = (song) => {
    addToLibrary(song);
  };

  const handleRemoveFromLibrary = (song) => {
    removeFromLibrary(song);
  };

  const handleLikeSong = async (song) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.error('User email not found');
        return;
      }

      const isCurrentlyLiked = likedSongs.some(s => s.id === song.id);
      
      // Prepare the song data
      const songData = {
        songId: parseInt(song.id),
        songTitle: song.title,
        artist: song.artist,
        movieName: song.movieName || '',
        imageUrl: song.image,
        audioSrc: song.audioSrc
      };

      // Make API call to toggle like status
      const response = await fetch('/api/liked-songs/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...songData,
          userEmail: userEmail
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like status');
      }

      // Update local state
      if (isCurrentlyLiked) {
        setLikedSongs(prev => prev.filter(s => s.id !== song.id));
      } else {
        setLikedSongs(prev => [...prev, song]);
      }
    } catch (error) {
      console.error('Error toggling like status:', error);
    }
  };

  const isSongLiked = (songId) => {
    return likedSongs.some(song => song.id === songId);
  };

  // Add toast notification function
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `download-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const clearFilters = () => {
    setFilters({
      genre: 'all',
      year: 'all',
      duration: 'all',
      sortBy: 'relevance'
    });
  };

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <div className="search-loading">
          <div className="spinner"></div>
          <p>Searching...</p>
        </div>
      );
    }

    if (searchQuery && searchResults.length === 0) {
      return (
        <div className="no-results">
          <h3>No results found for "{searchQuery}"</h3>
          <p>Try different keywords or check your spelling</p>
        </div>
      );
    }

    if (searchResults.length > 0) {
      return (
        <div className="search-results">
          {searchResults.map(song => (
            <div key={song.id} className="song-item">
              <div className="song-info">
                <img src={song.image} alt={song.title} />
                <div className="song-details">
                  <h3>{song.title}</h3>
                  <p className="artist-name" style={{ color: 'green', cursor: 'pointer' }}>{song.artist}</p>
                  <p className="song-meta">
                    {song.album} • {song.year}
                  </p>
                </div>
              </div>
              <div className="song-actions">
                <button 
                  className="play-button"
                  onClick={() => handlePlayPause(song)}
                >
                  {currentlyPlaying?.id === song.id ? <PiPauseCircle /> : <PiPlayCircle />}
                </button>
                <button 
                  className={`like-button ${isSongLiked(song.id) ? 'liked' : ''}`}
                  onClick={() => handleLikeSong(song)}
                  title={isSongLiked(song.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isSongLiked(song.id) ? <PiHeartFill /> : <PiHeart />}
                </button>
                <button className="add-button">
                  <PiPlus />
                </button>
                <span className="duration">{song.duration}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (recentSearches.length > 0) {
      return (
        <div className="recent-searches">
          <h3>Recent Searches</h3>
          <div className="recent-list">
            {recentSearches.map((search, index) => (
              <div 
                key={index} 
                className="recent-item"
                onClick={() => handleSearch(search)}
              >
                <PiClockCounterClockwise />
                <span>{search}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="search-suggestions">
        <h3>Try searching for</h3>
        <div className="suggestion-tags">
          {Object.values(genres).slice(0, 5).map((genre, index) => (
            <button 
              key={index}
              className="suggestion-tag"
              onClick={() => handleSearch(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-bar">
          <PiMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder="Search songs, artists, albums, or playlists"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-button" onClick={clearSearch}>
              <PiX />
            </button>
          )}
        </div>
        
        <button 
          className={`filter-button ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <PiSliders />
          <span>Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Genre</label>
            <select 
              value={filters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
            >
              {genreOptions.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Year</label>
            <select 
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort By</label>
            <select 
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="title">Title</option>
              <option value="artist">Artist</option>
              <option value="year">Year</option>
            </select>
          </div>
          
          <button className="clear-filters" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      )}

      <div className="search-content">
        {renderSearchResults()}
      </div>
    </div>
  );
};

export default Search; 