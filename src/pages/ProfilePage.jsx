import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaSignOutAlt, FaHistory, FaHeart, FaMusic, FaPlay, FaRandom, FaPlus, FaCog, FaUserCircle } from 'react-icons/fa';
import { PlayerContext } from '../PlayerContext';
import { LibraryContext } from '../LibraryContext';
import Header from '../header';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, pauseSong } = useContext(PlayerContext);
  const { likedSongs, playlistSongs } = useContext(LibraryContext);
  
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [recentSongs, setRecentSongs] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName') || userEmail?.split('@')[0];
    
    if (!userEmail) {
      navigate('/login');
      return;
    }

    setUser({
      email: userEmail,
      name: userName,
      joinDate: localStorage.getItem('joinDate') || new Date().toISOString()
    });
    setEditedName(userName);

    // Get recent songs from localStorage
    const recentSongsData = JSON.parse(localStorage.getItem('recentSongs') || '[]');
    setRecentSongs(recentSongsData);
  }, [navigate]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    if (editedName.trim()) {
      localStorage.setItem('userName', editedName.trim());
      setUser(prev => ({ ...prev, name: editedName.trim() }));
      setIsEditing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('joinDate');
    navigate('/login');
  };

  const handlePlaySong = (song) => {
    if (currentSong?.id === song.id) {
      isPlaying ? pauseSong() : playSong(song);
    } else {
      playSong(song);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="profile-page">
        <Header />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              <FaUserCircle />
            </div>
            <button className="edit-avatar-button">
              <FaEdit />
            </button>
          </div>
          <div className="profile-info">
            {isEditing ? (
              <div className="edit-name">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                />
                <div className="edit-actions">
                  <button onClick={handleSaveProfile} className="save-button">
                    Save Changes
                  </button>
                  <button onClick={() => setIsEditing(false)} className="cancel-button">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1>{user.name}</h1>
                <div className="profile-actions">
                  <button className="edit-button" onClick={handleEditProfile}>
                    <FaEdit /> Edit Profile
                  </button>
                  <button className="settings-button" onClick={() => setShowSettings(true)}>
                    <FaCog /> Settings
                  </button>
                </div>
              </>
            )}
            <p className="email">{user.email}</p>
            <p className="join-date">Member since {formatDate(user.joinDate)}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <FaHeart />
            <h3>{likedSongs.length}</h3>
            <p>Liked Songs</p>
          </div>
          <div className="stat-card">
            <FaMusic />
            <h3>{playlistSongs.length}</h3>
            <p>Playlist Songs</p>
          </div>
          <div className="stat-card">
            <FaHistory />
            <h3>{recentSongs.length}</h3>
            <p>Recently Played</p>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-tabs">
            <button 
              className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button 
              className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
              onClick={() => setActiveTab('recent')}
            >
              Recently Played
            </button>
            <button 
              className={`tab ${activeTab === 'liked' ? 'active' : ''}`}
              onClick={() => setActiveTab('liked')}
            >
              Liked Songs
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'profile' && (
              <div className="profile-details">
                <h2>Account Information</h2>
                <div className="info-group">
                  <label>Name</label>
                  <p>{user.name}</p>
                </div>
                <div className="info-group">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-group">
                  <label>Member Since</label>
                  <p>{formatDate(user.joinDate)}</p>
                </div>
                <button 
                  className="logout-button"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}

            {activeTab === 'recent' && (
              <div className="liked-songs-container">
                <div className="liked-songs-header">
                  <div className="liked-songs-info">
                    <h2>Recently Played</h2>
                    <p>{recentSongs.length} songs</p>
                  </div>
                  <div className="liked-songs-controls">
                    <button 
                      className="play-all-button"
                      onClick={() => recentSongs.length > 0 && handlePlaySong(recentSongs[0])}
                    >
                      <FaPlay /> Play All
                    </button>
                    <button 
                      className="shuffle-button"
                      onClick={() => {
                        const shuffled = [...recentSongs].sort(() => Math.random() - 0.5);
                        if (shuffled.length > 0) handlePlaySong(shuffled[0]);
                      }}
                    >
                      <FaRandom /> Shuffle
                    </button>
                  </div>
                </div>

                <div className="liked-songs-list">
                  {recentSongs.length === 0 ? (
                    <div className="empty-state">
                      <h3>No Recent Songs</h3>
                      <p>Your recently played songs will appear here</p>
                      <button onClick={() => navigate('/search')}>Discover Music</button>
                    </div>
                  ) : (
                    recentSongs.map((song, index) => (
                      <div 
                        key={song.id || index}
                        className={`liked-song-item ${currentSong?.id === song.id ? 'active' : ''}`}
                      >
                        <div className="song-index">
                          {currentSong?.id === song.id ? (
                            <FaPlay className="playing-icon" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <div 
                          className="song-info"
                          onClick={() => handlePlaySong(song)}
                        >
                          <img src={song.image} alt={song.title} />
                          <div className="song-details">
                            <h4>{song.title}</h4>
                            <p>{song.artist}</p>
                          </div>
                        </div>
                        <div className="song-meta">
                          <span className="genre-tag">{song.genre}</span>
                          <span className="language-tag">{song.language}</span>
                        </div>
                        <div className="song-duration">
                          {song.duration}
                        </div>
                        <div className="song-controls">
                          <button 
                            className="control-button"
                            onClick={() => handlePlaySong(song)}
                          >
                            {currentSong?.id === song.id && isPlaying ? <FaPause /> : <FaPlay />}
                          </button>
                          <button 
                            className="control-button"
                            onClick={() => removeFromLikedSongs(song)}
                          >
                            <FaHeart className="liked" />
                          </button>
                          <button 
                            className="control-button"
                            onClick={() => addToPlaylist(song)}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'liked' && (
              <div className="liked-songs-container">
                <div className="liked-songs-header">
                  <div className="liked-songs-info">
                    <h2>Liked Songs</h2>
                    <p>{likedSongs.length} songs</p>
                  </div>
                  <div className="liked-songs-controls">
                    <button 
                      className="play-all-button"
                      onClick={() => likedSongs.length > 0 && handlePlaySong(likedSongs[0])}
                    >
                      <FaPlay /> Play All
                    </button>
                    <button 
                      className="shuffle-button"
                      onClick={() => {
                        const shuffled = [...likedSongs].sort(() => Math.random() - 0.5);
                        if (shuffled.length > 0) handlePlaySong(shuffled[0]);
                      }}
                    >
                      <FaRandom /> Shuffle
                    </button>
                  </div>
                </div>

                <div className="liked-songs-list">
                  {likedSongs.length === 0 ? (
                    <div className="empty-state">
                      <h3>No Liked Songs</h3>
                      <p>Your liked songs will appear here</p>
                      <button onClick={() => navigate('/search')}>Discover Music</button>
                    </div>
                  ) : (
                    likedSongs.map((song, index) => (
                      <div 
                        key={song.id || index}
                        className={`liked-song-item ${currentSong?.id === song.id ? 'active' : ''}`}
                      >
                        <div className="song-index">
                          {currentSong?.id === song.id ? (
                            <FaPlay className="playing-icon" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <div 
                          className="song-info"
                          onClick={() => handlePlaySong(song)}
                        >
                          <img src={song.image} alt={song.title} />
                          <div className="song-details">
                            <h4>{song.title}</h4>
                            <p>{song.artist}</p>
                          </div>
                        </div>
                        <div className="song-meta">
                          <span className="genre-tag">{song.genre}</span>
                          <span className="language-tag">{song.language}</span>
                        </div>
                        <div className="song-duration">
                          {song.duration}
                        </div>
                        <div className="song-controls">
                          <button 
                            className="control-button"
                            onClick={() => handlePlaySong(song)}
                          >
                            {currentSong?.id === song.id && isPlaying ? <FaPause /> : <FaPlay />}
                          </button>
                          <button 
                            className="control-button"
                            onClick={() => removeFromLikedSongs(song)}
                          >
                            <FaHeart className="liked" />
                          </button>
                          <button 
                            className="control-button"
                            onClick={() => addToPlaylist(song)}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button onClick={handleLogout}>Logout</button>
              <button onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="modal-overlay">
          <div className="modal settings-modal">
            <h2>Settings</h2>
            <div className="settings-content">
              <div className="settings-group">
                <h3>Account Settings</h3>
                <button className="settings-button">Change Password</button>
                <button className="settings-button">Update Email</button>
              </div>
              <div className="settings-group">
                <h3>Preferences</h3>
                <button className="settings-button">Notification Settings</button>
                <button className="settings-button">Privacy Settings</button>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowSettings(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 