import React, { useState, useEffect, useContext, useRef } from 'react';
import './SearchPage.css';
import './SongPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faPlay, faPause, faHeart, faPlus, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { PiPlusCircleFill, PiDownloadSimple, PiHeart, PiHeartFill } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import './styles/Search.css';
import { PlayerContext } from './PlayerContext';
import { LibraryContext } from './LibraryContext';
import DownloadQualityDropdown from './components/DownloadQualityModal';
import { songsApi, mapBackendSongs } from './api';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [durations, setDurations] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [relatedSongs, setRelatedSongs] = useState([]);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);
  const [dropdownSuggestions, setDropdownSuggestions] = useState([]);
  const [dropdownActiveIndex, setDropdownActiveIndex] = useState(-1);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [downloadPosition, setDownloadPosition] = useState({ top: 0, left: 0 });

  const navigate = useNavigate();
  
  const { 
    currentSong, 
    setCurrentSong, 
    isPlaying, 
    setIsPlaying, 
    setCurrentPlaylist,
    handlePlayPause
  } = useContext(PlayerContext);
  
  const { 
    likedSongs, 
    setLikedSongs, 
    playlistSongs, 
    setPlaylistSongs,
    userId 
  } = useContext(LibraryContext);

  useEffect(() => {
    let mounted = true;
    songsApi.getAll()
      .then(data => mounted && setAllSongs(mapBackendSongs(data)))
      .catch(() => mounted && setAllSongs([]));
    return () => { mounted = false; };
  }, []);

  const getAllSongsIncludingRecommended = () => {
    return [...allSongs];
  };

  useEffect(() => {
    setSearchResults(getAllSongsIncludingRecommended());
  }, [allSongs]);

  const calculateTextWidth = (text) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    let font = '16px inherit';
    if (inputRef.current) {
      const computed = window.getComputedStyle(inputRef.current);
      font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
    }
    context.font = font;
    return context.measureText(text).width;
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsLoading(true);
    const textWidth = calculateTextWidth(query);
    document.documentElement.style.setProperty('--input-width', `${textWidth}px`);

    if (query.trim() === '') {
      setSuggestion('');
      setSearchResults(getAllSongsIncludingRecommended());
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const all = getAllSongsIncludingRecommended();
      const filtered = all.filter(song => {
        const searchableText = `${song.title} ${song.artist} ${song.movieName || ''} ${song.genre || ''}`.toLowerCase();
        return searchableText.includes(query.toLowerCase());
      });
      setSearchResults(filtered);
      setSuggestion('');
      setIsLoading(false);
    }, 300);
  };

  const handleSuggestionClick = () => {
    if (suggestion) {
      const fullSuggestion = searchQuery + suggestion;
      setSearchQuery(fullSuggestion);
      handleSearch(fullSuggestion);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setSuggestion('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSongClick = (song) => {
    setCurrentSong(song);
    setCurrentPlaylist(searchResults);
    setIsPlaying(true);
    const all = getAllSongsIncludingRecommended();
    const related = all.filter(s => 
      s.id !== song.id &&
      ((s.movieName && song.movieName && s.movieName === song.movieName) ||
       (s.genre && song.genre && s.genre === song.genre))
    );
    setRelatedSongs(related);
  };

  const checkUserLoggedIn = () => {
    if (!userId) {
      showToast('Please log in to use this feature', 'error');
      return false;
    }
    return true;
  };

  const toggleFavorite = async (song) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.error('User email not found');
        return;
      }
      const isCurrentlyLiked = likedSongs.some(s => s.id === song.id);
      if (isCurrentlyLiked) {
        setLikedSongs(prev => prev.filter(s => s.id !== song.id));
      } else {
        setLikedSongs(prev => [...prev, song]);
      }
      const updatedLikedSongs = isCurrentlyLiked
        ? likedSongs.filter(s => s.id !== song.id)
        : [...likedSongs, song];
      localStorage.setItem(`musicapp_${userEmail}_likedSongs`, JSON.stringify(updatedLikedSongs));
      const updatedResults = searchResults.map(s => 
        s.id === song.id ? { ...s, isLiked: !isCurrentlyLiked } : s
      );
      setSearchResults(updatedResults);
      showToast(
        isCurrentlyLiked ? 'Removed from favorites' : 'Added to favorites',
        'success'
      );
    } catch (error) {
      console.error('Error toggling like status:', error);
      showToast('Failed to update favorite status', 'error');
      setLikedSongs(likedSongs);
    }
  };

  const addToPlaylist = async (song) => {
    if (!checkUserLoggedIn()) return;
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        showToast('Please log in to add songs to playlist', 'error');
        return;
      }
      const isInPlaylist = playlistSongs.some(s => s.id === song.id);
      if (isInPlaylist) {
        showToast('Song is already in your playlist', 'info');
        return;
      }
      const songWithTimestamp = {
        ...song,
        addedAt: new Date().toISOString()
      };
      setPlaylistSongs(prev => [...prev, songWithTimestamp]);
      const updatedPlaylist = [...playlistSongs, songWithTimestamp];
      localStorage.setItem(`musicapp_${userEmail}_playlistSongs`, JSON.stringify(updatedPlaylist));
      showToast('Added to playlist successfully', 'success');
      const updatedResults = searchResults.map(s => 
        s.id === song.id ? { ...s, isInPlaylist: true } : s
      );
      setSearchResults(updatedResults);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      showToast('Failed to add song to playlist', 'error');
    }
  };

  useEffect(() => {
    searchResults.forEach((song, index) => {
      const audio = new Audio(song.audioSrc);
      audio.onloadedmetadata = () => {
        setDurations(prev => ({
          ...prev,
          [index]: `${Math.floor(audio.duration / 60)}:${String(Math.floor(audio.duration % 60)).padStart(2, '0')}`
        }));
      };
    });
  }, [searchResults]);

  useEffect(() => {
    if (!searchQuery) {
      setDropdownSuggestions([]);
      setDropdownActiveIndex(-1);
      return;
    }
    const all = getAllSongsIncludingRecommended();
    const queryLower = searchQuery.toLowerCase();
    const allFields = all.flatMap(song => [
      { type: 'title', value: song.title, song },
      { type: 'artist', value: song.artist, song },
      { type: 'movieName', value: song.movieName || '', song }
    ]);
    const filtered = allFields.filter(
      field => field.value && field.value.toLowerCase().includes(queryLower)
    );
    const unique = [];
    const seen = new Set();
    for (const item of filtered) {
      const key = item.type + ':' + item.value;
      if (!seen.has(key)) {
        unique.push(item);
        seen.add(key);
      }
    }
    const notExactMatch = unique.filter(item => item.value.toLowerCase() !== queryLower);
    setDropdownSuggestions(notExactMatch.slice(0, 5));
    setDropdownActiveIndex(-1);
  }, [searchQuery, allSongs]);

  const handleKeyDown = (e) => {
    if (dropdownSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setDropdownActiveIndex(idx => (idx + 1) % dropdownSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setDropdownActiveIndex(idx => (idx - 1 + dropdownSuggestions.length) % dropdownSuggestions.length);
      } else if (e.key === 'Enter' && dropdownActiveIndex >= 0) {
        e.preventDefault();
        setDropdownSuggestions([]);
        setDropdownActiveIndex(-1);
        const selected = dropdownSuggestions[dropdownActiveIndex];
        setSearchQuery(selected.value);
        handleSearch(selected.value);
        return;
      }
    }
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      const fullSuggestion = searchQuery + suggestion;
      setSearchQuery(fullSuggestion);
      handleSearch(fullSuggestion);
    }
  };

  const handleDropdownClick = (value) => {
    setDropdownSuggestions([]);
    setDropdownActiveIndex(-1);
    setSearchQuery(value);
    handleSearch(value);
  };

  const highlightMatch = (text, query) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return <>
      {text.slice(0, idx)}
      <span className="dropdown-highlight">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>;
  };

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
    const headerSize = 44;
    const bytesPerSample = 2;
    const availableSize = targetSize - headerSize;
    const totalSamples = Math.floor(availableSize / (numChannels * bytesPerSample));
    const newBuffer = new AudioBuffer({
      numberOfChannels: numChannels,
      length: totalSamples,
      sampleRate: sampleRate
    });
    const compressionRatio = totalSamples / length;
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      const newChannelData = newBuffer.getChannelData(channel);
      for (let i = 0; i < totalSamples; i++) {
        const originalIndex = Math.floor(i / compressionRatio);
        const sample = channelData[originalIndex];
        newChannelData[i] = Math.max(-1, Math.min(1, sample));
      }
    }
    return newBuffer;
  };

  const audioBufferToWav = (buffer) => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = buffer.length * blockAlign;
    const totalSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

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
    setSuggestion('');
    setDropdownSuggestions([]);
    setDropdownActiveIndex(-1);
    setSearchResults(getAllSongsIncludingRecommended());
    setIsLoading(false);
    document.documentElement.style.setProperty('--input-width', '0px');
  };

  return (
    <div className="search-page1">
      {currentSong && (
        <div className="now-playing-top">
          <img src={currentSong.image} alt={currentSong.title} className="now-playing-img" />
          <div className="now-playing-info">
            <div className="now-playing-title">{currentSong.title}</div>
            <div className="now-playing-artist" style={{ color: 'green', cursor: 'pointer' }}>{currentSong.artist}</div>
          </div>
          <div className="now-playing-controls">
            <button
              className="now-playing-btn"
              title={isPlaying ? 'Pause' : 'Play'}
              onClick={handlePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>
            <button className="now-playing-btn" title="Like" aria-label="Like">
              <FontAwesomeIcon icon={faHeart} />
            </button>
            <button className="now-playing-btn" title="Add to Playlist" aria-label="Add to Playlist">
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button className="now-playing-btn" title="Download" aria-label="Download" onClick={(e) => handleDownload(currentSong, e)}>
              <PiDownloadSimple />
            </button>
          </div>
        </div>
      )}

      <div className="search-bar-discovery" ref={suggestionsRef}>
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <div className="search-input-container">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search songs, artists, movies, or genres..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {searchQuery && suggestion && (
            <div className="search-suggestion1" onClick={handleSuggestionClick}>
              {suggestion}
            </div>
          )}
          {searchQuery && dropdownSuggestions.length > 0 && (
            <div className="dropdown-suggestions">
              {dropdownSuggestions.map((item, idx) => (
                <div
                  key={item.type + item.value}
                  className={`dropdown-suggestion-item${idx === dropdownActiveIndex ? ' active' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleDropdownClick(item.value);
                  }}
                >
                  {item.type === 'title' ? (
                    <>
                      <span className="dropdown-song-title">{highlightMatch(item.value, searchQuery)}</span>
                      <span className="dropdown-song-artist" style={{ color: 'green', cursor: 'pointer' }}>{item.song.artist}</span>
                    </>
                  ) : (
                    <span>{highlightMatch(item.value, searchQuery)}</span>
                  )}
                  <span className="dropdown-type">{item.type === 'title' ? 'Song' : item.type === 'artist' ? 'Artist' : 'Movie'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {searchQuery && (
          <button className="clear-icon" onClick={clearSearch} tabIndex={0} type="button" aria-label="Clear search">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {searchQuery && (
        <div className="search-results-heading1">
          Search results for <span className="search-query">"{searchQuery}"</span>
        </div>
      )}

      <div className="results-area1">
        {isLoading ? (
          <div className="search-loading">
            <div className="spinner"></div>
            <span>Searching...</span>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="search-hint">
            <h2>Discover Music</h2>
            <p>Search for your favorite songs, artists, movies, or genres</p>
          </div>
        ) : (
          <>
            <div className="search-result">
              {searchResults.map((song) => (
                <div key={song.id} className={`song-item ${currentSong?.id === song.id ? 'active' : ''}`}>
                  <div className="song-info" onClick={() => handleSongClick(song)}>
                    <img src={song.image} alt={song.title} />
                    <div>
                      <h3>{song.title}</h3>
                      <span className="artist" style={{ color: 'green', cursor: 'pointer' }}>{song.artist}</span>
                    </div>
                  </div>
                  <div className="song-controls">
                    <button
                      className="play-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentSong?.id === song.id) {
                          handlePlayPause();
                        } else {
                          handleSongClick(song);
                        }
                      }}
                      title={currentSong?.id === song.id && isPlaying ? 'Pause' : 'Play'}
                    >
                      <FontAwesomeIcon icon={currentSong?.id === song.id && isPlaying ? faPause : faPlay} />
                    </button>
                    <button
                      className={`like-button ${likedSongs.some(s => s.id === song.id) ? 'liked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(song);
                      }}
                      title={likedSongs.some(s => s.id === song.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {likedSongs.some(s => s.id === song.id) ? <PiHeartFill /> : <PiHeart />}
                    </button>
                    <button
                      className={`action-button ${playlistSongs.some(s => s.id === song.id) ? 'added' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToPlaylist(song);
                      }}
                      title={playlistSongs.some(s => s.id === song.id) ? 'Remove from playlist' : 'Add to playlist'}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                    <button className="action-button" title="Download" onClick={(e) => handleDownload(song, e)}>
                      <PiDownloadSimple />
                    </button>
                    <button className="action-button" title="More Options">
                      <FontAwesomeIcon icon={faEllipsisH} />
                    </button>
                    <span className="duration">{durations[searchResults.findIndex(s => s.id === song.id)] || song.duration || '--:--'}</span>
                  </div>
                </div>
              ))}
            </div>

            {currentSong && relatedSongs.length > 0 && (
              <div className="related-songs-section">
                <h2 className="related-songs-heading">You May Also Like</h2>
                <div className="search-result">
                  {relatedSongs.map((song) => (
                    <div key={song.id} className={`song-item ${currentSong?.id === song.id ? 'active' : ''}`}>
                      <div className="song-info" onClick={() => handleSongClick(song)}>
                        <img src={song.image} alt={song.title} />
                        <div>
                          <h3>{song.title}</h3>
                          <span className="artist" style={{ color: 'green', cursor: 'pointer' }}>{song.artist}</span>
                        </div>
                      </div>
                      <div className="song-controls">
                        <button
                          className="play-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentSong?.id === song.id) {
                              handlePlayPause();
                            } else {
                              handleSongClick(song);
                            }
                          }}
                          title={currentSong?.id === song.id && isPlaying ? 'Pause' : 'Play'}
                        >
                          <FontAwesomeIcon icon={currentSong?.id === song.id && isPlaying ? faPause : faPlay} />
                        </button>
                        <button
                          className={`like-button ${likedSongs.some(s => s.id === song.id) ? 'liked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(song);
                          }}
                          title={likedSongs.some(s => s.id === song.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {likedSongs.some(s => s.id === song.id) ? <PiHeartFill /> : <PiHeart />}
                        </button>
                        <button
                          className={`action-button ${playlistSongs.some(s => s.id === song.id) ? 'added' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToPlaylist(song);
                          }}
                          title={playlistSongs.some(s => s.id === song.id) ? 'Remove from playlist' : 'Add to playlist'}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                        <button className="action-button" title="Download" onClick={(e) => handleDownload(song, e)}>
                          <PiDownloadSimple />
                        </button>
                        <button className="action-button" title="More Options">
                          <FontAwesomeIcon icon={faEllipsisH} />
                        </button>
                        <span className="duration">{durations[relatedSongs.findIndex(s => s.id === song.id)] || song.duration || '--:--'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <DownloadQualityDropdown
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        onQualitySelect={() => {}}
        song={selectedSong}
        position={downloadPosition}
      />
    </div>
  );
};

export default SearchPage;

