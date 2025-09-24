import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  PiPlayFill, PiPauseFill, PiPlusCircleFill, PiDownloadSimple,
  PiSkipBackFill, PiSkipForwardFill, PiShuffleFill, PiRepeatFill, PiHeartFill,
  PiMagnifyingGlass, PiSortAscending, PiSortDescending, PiFunnel
} from 'react-icons/pi';
import { requireAuth } from './utils/auth';

import './ArtistPage.css';
import './Playbar.css';
import Header from './header';
import { LibraryContext } from './LibraryContext';
import { PlayerContext } from './PlayerContext';
import { songs } from './data';

const ArtistPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { artist: initialArtist } = location.state || {};
  const [durations, setDurations] = useState({});
  const [addedSongIndex, setAddedSongIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('title');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('/videos/default-music-bg.mp4');

  const { likedSongs, setLikedSongs, playlistSongs, setPlaylistSongs } = useContext(LibraryContext);
  const { 
    currentSong, 
    setCurrentSong, 
    isPlaying, 
    setIsPlaying, 
    handlePlayPause, 
    handleNext, 
    handlePrevious,
    setCurrentPlaylist,
    audioRef
  } = useContext(PlayerContext);

  // Get unique movies for filtering
  const uniqueMovies = useMemo(() => {
    const movies = new Set(initialArtist?.songs?.map(song => song.movieName) || []);
    return Array.from(movies);
  }, [initialArtist]);

  // Filter and sort songs
  const filteredAndSortedSongs = useMemo(() => {
    if (!initialArtist?.songs) return [];

    let filtered = [...initialArtist.songs];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.movieName.toLowerCase().includes(query)
      );
    }

    // Apply movie filters
    if (selectedMovies.length > 0) {
      filtered = filtered.filter(song => 
        selectedMovies.includes(song.movieName)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'movie':
          comparison = a.movieName.localeCompare(b.movieName);
          break;
        case 'year':
          comparison = a.year - b.year;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [initialArtist, searchQuery, selectedMovies, sortBy, sortOrder]);

  // Preload durations
  useEffect(() => {
    const loadDurations = async () => {
      const promises = filteredAndSortedSongs.map((song, index) => {
        return new Promise((resolve) => {
          if (!song.audioSrc) {
            resolve({ index, duration: '--:--' });
            return;
          }

          const audio = new Audio();
          audio.preload = "metadata";
          audio.crossOrigin = 'anonymous';

          const timeoutId = setTimeout(() => {
            resolve({ index, duration: song.duration || '--:--' });
          }, 3000);

          audio.addEventListener('loadedmetadata', () => {
            clearTimeout(timeoutId);
            resolve({ 
              index, 
              duration: `${Math.floor(audio.duration / 60)}:${String(Math.floor(audio.duration % 60)).padStart(2, '0')}` 
            });
          });

          audio.addEventListener('error', () => {
            clearTimeout(timeoutId);
            console.error(`Error loading audio for ${song.title}`);
            resolve({ index, duration: song.duration || '--:--' });
          });

          // Use the audio source path directly (Azure Storage URLs are already correct)
          audio.src = song.audioSrc;
        });
      });

      const results = await Promise.all(promises);
      const newDurations = {};
      results.forEach(({ index, duration }) => {
        newDurations[index] = duration;
      });
      setDurations(newDurations);
    };

    loadDurations();
  }, [filteredAndSortedSongs]);

  const handleSongClick = (song, index) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentPlaylist(filteredAndSortedSongs);
  };

  const handleAddToPlaylist = (song, index) => {
    setPlaylistSongs([...playlistSongs, song]);
    setAddedSongIndex(index);
    setTimeout(() => setAddedSongIndex(null), 2000);
  };

  const handleLikeSong = (song) => {
    if (isLiked(song)) {
      setLikedSongs(likedSongs.filter(s => s.id !== song.id));
    } else {
      setLikedSongs([...likedSongs, song]);
    }
  };

  const isLiked = (song) => likedSongs.some(s => s.id === song.id);
  const isInPlaylist = (song) => playlistSongs.some(s => s.id === song.id);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleVideoError = (e) => {
    console.error('Video error:', e);
    setCurrentVideo('/videos/default-music-bg.mp4');
  };

  if (!initialArtist) {
    return <div>Artist not found</div>;
  }

  return (
    <div id="artistPage">
      <div id="artistPage-main-content">
        <div id="artistPage-details">
          <div className="background-video-container">
            {!videoLoaded && <div className="video-loading">Loading video...</div>}
            <video
              src={currentVideo}
              className={`background-video ${videoLoaded ? 'loaded' : ''}`}
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
            />
            <div className="video-overlay"></div>
          </div>
          <div id="artistPage-details-container">
            <div className="artist-details-main">
              <div className="artistPage-image-container">
                <img src={initialArtist.image} alt={initialArtist.name} />
              </div>
              <div id="artistPage-info">
                <h2>{initialArtist.name}</h2>
                <p className="artist-stats">{filteredAndSortedSongs.length} Songs</p>
                <p className="artist-description">Popular Telugu Music Composer</p>
              </div>
            </div>
          </div>
        </div>

        <div className="artist-controls">
          <div className="control-button" onClick={() => setShuffle(!shuffle)}>
            <PiShuffleFill className={shuffle ? 'active' : ''} />
          </div>
          <div className="control-button" onClick={() => setRepeat(!repeat)}>
            <PiRepeatFill className={repeat ? 'active' : ''} />
          </div>
        </div>

        <div className="artist-songs-header">
          <div className="search-bar">
            <PiMagnifyingGlass />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sort-filter">
            <button 
              className="sort-button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <PiSortAscending /> : <PiSortDescending />}
            </button>
            <button 
              className="filter-button"
              onClick={() => setShowFilters(!showFilters)}
            >
              <PiFunnel />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-section">
              <h4>Movies</h4>
              {uniqueMovies.map(movie => (
                <label key={movie} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedMovies.includes(movie)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMovies([...selectedMovies, movie]);
                      } else {
                        setSelectedMovies(selectedMovies.filter(m => m !== movie));
                      }
                    }}
                  />
                  {movie}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="artist-songs-list">
          {filteredAndSortedSongs.map((song, index) => (
            <div 
              key={song.id}
              className={`artist-song-item ${currentSong?.id === song.id ? 'selected-song' : ''}`}
              onClick={() => handleSongClick(song, index)}
            >
              <div className="song-info">
                <img src={song.image} alt={song.title} />
                <div>
                  <h4>{song.title}</h4>
                  <p className="movie-name">{song.movieName}</p>
                </div>
              </div>
              <div className="song-actions">
                <button 
                  className={`control-button-like ${isLiked(song) ? 'liked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeSong(song);
                  }}
                >
                  <PiHeartFill />
                </button>
                <button 
                  className={`song-action-button ${isInPlaylist(song) ? 'added' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToPlaylist(song, index);
                  }}
                >
                  <PiPlusCircleFill />
                </button>
                <button 
                  className="song-action-button"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PiDownloadSimple />
                </button>
                <span className="duration">{durations[index] || '--:--'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistPage; 