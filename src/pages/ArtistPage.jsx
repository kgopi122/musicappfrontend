import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaPlus, FaCheck, FaMusic, FaCalendarAlt, FaLanguage, FaFilter, FaSort, FaSearch } from 'react-icons/fa';
import { PlayerContext } from '../PlayerContext';
import { getSongsByArtist } from '../data';
import './ArtistPage.css';

const ArtistPage = () => {
  const { artistName } = useParams();
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, pauseSong, setCurrentSong, setCurrentPlaylist } = useContext(PlayerContext);
  const [artistSongs, setArtistSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [artistInfo, setArtistInfo] = useState(null);
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [activeTab, setActiveTab] = useState('songs');
  const [sortBy, setSortBy] = useState('year');
  const [filterYear, setFilterYear] = useState('all');
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  useEffect(() => {
    const decodedArtistName = decodeURIComponent(artistName);
    const songs = getSongsByArtist(decodedArtistName);
    setArtistSongs(songs);
    setFilteredSongs(songs);

    if (songs.length > 0) {
      setArtistInfo({
        name: decodedArtistName,
        image: songs[0].artistImage,
        totalSongs: songs.length,
        genres: [...new Set(songs.map(song => song.genre))],
        languages: [...new Set(songs.map(song => song.language))],
        years: [...new Set(songs.map(song => song.year))].sort((a, b) => b - a)
      });
    }

    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      const likedSongsData = JSON.parse(localStorage.getItem(`likedSongs_${userEmail}`) || '[]');
      setLikedSongs(likedSongsData);
      const playlistData = JSON.parse(localStorage.getItem(`playlist_${userEmail}`) || '[]');
      setPlaylistSongs(playlistData);
    }
  }, [artistName]);

  useEffect(() => {
    let filtered = [...artistSongs];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.movieName.toLowerCase().includes(query)
      );
    }

    // Apply year filter
    if (filterYear !== 'all') {
      filtered = filtered.filter(song => song.year === parseInt(filterYear));
    }

    // Apply genre filter
    if (filterGenre !== 'all') {
      filtered = filtered.filter(song => song.genre === filterGenre);
    }

    // Apply language filter
    if (filterLanguage !== 'all') {
      filtered = filtered.filter(song => song.language === filterLanguage);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'year':
          return b.year - a.year;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return a.duration.localeCompare(b.duration);
        case 'movie':
          return a.movieName.localeCompare(b.movieName);
        default:
          return 0;
      }
    });

    setFilteredSongs(filtered);
  }, [artistSongs, searchQuery, filterYear, filterGenre, filterLanguage, sortBy]);

  const handlePlaySong = (song) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        pauseSong();
      } else {
        playSong(song);
      }
    } else {
      setCurrentSong(song);
      setCurrentPlaylist(artistSongs);
      playSong(song);
    }
  };

  const handleLikeSong = (song) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      showToastMessage('Please login to like songs', 'error');
      return;
    }

    const updatedLikedSongs = likedSongs.includes(song.id)
      ? likedSongs.filter(id => id !== song.id)
      : [...likedSongs, song.id];

    setLikedSongs(updatedLikedSongs);
    localStorage.setItem(`likedSongs_${userEmail}`, JSON.stringify(updatedLikedSongs));
    showToastMessage(
      likedSongs.includes(song.id) ? 'Removed from liked songs' : 'Added to liked songs',
      'success'
    );
  };

  const handleAddToPlaylist = (song) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      showToastMessage('Please login to add songs to playlist', 'error');
      return;
    }

    const isInPlaylist = playlistSongs.some(s => s.id === song.id);
    const updatedPlaylist = isInPlaylist
      ? playlistSongs.filter(s => s.id !== song.id)
      : [...playlistSongs, song];

    setPlaylistSongs(updatedPlaylist);
    localStorage.setItem(`playlist_${userEmail}`, JSON.stringify(updatedPlaylist));
    showToastMessage(
      isInPlaylist ? 'Removed from playlist' : 'Added to playlist',
      'success'
    );
  };

  const showToastMessage = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterYear('all');
    setFilterGenre('all');
    setFilterLanguage('all');
    setSortBy('year');
  };

  if (!artistInfo) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="artist-page">
      <div className="artist-header">
        <div className="artist-header-content">
          <div className="artist-image-container">
            <img src={artistInfo.image} alt={artistInfo.name} className="artist-image" />
          </div>
          <div className="artist-info">
            <h1>{artistInfo.name}</h1>
            <div className="artist-stats">
              <div className="stat">
                <FaMusic />
                <span>{artistInfo.totalSongs} Songs</span>
              </div>
              <div className="stat">
                <FaLanguage />
                <span>{artistInfo.languages.length} Languages</span>
              </div>
              <div className="stat">
                <FaCalendarAlt />
                <span>{artistInfo.years.length} Years</span>
              </div>
            </div>
            <div className="artist-genres">
              {artistInfo.genres.map(genre => (
                <span key={genre} className="genre-tag">{genre}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="artist-content">
        <div className="content-header">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'songs' ? 'active' : ''}`}
              onClick={() => setActiveTab('songs')}
            >
              Songs
            </button>
            <button 
              className={`tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
          </div>
          {activeTab === 'songs' && (
            <div className="view-controls">
              <button 
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button 
                className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
            </div>
          )}
        </div>

        {activeTab === 'songs' && (
          <div className="filters-section">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
              Filters
            </button>
            {showFilters && (
              <div className="filters-panel">
                <div className="filter-group">
                  <label>Sort by:</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="year">Year</option>
                    <option value="title">Title</option>
                    <option value="duration">Duration</option>
                    <option value="movie">Movie</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Year:</label>
                  <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                    <option value="all">All Years</option>
                    {artistInfo.years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Genre:</label>
                  <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
                    <option value="all">All Genres</option>
                    {artistInfo.genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Language:</label>
                  <select value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)}>
                    <option value="all">All Languages</option>
                    {artistInfo.languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <button className="clear-filters" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'songs' ? (
          <div className={`song-list ${viewMode}`}>
            {filteredSongs.length === 0 ? (
              <div className="no-results">
                <p>No songs found matching your filters</p>
                <button onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              filteredSongs.map(song => (
                <div 
                  key={song.id} 
                  className={`song-item ${currentSong?.id === song.id ? 'active' : ''}`}
                >
                  <div className="song-info" onClick={() => handlePlaySong(song)}>
                    <img src={song.image} alt={song.title} />
                    <div className="song-details">
                      <h3>{song.title}</h3>
                      <p>{song.movieName} • {song.year}</p>
                      <div className="song-meta">
                        <span className="genre">{song.genre}</span>
                        <span className="language">{song.language}</span>
                        <span className="duration">{song.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="song-controls">
                    <button 
                      className="control-button"
                      onClick={() => handlePlaySong(song)}
                    >
                      {currentSong?.id === song.id && isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <button 
                      className={`control-button ${likedSongs.includes(song.id) ? 'liked' : ''}`}
                      onClick={() => handleLikeSong(song)}
                    >
                      {likedSongs.includes(song.id) ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    <button 
                      className={`control-button ${playlistSongs.some(s => s.id === song.id) ? 'added' : ''}`}
                      onClick={() => handleAddToPlaylist(song)}
                    >
                      {playlistSongs.some(s => s.id === song.id) ? <FaCheck /> : <FaPlus />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="about-section">
            <div className="about-content">
              <h2>About {artistInfo.name}</h2>
              <div className="about-stats">
                <div className="stat-group">
                  <h3>Total Songs</h3>
                  <p>{artistInfo.totalSongs}</p>
                </div>
                <div className="stat-group">
                  <h3>Languages</h3>
                  <div className="language-list">
                    {artistInfo.languages.map(lang => (
                      <span key={lang} className="language-tag">{lang}</span>
                    ))}
                  </div>
                </div>
                <div className="stat-group">
                  <h3>Years Active</h3>
                  <div className="year-list">
                    {artistInfo.years.map(year => (
                      <span key={year} className="year-tag">{year}</span>
                    ))}
                  </div>
                </div>
                <div className="stat-group">
                  <h3>Genres</h3>
                  <div className="genre-list">
                    {artistInfo.genres.map(genre => (
                      <span key={genre} className="genre-tag">{genre}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showToast && (
        <div className={`toast ${toastType} ${showToast ? 'show' : ''}`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ArtistPage; 