import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  PiPlayFill, PiPauseFill, PiPlusCircleFill, PiDownloadSimple,
  PiHeartFill, PiSortAscending, PiSortDescending, PiMagnifyingGlass,
  PiShuffleSimple, PiRepeat, PiList
} from 'react-icons/pi';
import { requireAuth } from './utils/auth';
import './GenrePage.css';
import { LibraryContext } from './LibraryContext';
import { PlayerContext } from './PlayerContext';
import DownloadQualityDropdown from './components/DownloadQualityModal';

const GenrePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { genre } = location.state || {};
  const [durations, setDurations] = useState({});
  const [addedSongIndex, setAddedSongIndex] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('title');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [downloadPosition, setDownloadPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!requireAuth(navigate)) return;
  }, [navigate]);

  const { likedSongs, setLikedSongs, playlistSongs, setPlaylistSongs } = useContext(LibraryContext);
  const { 
    currentSong, 
    setCurrentSong, 
    isPlaying, 
    setIsPlaying, 
    handlePlayPause, 
    setCurrentPlaylist,
    audioRef
  } = useContext(PlayerContext);

  // Get unique artists and movies for filters
  const uniqueArtists = useMemo(() => {
    if (!genre?.songs) return [];
    return [...new Set(genre.songs.map(song => song.artist))];
  }, [genre?.songs]);

  const uniqueMovies = useMemo(() => {
    if (!genre?.songs) return [];
    return [...new Set(genre.songs.map(song => song.movieName))];
  }, [genre?.songs]);

  // Filter and sort songs
  const filteredAndSortedSongs = useMemo(() => {
    if (!genre?.songs) return [];

    let filtered = genre.songs.filter(song => {
      const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArtist = selectedArtists.length === 0 || selectedArtists.includes(song.artist);
      const matchesMovie = selectedMovies.length === 0 || selectedMovies.includes(song.movieName);
      return matchesSearch && matchesArtist && matchesMovie;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortBy]?.toLowerCase() || '';
      const bValue = b[sortBy]?.toLowerCase() || '';
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [genre?.songs, searchQuery, sortOrder, sortBy, selectedArtists, selectedMovies]);

  // Preload durations
  useEffect(() => {
    const loadDurations = async () => {
      const promises = genre?.songs.map((song, index) => {
        return new Promise((resolve) => {
          if (!song.audioSrc) {
            resolve({ index, duration: '--:--' });
            return;
          }

          const audio = new Audio();
          audio.preload = "metadata";

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

          const fixedPath = song.audioSrc.startsWith('/') ? song.audioSrc : `/${song.audioSrc}`;
          audio.src = fixedPath;
        });
      });

      const results = await Promise.all(promises);
      const newDurations = {};
      results.forEach(({ index, duration }) => {
        newDurations[index] = duration;
      });
      setDurations(newDurations);
    };

    if (genre?.songs) {
      loadDurations();
    }
  }, [genre]);

  // Handle song click
  const handleSongClick = (song, index) => {
    setCurrentSong(song);
    setIsPlaying(true);
    const playlist = isShuffled ? [...filteredAndSortedSongs].sort(() => Math.random() - 0.5) : filteredAndSortedSongs;
    setCurrentPlaylist(playlist);
    setAddedSongIndex(index);
  };

  // Handle add to playlist
  const handleAddToPlaylist = (song, index) => {
    setPlaylistSongs([...playlistSongs, song]);
    setAddedSongIndex(index);
    setTimeout(() => setAddedSongIndex(null), 2000);
  };

  // Handle like song
  const handleLikeSong = (song) => {
    if (isLiked(song)) {
      setLikedSongs(likedSongs.filter(s => s.id !== song.id));
    } else {
      setLikedSongs([...likedSongs, song]);
    }
  };

  // Handle shuffle toggle
  const handleShuffleToggle = () => {
    setIsShuffled(!isShuffled);
    if (currentSong) {
      const playlist = !isShuffled ? [...filteredAndSortedSongs].sort(() => Math.random() - 0.5) : filteredAndSortedSongs;
      setCurrentPlaylist(playlist);
    }
  };

  // Handle repeat toggle
  const handleRepeatToggle = () => {
    setIsRepeat(!isRepeat);
    if (audioRef.current) {
      audioRef.current.loop = !isRepeat;
    }
  };

  const isLiked = (song) => likedSongs.some(s => s.id === song.id);
  const isInPlaylist = (song) => playlistSongs.some(s => s.id === song.id);

  // Add handleDownload function
  const handleDownload = (song, event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setDownloadPosition({
      top: rect.top,
      left: rect.left + rect.width / 2
    });
    setSelectedSong(song);
    setShowQualityModal(true);
  };

  // Add handleQualitySelect function
  const handleQualitySelect = async (quality) => {
    setShowQualityModal(false);
    if (!selectedSong) return;

    try {
      showToast('Preparing download...', 'info');

      // Fetch the original audio file
      const response = await fetch(selectedSong.audioSrc);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Calculate target size in bytes
      const targetSize = parseSizeToBytes(quality.size);
      
      // Compress the audio to match the target size
      const compressedBuffer = await compressAudio(audioBuffer, targetSize);
      
      // Create WAV file
      const wavBlob = audioBufferToWav(compressedBuffer);
      
      // Verify the size
      if (Math.abs(wavBlob.size - targetSize) > 100) { // Allow 100 bytes tolerance
        throw new Error('Compressed file size does not match target size');
      }

      // Create download link
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedSong.title} - ${quality.label}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Download complete!', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showToast('Download failed. Please try again.', 'error');
    }
  };

  // Add helper functions for audio processing
  const parseSizeToBytes = (sizeStr) => {
    const units = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024
    };
    const [size, unit] = sizeStr.split(' ');
    return parseFloat(size) * units[unit];
  };

  const compressAudio = async (audioBuffer, targetSize) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;

    // Calculate the exact number of samples needed for target size
    const headerSize = 44; // WAV header size
    const bytesPerSample = 2; // 16-bit audio
    const availableSize = targetSize - headerSize;
    const totalSamples = Math.floor(availableSize / (numChannels * bytesPerSample));

    // Create a new buffer with exact size
    const newBuffer = new AudioBuffer({
      numberOfChannels: numChannels,
      length: totalSamples,
      sampleRate: sampleRate
    });

    // Calculate compression ratio
    const compressionRatio = totalSamples / length;

    // Process each channel
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      const newChannelData = newBuffer.getChannelData(channel);

      // Resample and compress
      for (let i = 0; i < totalSamples; i++) {
        const originalIndex = Math.floor(i / compressionRatio);
        const sample = channelData[originalIndex];
        // Apply compression while maintaining audio integrity
        newChannelData[i] = Math.max(-1, Math.min(1, sample));
      }
    }

    return newBuffer;
  };

  const audioBufferToWav = (buffer) => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = buffer.length * blockAlign;
    const totalSize = 44 + dataSize; // Header + Data

    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio data
    const offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = buffer.getChannelData(channel)[i];
        const val = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset + (i * blockAlign) + (channel * bytesPerSample), val, true);
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Add showToast function
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

  if (!genre) {
    return <div>Genre not found</div>;
  }

  return (
    <div id="genrePage">
      <div id="genrePage-main-content">
        <div id="genrePage-details">
          <div className="background-video-container">
            {!videoLoaded && <div className="video-loading">Loading video...</div>}
            <video
              src={genre.video || '/videos/default-music-bg.mp4'}
              className={`background-video ${videoLoaded ? 'loaded' : ''}`}
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setCurrentVideo('/videos/default-music-bg.mp4')}
            />
            <div className="video-overlay"></div>
          </div>
          <div id="genrePage-details-container">
            <div className="genre-details-main">
              <div className="genrePage-image-container">
                <img src={genre.image} alt={genre.name} />
              </div>
              <div id="genrePage-info">
                <h2>{genre.name}</h2>
                <p className="genre-description">{genre.description || 'Explore the best songs in this genre'}</p>
                <p className="song-count">{genre.songs.length} Songs</p>
                <div className="genre-controls">
                  <button 
                    className={`control-button ${isShuffled ? 'active' : ''}`}
                    onClick={handleShuffleToggle}
                    title="Shuffle"
                  >
                    <PiShuffleSimple />
                  </button>
                  <button 
                    className={`control-button ${isRepeat ? 'active' : ''}`}
                    onClick={handleRepeatToggle}
                    title="Repeat"
                  >
                    <PiRepeat />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="genre-songs">
          <div className="genre-songs-header">
            <h3>Songs in {genre.name}</h3>
            <div className="genre-songs-controls">
              <div className="search-bar">
                <PiMagnifyingGlass className="search-icon" />
                <input
                  type="text"
                  placeholder="Search songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                className="filter-button"
                onClick={() => setShowFilters(!showFilters)}
              >
                <PiList />
                Filters
              </button>
              <div className="sort-controls">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="title">Title</option>
                  <option value="artist">Artist</option>
                  <option value="movieName">Movie</option>
                </select>
                <button 
                  className="sort-button"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <PiSortAscending /> : <PiSortDescending />}
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-section">
                <h4>Artists</h4>
                <div className="filter-options">
                  {uniqueArtists.map(artist => (
                    <label key={artist} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedArtists.includes(artist)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedArtists([...selectedArtists, artist]);
                          } else {
                            setSelectedArtists(selectedArtists.filter(a => a !== artist));
                          }
                        }}
                      />
                      {artist}
                    </label>
                  ))}
                </div>
              </div>
              <div className="filter-section">
                <h4>Movies</h4>
                <div className="filter-options">
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
            </div>
          )}

          <div className="genre-songs-list">
            {filteredAndSortedSongs.map((song, index) => (
              <div 
                key={song.id}
                className={`genre-song-item ${currentSong?.id === song.id ? 'selected-song' : ''}`}
                onClick={() => handleSongClick(song, index)}
              >
                <div className="genre-song-info">
                  <img src={song.image} alt={song.title} />
                  <div>
                    <h4>{song.title}</h4>
                    <p className="artist-name" style={{ color: 'green', cursor: 'pointer' }}>{song.artist}</p>
                    <p className="movie-name">{song.movieName}</p>
                  </div>
                </div>
                <div className="add-download">
                  <button 
                    className={`control-button-like ${isLiked(song) ? 'liked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeSong(song);
                    }}
                    title={isLiked(song) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <PiHeartFill />
                  </button>
                  <button 
                    className={`song-action-button ${isInPlaylist(song) ? 'added' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlaylist(song, index);
                    }}
                    title={isInPlaylist(song) ? "Remove from playlist" : "Add to playlist"}
                  >
                    <PiPlusCircleFill />
                  </button>
                  <button 
                    className="song-action-button"
                    onClick={(e) => handleDownload(song, e)}
                    title="Download"
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

      {/* Add Download Quality Modal */}
      <DownloadQualityDropdown
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        onQualitySelect={handleQualitySelect}
        song={selectedSong}
        position={downloadPosition}
      />
    </div>
  );
};

export default GenrePage;
