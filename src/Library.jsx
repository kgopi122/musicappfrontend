// LibraryPage.jsx
import React, { useContext, useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { LibraryContext } from './LibraryContext';
import { PlayerContext } from './PlayerContext';
import Header from './header.jsx';
import './LibraryPage.css';
import { useNavigate } from 'react-router-dom';
import { requireAuth } from './utils/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faHeart, faPlus, faEllipsisH, faTrash, faCheck, faSort, faSearch, faStepBackward, faStepForward, faCheckCircle, faMusic } from '@fortawesome/free-solid-svg-icons';
import { PiDownloadSimple } from 'react-icons/pi';
import { FaSearch } from 'react-icons/fa';

// Separate SongCard component to prevent re-renders
const SelectionMenu = memo(({ 
  song, 
  isSelected, 
  onSelect, 
  onRemove,
  position 
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onSelect(song);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onSelect, song]);

  return (
    <div 
      ref={menuRef}
      className="selection-menu"
      style={{
        top: position.y,
        left: position.x
      }}
    >
      <button 
        className={`menu-item ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(song)}
      >
        <FontAwesomeIcon icon={isSelected ? faCheckCircle : faCheck} />
        <span>{isSelected ? 'Deselect' : 'Select'}</span>
      </button>
      <button 
        className="menu-item remove"
        onClick={() => onRemove(song)}
      >
        <FontAwesomeIcon icon={faTrash} />
        <span>Remove</span>
      </button>
    </div>
  );
});

const SongCard = memo(({ 
  song, 
  index, 
  type, 
  isActive, 
  isPlaying, 
  isSelected, 
  isSelectMode, 
  duration,
  onSongClick, 
  onRemove,
  onSelect 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (isSelectMode) {
      onSelect(song);
    } else {
      onSongClick(song);
    }
  }, [isSelectMode, onSongClick, onSelect, song]);

  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove(song, type);
  }, [onRemove, song, type]);

  return (
    <div 
      className={`library-song-card ${isActive ? 'active' : ''} ${isSelectMode ? 'selectable' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="song-info">
        {isSelectMode && (
          <div className="selection-checkbox" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(song)}
              className="checkbox-input"
              id={`select-${song.id}`}
            />
            <label htmlFor={`select-${song.id}`} className="checkbox-custom"></label>
          </div>
        )}
        <img src={song.image} alt={song.title} />
        <div>
          <h4>{song.title}</h4>
          <p className="artist-name">{song.artist}</p>
          {song.addedAt && (
            <span className="added-date">
              Added {new Date(song.addedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="song-controls">
        {!isSelectMode && (
          <>
            <button
              className="play-button"
              onClick={handleClick}
              title={isActive && isPlaying ? 'Pause' : 'Play'}
            >
              <FontAwesomeIcon
                icon={isActive && isPlaying ? faPause : faPlay}
              />
            </button>
            <button
              className="action-button delete-button"
              onClick={handleRemove}
              title="Remove from list"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <button
              className="action-button"
              title="Download"
              onClick={(e) => e.stopPropagation()}
            >
              <PiDownloadSimple />
            </button>
            <button
              className="action-button"
              title="More Options"
              onClick={(e) => e.stopPropagation()}
            >
              <FontAwesomeIcon icon={faEllipsisH} />
            </button>
          </>
        )}
        <span className="duration">
          {duration || song.duration || '--:--'}
        </span>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.song.id === nextProps.song.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isSelectMode === nextProps.isSelectMode &&
    prevProps.index === nextProps.index &&
    prevProps.duration === nextProps.duration
  );
});

// Separate SongList component
const SongList = memo(({ 
  songs, 
  type, 
  currentSong, 
  isPlaying, 
  selectedSongs, 
  isSelectMode,
  durations,
  onSongClick,
  onRemove,
  onToggleSelectMode,
  onSelectAll,
  onRemoveSelected,
  onSelect
}) => {
  const navigate = useNavigate();

  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      const isSelected = selectedSongs.some(s => s.id === song.id);
      return !isSelectMode || isSelected;
    });
  }, [songs, selectedSongs, isSelectMode]);

  return (
    // <div className="library-section">
    //   <div className="section-header">
        <div className="action-buttons">
          <button 
            className={`select-mode-btn ${isSelectMode ? 'active' : ''}`}
            onClick={onToggleSelectMode}
          >
            <FontAwesomeIcon icon={isSelectMode ? faCheck : faCheck} />
            {isSelectMode ? 'Cancel Selection' : 'Select Songs'}
          </button>
          {isSelectMode && (
            <div className="selection-actions">
              <button 
                className="select-all-btn"
                onClick={() => onSelectAll(songs)}
              >
                {selectedSongs.length === songs.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedSongs.length > 0 && (
                <button 
                  className="remove-selected-btn"
                  onClick={() => onRemoveSelected(type)}
                >
                  Remove Selected ({selectedSongs.length})
                </button>
              )}
            </div>
          )}
        {/* </div>
      </div> */}
      <div className="library-song-list">
        {filteredSongs.length === 0 ? (
          <div className="empty-state">
            <h3>No songs yet</h3>
            <p>Your {type === 'liked' ? 'liked songs' : 'playlist'} will appear here</p>
            <button onClick={() => navigate('/SearchPage')} className="discover-btn">
              Discover Music
            </button>
          </div>
        ) : (
          filteredSongs.map((song, index) => (
            <SongCard
              key={song.id || index}
              song={song}
              index={index}
              type={type}
              isActive={currentSong?.id === song.id}
              isPlaying={isPlaying}
              isSelected={selectedSongs.some(s => s.id === song.id)}
              isSelectMode={isSelectMode}
              duration={durations[index]}
              onSongClick={onSongClick}
              onRemove={onRemove}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
});

const LibraryPage = () => {
  const { 
    likedSongs, 
    playlistSongs, 
    userId,
    removeFromLikedSongs,
    removeFromPlaylist,
    setLikedSongs,
    setPlaylistSongs
  } = useContext(LibraryContext);
  
  const { 
    currentSong, 
    setCurrentSong, 
    isPlaying, 
    setIsPlaying, 
    handlePlayPause,
    setCurrentPlaylist 
  } = useContext(PlayerContext);

  const navigate = useNavigate();
  const [durations, setDurations] = useState({});
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [activeTab, setActiveTab] = useState('liked');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedSongsToImport, setSelectedSongsToImport] = useState([]);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [playlistView, setPlaylistView] = useState('all'); // 'all' or 'created'

  // Check authentication and load user data
  useEffect(() => {
    if (!requireAuth(navigate)) return;
    
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Preload durations for all songs
  useEffect(() => {
    const allSongs = [...likedSongs, ...playlistSongs];
    allSongs.forEach((song, index) => {
      const audio = new Audio(song.audioSrc);
      audio.onloadedmetadata = () => {
        setDurations(prev => ({
          ...prev,
          [index]: `${Math.floor(audio.duration / 60)}:${String(Math.floor(audio.duration % 60)).padStart(2, '0')}`
        }));
      };
    });
  }, [likedSongs, playlistSongs]);

  // Memoize the filtered and sorted songs
  const getFilteredAndSortedSongs = useCallback((songs) => {
    let filtered = songs;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = songs.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        default:
          return 0;
      }
    });
  }, [searchQuery, sortBy]);

  // Memoize current songs with search and sort applied
  const currentSongs = useMemo(() => {
    if (activeTab === 'liked') {
      return getFilteredAndSortedSongs(likedSongs);
    } else {
      // Filter playlists based on view
      const filteredPlaylists = playlistSongs.filter(playlist => {
        if (playlistView === 'all') return true;
        return playlistView === 'created' && playlist.isCreated;
      });
      return getFilteredAndSortedSongs(filteredPlaylists);
    }
  }, [activeTab, likedSongs, playlistSongs, getFilteredAndSortedSongs, playlistView]);

  // Update current playlist when songs change
  useEffect(() => {
    setCurrentPlaylist(currentSongs);
  }, [currentSongs, setCurrentPlaylist]);

  const handleSongClick = useCallback((song) => {
    if (isSelectMode) {
      setSelectedSongs(prev => {
        const isSelected = prev.some(s => s.id === song.id);
        if (isSelected) {
          return prev.filter(s => s.id !== song.id);
        } else {
          return [...prev, song];
        }
      });
      return;
    }

    if (currentSong?.id === song.id) {
      handlePlayPause();
    } else {
      const currentSongs = activeTab === 'liked' ? likedSongs : playlistSongs;
      setCurrentPlaylist(currentSongs);
      setCurrentSong(song);
      setIsPlaying(true);
    }
  }, [isSelectMode, currentSong, handlePlayPause, setCurrentSong, setIsPlaying, activeTab, likedSongs, playlistSongs, setCurrentPlaylist]);

  const handleRemove = useCallback((song, type) => {
    if (!userId) return;
    
    setSongToDelete(song);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  }, [userId]);

  const confirmDelete = useCallback(() => {
    if (!userId || !songToDelete || !deleteType) return;

    // Remove from current playlist if it's the current song
    if (currentSong?.id === songToDelete.id) {
      setCurrentSong(null);
      setIsPlaying(false);
    }

    // Remove the song from the appropriate list
    if (deleteType === 'liked') {
      removeFromLikedSongs(songToDelete.id);
      setLikedSongs(prev => prev.filter(s => s.id !== songToDelete.id));
    } else {
      removeFromPlaylist(songToDelete.id);
      setPlaylistSongs(prev => prev.filter(s => s.id !== songToDelete.id));
    }

    // Update current playlist
    const updatedSongs = deleteType === 'liked' 
      ? likedSongs.filter(s => s.id !== songToDelete.id)
      : playlistSongs.filter(s => s.id !== songToDelete.id);
    
    setCurrentPlaylist(updatedSongs);
    setShowDeleteConfirm(false);
    setSongToDelete(null);
    setDeleteType(null);
  }, [
    userId,
    songToDelete,
    deleteType,
    currentSong,
    setCurrentSong,
    setIsPlaying,
    removeFromLikedSongs,
    removeFromPlaylist,
    likedSongs,
    playlistSongs,
    setCurrentPlaylist,
    setLikedSongs,
    setPlaylistSongs
  ]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setSongToDelete(null);
    setDeleteType(null);
  }, []);

  const handleSelect = useCallback((song) => {
    setSelectedSongs(prev => {
      const isSelected = prev.some(s => s.id === song.id);
      if (isSelected) {
        return prev.filter(s => s.id !== song.id);
      } else {
        return [...prev, song];
      }
    });
  }, []);

  const handleSelectAll = useCallback((songs) => {
    setSelectedSongs(prev => {
      if (prev.length === songs.length) {
        return [];
      } else {
        return [...songs];
      }
    });
  }, []);

  const handleRemoveSelected = useCallback((type) => {
    if (!userId) return;

    // Remove from current playlist if any selected songs are playing
    const isPlayingSelected = selectedSongs.some(song => song.id === currentSong?.id);
    if (isPlayingSelected) {
      setCurrentSong(null);
      setIsPlaying(false);
    }

    // Immediately update the UI by filtering out selected songs
    if (type === 'liked') {
      const updatedLikedSongs = likedSongs.filter(song => !selectedSongs.some(selected => selected.id === song.id));
      setLikedSongs(updatedLikedSongs);
      selectedSongs.forEach(song => removeFromLikedSongs(song.id));
    } else {
      const updatedPlaylistSongs = playlistSongs.filter(song => !selectedSongs.some(selected => selected.id === song.id));
      setPlaylistSongs(updatedPlaylistSongs);
      selectedSongs.forEach(song => removeFromPlaylist(song.id));
    }

    // Update current playlist
    const updatedSongs = type === 'liked'
      ? likedSongs.filter(song => !selectedSongs.some(selected => selected.id === song.id))
      : playlistSongs.filter(song => !selectedSongs.some(selected => selected.id === song.id));
    
    setCurrentPlaylist(updatedSongs);
    setSelectedSongs([]);
    setIsSelectMode(false);
  }, [
    userId,
    selectedSongs,
    currentSong,
    setCurrentSong,
    setIsPlaying,
    removeFromLikedSongs,
    removeFromPlaylist,
    likedSongs,
    playlistSongs,
    setCurrentPlaylist,
    setLikedSongs,
    setPlaylistSongs
  ]);

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode(prev => !prev);
    if (isSelectMode) {
      setSelectedSongs([]);
    }
  }, [isSelectMode]);

  const handleCreatePlaylist = useCallback(() => {
    if (!userId || !newPlaylistName.trim()) return;

    // Create a new playlist object
    const newPlaylist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      songs: selectedSongsToImport,
      createdAt: new Date().toISOString(),
      userId: userId,
      isCreated: true, // Mark as a created playlist
      type: 'playlist' // Add type to differentiate from regular songs
    };

    // Add the new playlist to the user's playlists
    setPlaylistSongs(prev => [...prev, newPlaylist]);

    // Save to localStorage
    const userPlaylists = loadFromStorage(userId, 'playlistSongs') || [];
    saveToStorage(userId, 'playlistSongs', [...userPlaylists, newPlaylist]);

    // Reset form and close modal
    setNewPlaylistName('');
    setSelectedSongsToImport([]);
    setShowImportOptions(false);
    setShowCreatePlaylist(false);

    // Show success message
    alert('Playlist created successfully!');
  }, [userId, newPlaylistName, selectedSongsToImport, setPlaylistSongs]);

  const handleImportSong = (song) => {
    setSelectedSongsToImport(prev => {
      const isSelected = prev.some(s => s.id === song.id);
      if (isSelected) {
        return prev.filter(s => s.id !== song.id);
      } else {
        return [...prev, song];
      }
    });
  };

  // Add these helper functions at the top of the file, after the imports
  const loadFromStorage = (userId, key) => {
    try {
      const data = localStorage.getItem(`${userId}_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from storage:', error);
      return null;
    }
  };

  const saveToStorage = (userId, key, data) => {
    try {
      localStorage.setItem(`${userId}_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  // Add this new function to handle playing a playlist
  const handlePlayPlaylist = (playlist) => {
    if (playlist.songs.length === 0) return;
    
    setCurrentPlaylist(playlist.songs);
    setCurrentSong(playlist.songs[0]);
    setIsPlaying(true);
  };

  if (!userId) {
    return (
      <div className="library-page">
        <div className="empty-state">
          <h3>Please log in to view your library</h3>
          <button onClick={() => navigate('/login')} className="discover-btn">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="library-page">
      <Header />
      <div className="library-container">
        <div className="library-header">
          <h1>Your Library</h1>
          <div className="library-search">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search in your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="library-content">
          <div className="library-tabs">
            <button 
              className={`tab ${activeTab === 'liked' ? 'active' : ''}`}
              onClick={() => setActiveTab('liked')}
            >
              Liked Songs
            </button>
            <button 
              className={`tab ${activeTab === 'playlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('playlist')}
            >
              Playlists
            </button>
          </div>

          {activeTab === 'playlist' && (
            <div className="playlist-view-tabs">
              <button 
                className={`view-tab ${playlistView === 'all' ? 'active' : ''}`}
                onClick={() => setPlaylistView('all')}
              >
                All Playlists
              </button>
              <button 
                className={`view-tab ${playlistView === 'created' ? 'active' : ''}`}
                onClick={() => setPlaylistView('created')}
              >
                Created Playlists
              </button>
            </div>
          )}

          <div className="library-actions">
            {activeTab === 'playlist' && (
              <button 
                className="action-button create-playlist-btn"
                onClick={() => setShowCreatePlaylist(true)}
              >
                <FontAwesomeIcon icon={faPlus} /> Create New Playlist
              </button>
            )}
            {selectedSongs.length > 0 && (
              <div className="selection-actions">
                <button 
                  className="action-button"
                  onClick={handleRemoveSelected}
                >
                  <FontAwesomeIcon icon={faTrash} /> Remove Selected
                </button>
                <button 
                  className="action-button"
                  onClick={() => setSelectedSongs([])}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="library-song-list">
            {currentSongs.length === 0 ? (
              <div className="empty-state">
                <h3>No {activeTab === 'liked' ? 'liked songs' : 'playlists'} yet</h3>
                <p>Your {activeTab === 'liked' ? 'liked songs' : 'playlists'} will appear here</p>
                <button onClick={() => navigate('/SearchPage')} className="discover-btn">
                  Discover Music
                </button>
              </div>
            ) : (
              currentSongs.map((item, index) => (
                activeTab === 'playlist' && item.isCreated ? (
                  <div key={item.id} className="playlist-card">
                    <div className="playlist-info">
                      <div className="playlist-image">
                        {item.songs.length > 0 ? (
                          <img src={item.songs[0].image} alt={item.name} />
                        ) : (
                          <div className="empty-playlist-image">
                            <FontAwesomeIcon icon={faMusic} />
                          </div>
                        )}
                      </div>
                      <div className="playlist-details">
                        <h3>{item.name}</h3>
                        <p>{item.songs.length} songs</p>
                        <span className="created-date">
                          Created {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="playlist-actions">
                      <button
                        className="play-button"
                        onClick={() => handlePlayPlaylist(item)}
                        title="Play playlist"
                        disabled={item.songs.length === 0}
                      >
                        <FontAwesomeIcon icon={faPlay} />
                      </button>
                      <button
                        className="action-button"
                        onClick={() => handleRemove(item.id)}
                        title="Delete playlist"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <SongCard
                    key={item.id || index}
                    song={item}
                    index={index}
                    type={activeTab}
                    isActive={currentSong?.id === item.id}
                    isPlaying={isPlaying}
                    isSelected={selectedSongs.some(s => s.id === item.id)}
                    isSelectMode={isSelectMode}
                    duration={durations[index]}
                    onSongClick={handleSongClick}
                    onRemove={handleRemove}
                    onSelect={handleSelect}
                  />
                )
              ))
            )}
          </div>
        </div>
      </div>

      {showCreatePlaylist && (
        <div className="modal-overlay">
          <div className="modal create-playlist-modal">
            <h2>Create New Playlist</h2>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="playlist-name-input"
              />
              
              <div className="import-section">
                <button 
                  className="import-toggle-btn"
                  onClick={() => setShowImportOptions(!showImportOptions)}
                >
                  {showImportOptions ? 'Hide Import Options' : 'Import Songs'}
                </button>

                {showImportOptions && (
                  <div className="import-options">
                    <div className="import-sources">
                      <div className="source-section">
                        <h3>Liked Songs</h3>
                        <div className="song-list">
                          {likedSongs.map(song => (
                            <div 
                              key={song.id} 
                              className={`import-song-item ${selectedSongsToImport.some(s => s.id === song.id) ? 'selected' : ''}`}
                              onClick={() => handleImportSong(song)}
                            >
                              <img src={song.image} alt={song.title} />
                              <div className="song-info">
                                <h4>{song.title}</h4>
                                <p>{song.artist}</p>
                              </div>
                              <button className="import-check">
                                {selectedSongsToImport.some(s => s.id === song.id) ? '✓' : '+'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="source-section">
                        <h3>Existing Playlists</h3>
                        <div className="song-list">
                          {playlistSongs.map(song => (
                            <div 
                              key={song.id} 
                              className={`import-song-item ${selectedSongsToImport.some(s => s.id === song.id) ? 'selected' : ''}`}
                              onClick={() => handleImportSong(song)}
                            >
                              <img src={song.image} alt={song.title} />
                              <div className="song-info">
                                <h4>{song.title}</h4>
                                <p>{song.artist}</p>
                              </div>
                              <button className="import-check">
                                {selectedSongsToImport.some(s => s.id === song.id) ? '✓' : '+'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className="create-btn"
              >
                Create Playlist
              </button>
              <button 
                onClick={() => {
                  setShowCreatePlaylist(false);
                  setNewPlaylistName('');
                  setSelectedSongsToImport([]);
                  setShowImportOptions(false);
                }} 
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-dialog">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to remove "{songToDelete?.title}" from your {deleteType === 'liked' ? 'liked songs' : 'playlist'}?</p>
            <div className="delete-confirm-buttons">
              <button onClick={confirmDelete} className="confirm-delete-btn">
                Delete
              </button>
              <button onClick={cancelDelete} className="cancel-delete-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
