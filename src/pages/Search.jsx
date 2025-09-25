import React, { useState, useEffect, useContext } from 'react';
import { PiMagnifyingGlass, PiSliders, PiX, PiPlayCircle, PiPauseCircle, PiHeart, PiHeartFill, PiPlus, PiClockCounterClockwise } from 'react-icons/pi';
import { LibraryContext } from '../contexts/LibraryContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Search.css';
import { songsApi, mapBackendSongs } from '../api';

const Search = () => {
  const navigate = useNavigate();
  const { addToLibrary, removeFromLibrary, likedSongs, setLikedSongs } = useContext(LibraryContext);
  const [allSongs, setAllSongs] = useState([]);
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

  const categoryOptions = [
    { id: 'all', name: 'All' }
  ];

  const genreOptions = ['All'];

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
    let mounted = true;
    songsApi.getAll()
      .then(data => mounted && setAllSongs(mapBackendSongs(data)))
      .catch(err => {
        console.error('Failed to fetch songs:', err);
        if (mounted) setAllSongs([]);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const q = searchQuery.toLowerCase();
      let results = allSongs.filter(song => {
        const searchableText = `${song.title} ${song.artist} ${song.movieName} ${song.genre} ${song.year}`.toLowerCase();
        return q.split(' ').every(term => searchableText.includes(term));
      });

      if (filters.genre !== 'all') {
        results = results.filter(song => song.genre === filters.genre);
      }
      if (filters.year !== 'all') {
        results = results.filter(song => String(song.year) === filters.year);
      }

      if (filters.sortBy === 'title') {
        results.sort((a, b) => a.title.localeCompare(b.title));
      } else if (filters.sortBy === 'artist') {
        results.sort((a, b) => a.artist.localeCompare(b.artist));
      } else if (filters.sortBy === 'year') {
        results.sort((a, b) => b.year - a.year);
      }

      setSearchResults(results);
      setIsSearching(false);

      if (!recentSearches.includes(searchQuery)) {
        const updatedSearches = [searchQuery, ...recentSearches].slice(0, 5);
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      }
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, filters, allSongs]);

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

      const songData = {
        songId: parseInt(song.id),
        songTitle: song.title,
        artist: song.artist,
        movieName: song.movieName || '',
        imageUrl: song.image,
        audioSrc: song.audioSrc
      };

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

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `download-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
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
                    {song.movieName} • {song.year}
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
        <div className="suggestion-tags"></div>
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
              {['All', ...Array.from(new Set(allSongs.map(s => s.genre).filter(Boolean)))].map(genre => (
                <option key={genre} value={genre === 'All' ? 'all' : genre}>{genre}</option>
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
          
          <button className="clear-filters" onClick={clearSearch}>
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