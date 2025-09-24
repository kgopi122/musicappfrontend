import React, { useState, useEffect } from 'react';
import { AZURE_CONFIG } from './config/azure';
import { Link, useNavigate } from 'react-router-dom';
import { PiMagnifyingGlass, PiUser, PiSignOut, PiHouse, PiBooks, PiCompass, PiGearSix } from 'react-icons/pi';
import { useLanguage } from './contexts/LanguageContext';
import './styles/header.css';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const checkLoginStatus = () => {
      const storedUsername = localStorage.getItem('username');
      const hasCookie = document.cookie.includes('csrid=');

      if (storedUsername && hasCookie) {
        setUsername(storedUsername);
        setIsLoggedIn(true);
      } else {
        setUsername('');
        setIsLoggedIn(false);
        localStorage.removeItem('username');
        localStorage.removeItem('email');
      }
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    document.cookie = 'csrid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsLoggedIn(false);
    setUsername('');
    setShowDropdown(false);
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleProfile = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  const handlePlaylists = () => {
    navigate('/playlists');
    setShowDropdown(false);
  };

  const handleLikedSongs = () => {
    navigate('/liked-songs');
    setShowDropdown(false);
  };

  const handleSettings = () => {
    navigate('/settings');
    setShowDropdown(false);
  };

  return (

    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <img src={AZURE_CONFIG.getImageUrl('vibe-guru-logo.png')} alt="Logo" />
            <span className="logo-text">VibeGuru</span>
          </Link>
          </div>
          <div className="header-right">
            <nav className="main-nav">
              <Link to="/" className="nav-item">
                <PiHouse className="text-xl" />
                <span>{t('header.home')}</span>
              </Link>
              <Link to="/library" className="nav-item">
                <PiBooks className="text-xl" />
                <span>{t('header.library')}</span>
              </Link>
              <Link to="/SearchPage" className="nav-item">
                <PiCompass className="text-xl" />
                <span>{t('header.discovery')}</span>
              </Link>
            </nav>
          </div>
          <div className="header-right">

            {isLoggedIn ? (
              <div className="profile-section">
                <button className="profile-button" onClick={handleProfileClick}>
                  <PiUser className="profile-icon" />
                  <span className="username">{username}</span>
                </button>
                {showDropdown && (
                  <div className="profile-dropdown">
                    <button onClick={handleProfile}>
                      <PiUser className="text-xl" />
                      <span>{t('MyProfile')}</span>
                    </button>
                    <button onClick={handlePlaylists}>
                      <PiBooks className="text-xl" />
                      <span>{t('MyPlaylists')}</span>
                    </button>
                    <button onClick={handleLikedSongs}>
                      <PiBooks className="text-xl" />
                      <span>{t('LikedSongs')}</span>
                    </button>
                    <button onClick={handleSettings}>
                      <PiGearSix className="text-xl" />
                      <span>{t('Settings')}</span>
                    </button>
                    <button onClick={handleLogout} className="logout-button">
                      <PiSignOut className="text-xl" />
                      <span>{t('Logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-button">
                {t('header.login')}
              </Link>
            )}

          </div>
        
      </div>
    </header>
  );
};

export default Header;