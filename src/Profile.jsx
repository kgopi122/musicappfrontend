import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiUserCircleFill, PiPencilSimple, PiCamera, PiHeart, PiPlaylist, PiDownloadSimple, PiShare } from 'react-icons/pi';
import { requireAuth } from './utils/auth';
import { LibraryContext } from './LibraryContext';
import Header from './header';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { likedSongs, playlistSongs } = useContext(LibraryContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [profileImage, setProfileImage] = useState('/default-profile.png');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: ''
  });
  const [activeTab, setActiveTab] = useState('liked');
  const [stats, setStats] = useState({
    likedSongs: 0,
    playlists: 0,
    followers: 0,
    following: 0
  });

  useEffect(() => {
    if (!requireAuth(navigate)) return;
    
    // Fetch user data from localStorage
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('userEmail');
    
    if (storedUsername) {
      setUsername(storedUsername);
      setEditForm(prev => ({ ...prev, displayName: storedUsername }));
    }
    
    if (storedEmail) {
      setEmail(storedEmail);
    }
    
    // Set join date (in a real app, this would come from the backend)
    const joinDateStr = localStorage.getItem('joinDate') || new Date().toISOString();
    setJoinDate(new Date(joinDateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
    
    // Set stats
    setStats({
      likedSongs: likedSongs.length,
      playlists: playlistSongs.length,
      followers: Math.floor(Math.random() * 1000), // Placeholder
      following: Math.floor(Math.random() * 500)   // Placeholder
    });
  }, [navigate, likedSongs.length, playlistSongs.length]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    // In a real app, this would update the backend
    localStorage.setItem('username', editForm.displayName);
    setUsername(editForm.displayName);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(prev => ({ ...prev, displayName: username }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'liked':
        return (
          <div className="profile-content-section">
            <h3>Liked Songs</h3>
            {likedSongs.length > 0 ? (
              <div className="song-grid">
                {likedSongs.map((song, index) => (
                  <div key={index} className="song-card" onClick={() => navigate(`/song/${encodeURIComponent(song.title)}`)}>
                    <img src={song.image} alt={song.title} />
                    <div className="song-info">
                      <h4>{song.title}</h4>
                      <p style={{ color: 'green', cursor: 'pointer' }}>{song.artist}</p>
                    </div>
                    <div className="song-actions">
                      <button className="action-btn"><PiHeart /></button>
                      <button className="action-btn"><PiDownloadSimple /></button>
                      <button className="action-btn"><PiShare /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <PiHeart size={48} />
                <p>You haven't liked any songs yet</p>
                <button onClick={() => navigate('/')}>Discover Music</button>
              </div>
            )}
          </div>
        );
      case 'playlists':
        return (
          <div className="profile-content-section">
            <h3>Your Playlists</h3>
            {playlistSongs.length > 0 ? (
              <div className="playlist-grid">
                {playlistSongs.map((song, index) => (
                  <div key={index} className="playlist-card">
                    <img src={song.image} alt={song.title} />
                    <div className="playlist-info">
                      <h4>{song.title}</h4>
                      <p style={{ color: 'green', cursor: 'pointer' }}>{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <PiPlaylist size={48} />
                <p>You haven't created any playlists yet</p>
                <button onClick={() => navigate('/')}>Create Playlist</button>
              </div>
            )}
          </div>
        );
      case 'activity':
        return (
          <div className="profile-content-section">
            <h3>Recent Activity</h3>
            <div className="activity-timeline">
              <div className="activity-item">
                <div className="activity-icon"><PiHeart /></div>
                <div className="activity-content">
                  <p>You liked <strong>Shape of You</strong> by Ed Sheeran</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon"><PiPlaylist /></div>
                <div className="activity-content">
                  <p>You created a new playlist <strong>Workout Mix</strong></p>
                  <span className="activity-time">Yesterday</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon"><PiShare /></div>
                <div className="activity-content">
                  <p>You shared <strong>Blinding Lights</strong> with your friends</p>
                  <span className="activity-time">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-cover">
            <div className="profile-image-container">
              <img src={profileImage} alt="Profile" className="profile-image" />
              <label className="profile-image-upload">
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                <PiCamera />
              </label>
            </div>
          </div>
          <div className="profile-info">
            <div className="profile-main-info">
              {isEditing ? (
                <div className="edit-form">
                  <input 
                    type="text" 
                    name="displayName" 
                    value={editForm.displayName} 
                    onChange={handleInputChange}
                    placeholder="Display Name"
                  />
                  <textarea 
                    name="bio" 
                    value={editForm.bio} 
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                  />
                  <input 
                    type="text" 
                    name="location" 
                    value={editForm.location} 
                    onChange={handleInputChange}
                    placeholder="Location"
                  />
                  <input 
                    type="text" 
                    name="website" 
                    value={editForm.website} 
                    onChange={handleInputChange}
                    placeholder="Website"
                  />
                  <div className="edit-actions">
                    <button onClick={handleSaveProfile} className="save-btn">Save</button>
                    <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h1>{username}</h1>
                  <p className="profile-bio">{editForm.bio || "No bio yet"}</p>
                  <div className="profile-meta">
                    <span>{editForm.location || "Location not set"}</span>
                    <span>{editForm.website || "Website not set"}</span>
                    <span>Joined {joinDate}</span>
                  </div>
                  <button onClick={handleEditClick} className="edit-profile-btn">
                    <PiPencilSimple /> Edit Profile
                  </button>
                </>
              )}
            </div>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{stats.likedSongs}</span>
                <span className="stat-label">Liked Songs</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.playlists}</span>
                <span className="stat-label">Playlists</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.following}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => handleTabChange('liked')}
          >
            Liked Songs
          </button>
          <button 
            className={`tab-btn ${activeTab === 'playlists' ? 'active' : ''}`}
            onClick={() => handleTabChange('playlists')}
          >
            Playlists
          </button>
          <button 
            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => handleTabChange('activity')}
          >
            Activity
          </button>
        </div>
        
        <div className="profile-content">
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default Profile; 