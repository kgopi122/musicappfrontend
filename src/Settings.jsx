import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PiGearSix, 
  PiUser, 
  PiLock, 
  PiBell, 
  PiPalette, 
  PiGlobe, 
  PiDeviceMobile, 
  PiShield, 
  PiQuestion, 
  PiSignOut,
  PiMusicNote,
  PiHeadphones,
  PiDownload,
  PiCloud,
  PiKey,
  PiEye,
  PiEyeSlash,
  PiTrash
} from 'react-icons/pi';
import { requireAuth } from './utils/auth';
import { useTheme } from './ThemeContext';
import { useLanguage } from './contexts/LanguageContext';
import Header from './header';
import './styles/Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('account');
  const [userData, setUserData] = useState({
    username: localStorage.getItem('username') || '',
    email: localStorage.getItem('email') || '',
    fullName: localStorage.getItem('fullName') || '',
    bio: localStorage.getItem('bio') || '',
    location: localStorage.getItem('location') || '',
    website: localStorage.getItem('website') || ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  
  const { 
    theme, 
    setTheme, 
    fontSize, 
    setFontSize, 
    settings, 
    updateSettings 
  } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!requireAuth(navigate)) return;
    
    // Fetch user data from localStorage
    const storedUsername = localStorage.getItem('username') || '';
    const storedEmail = localStorage.getItem('email') || '';
    const storedFullName = localStorage.getItem('fullName') || '';
    const storedBio = localStorage.getItem('bio') || '';
    const storedLocation = localStorage.getItem('location') || '';
    const storedWebsite = localStorage.getItem('website') || '';
    
    setUserData({ 
      username: storedUsername, 
      email: storedEmail,
      fullName: storedFullName,
      bio: storedBio,
      location: storedLocation,
      website: storedWebsite
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('fullName');
    localStorage.removeItem('bio');
    localStorage.removeItem('location');
    localStorage.removeItem('website');
    document.cookie = 'csrid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/login');
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Force a re-render of components that use translations
    window.dispatchEvent(new Event('languageChanged'));
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('fullName', userData.fullName || '');
      localStorage.setItem('bio', userData.bio || '');
      localStorage.setItem('location', userData.location || '');
      localStorage.setItem('website', userData.website || '');
      
      setNotification({ 
        type: 'success', 
        message: t('account.profileUpdated') 
      });
      setIsLoading(false);
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 3000);
    }, 1000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotification({ 
        type: 'error', 
        message: t('account.passwordsDoNotMatch') 
      });
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setNotification({ 
        type: 'success', 
        message: t('account.passwordUpdated') 
      });
      setIsLoading(false);
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 3000);
    }, 1000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm(t('account.confirmDelete'))) {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        handleLogout();
      }, 1000);
    }
  };

  // Ensure settings object has all required properties with default values
  const safeSettings = {
    notifications: {
      newReleases: settings?.notifications?.newReleases ?? true,
      playlistUpdates: settings?.notifications?.playlistUpdates ?? true,
      followers: settings?.notifications?.followers ?? true,
      nowPlaying: settings?.notifications?.nowPlaying ?? true,
      deviceActivity: settings?.notifications?.deviceActivity ?? true,
      promotions: settings?.notifications?.promotions ?? false,
      newsletter: settings?.notifications?.newsletter ?? false
    },
    privacy: {
      publicProfile: settings?.privacy?.publicProfile ?? true,
      showEmail: settings?.privacy?.showEmail ?? false,
      showActivity: settings?.privacy?.showActivity ?? true,
      showListeningHistory: settings?.privacy?.showListeningHistory ?? true,
      publicPlaylists: settings?.privacy?.publicPlaylists ?? true,
      analytics: settings?.privacy?.analytics ?? true,
      personalization: settings?.privacy?.personalization ?? true
    },
    playback: {
      streamingQuality: settings?.playback?.streamingQuality ?? 'high',
      downloadQuality: settings?.playback?.downloadQuality ?? 'high',
      crossfade: settings?.playback?.crossfade ?? true,
      autoplay: settings?.playback?.autoplay ?? true,
      normalizeVolume: settings?.playback?.normalizeVolume ?? true,
      allowRemoteControl: settings?.playback?.allowRemoteControl ?? true,
      showDevices: settings?.playback?.showDevices ?? true,
      enableOfflineMode: settings?.playback?.enableOfflineMode ?? false,
      storageLocation: settings?.playback?.storageLocation ?? 'internal'
    },
    appearance: {
      enableAnimations: settings?.appearance?.enableAnimations ?? true
    }
  };

  const renderAccountSection = () => (
    <div className="settings-section">
      <h2 className="text-2xl font-bold mb-6">{t('account')}</h2>
      
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="settings-group">
        <form onSubmit={handleProfileUpdate} className="settings-form">
          <div className="settings-field">
            <label className="text-base font-medium">{t('username')}</label>
            <input 
              type="text" 
              value={userData.username || ''} 
              readOnly 
              className="settings-input"
            />
            <p className="text-sm text-gray-500">{t('usernameHelp')}</p>
          </div>
          
          <div className="settings-field">
            <label className="text-base font-medium">{t('email')}</label>
            <input 
              type="email" 
              value={userData.email || ''} 
              readOnly 
              className="settings-input"
            />
            <p className="text-sm text-gray-500">{t('emailHelp')}</p>
          </div>
          
          <div className="settings-field">
            <label className="text-base font-medium">{t('fullName')}</label>
            <input 
              type="text" 
              value={userData.fullName || ''}
              onChange={(e) => setUserData({...userData, fullName: e.target.value})}
              className="settings-input"
            />
          </div>
          
          <div className="settings-field">
            <label className="text-base font-medium">{t('bio')}</label>
            <textarea 
              value={userData.bio || ''}
              onChange={(e) => setUserData({...userData, bio: e.target.value})}
              className="settings-textarea"
              rows={4}
            />
          </div>
          
          <div className="settings-field">
            <label className="text-base font-medium">{t('location')}</label>
            <input 
              type="text" 
              value={userData.location || ''}
              onChange={(e) => setUserData({...userData, location: e.target.value})}
              className="settings-input"
            />
          </div>
          
          <div className="settings-field">
            <label className="text-base font-medium">{t('website')}</label>
            <input 
              type="url" 
              value={userData.website || ''}
              onChange={(e) => setUserData({...userData, website: e.target.value})}
              className="settings-input"
            />
          </div>
          
          <div className="settings-actions">
            <button 
              type="submit" 
              className="primary-btn"
              disabled={isLoading}
            >
              {isLoading ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </form>
        
        <div className="settings-divider">
          <h3 className="text-xl font-bold mb-4">{t('changePassword')}</h3>
          <form onSubmit={handlePasswordChange} className="settings-form">
            <div className="settings-field">
              <label className="text-base font-medium">{t('currentPassword')}</label>
              <div className="password-input-container">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword || ''}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="settings-input"
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <PiEyeSlash /> : <PiEye />}
                </button>
              </div>
            </div>
            
            <div className="settings-field">
              <label className="text-base font-medium">{t('newPassword')}</label>
              <div className="password-input-container">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={passwordData.newPassword || ''}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="settings-input"
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <PiEyeSlash /> : <PiEye />}
                </button>
              </div>
            </div>
            
            <div className="settings-field">
              <label className="text-base font-medium">{t('confirmPassword')}</label>
              <div className="password-input-container">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword || ''}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="settings-input"
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <PiEyeSlash /> : <PiEye />}
                </button>
              </div>
            </div>
            
            <div className="settings-actions">
              <button 
                type="submit" 
                className="primary-btn"
                disabled={isLoading}
              >
                {isLoading ? t('updating') : t('updatePassword')}
              </button>
            </div>
          </form>
        </div>
        
        <div className="settings-divider danger-zone">
          <h3 className="text-xl font-bold mb-4 text-red-500">{t('deleteAccount')}</h3>
          <p className="mb-4">{t('deleteWarning')}</p>
          <button 
            onClick={handleDeleteAccount} 
            className="danger-btn"
            disabled={isLoading}
          >
            <PiTrash className="mr-2" />
            {t('deleteAccount')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="settings-section">
      <h2 className="text-2xl font-bold mb-6">{t('notifications')}</h2>
      
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="settings-group">
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('emailNotifications')}</h3>
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('newReleases')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.notifications.newReleases}
                onChange={(e) => updateSettings('notifications', { newReleases: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('newReleasesHelp')}</p>
          </div>
          
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('playlistUpdates')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.notifications.playlistUpdates}
                onChange={(e) => updateSettings('notifications', { playlistUpdates: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('playlistUpdatesHelp')}</p>
          </div>
          
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('followers')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.notifications.followers}
                onChange={(e) => updateSettings('notifications', { followers: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('followersHelp')}</p>
          </div>
        </div>
        
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('pushNotifications')}</h3>
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('nowPlaying')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.notifications.nowPlaying}
                onChange={(e) => updateSettings('notifications', { nowPlaying: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('nowPlayingHelp')}</p>
          </div>
          
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('deviceActivity')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.notifications.deviceActivity}
                onChange={(e) => updateSettings('notifications', { deviceActivity: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('deviceActivityHelp')}</p>
          </div>
        </div>
        
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('marketing')}</h3>
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('promotions')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.notifications.promotions}
                onChange={(e) => updateSettings('notifications', { promotions: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('promotionsHelp')}</p>
          </div>
          
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('newsletter')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.notifications.newsletter}
                onChange={(e) => updateSettings('notifications', { newsletter: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('newsletterHelp')}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="settings-section">
      <h2 className="text-2xl font-bold mb-6">{t('appearance')}</h2>
      
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="settings-group">
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('theme')}</h3>
          <div className="theme-options">
            <div 
              className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <div className="theme-preview dark-theme"></div>
              <span>{t('dark')}</span>
            </div>
            <div 
              className={`theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <div className="theme-preview light-theme"></div>
              <span>{t('light')}</span>
            </div>
            <div 
              className={`theme-option ${theme === 'system' ? 'active' : ''}`}
              onClick={() => setTheme('system')}
            >
              <div className="theme-preview system-theme"></div>
              <span>{t('system')}</span>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('fontSize')}</h3>
          <div className="settings-field">
            <div className="font-size-slider">
              <span className="text-sm">A</span>
              <input 
                type="range" 
                min="12" 
                max="24" 
                value={fontSize || 16}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="settings-range"
              />
              <span className="text-xl">A</span>
            </div>
            <div className="font-size-preview" style={{ fontSize: `${fontSize || 16}px` }}>
              {t('fontSizePreview')}
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('language')}</h3>
          <div className="settings-field">
            <label className="text-base font-medium">{t('selectLanguage')}</label>
            <select 
              value={language || 'en'} 
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="settings-select"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
              <option value="ru">Русский</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="zh">中文</option>
            </select>
            <p className="text-sm text-gray-500">{t('languageHelp')}</p>
          </div>
        </div>
        
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('animations')}</h3>
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('enableAnimations')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.appearance.enableAnimations}
                onChange={(e) => updateSettings('appearance', { enableAnimations: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('animationsHelp')}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="settings-section">
      <h2 className="text-2xl font-bold mb-6">{t('privacy')}</h2>
      
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="settings-group">
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('profileVisibility')}</h3>
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('publicProfile')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.privacy.publicProfile}
                onChange={(e) => updateSettings('privacy', { publicProfile: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('publicProfileHelp')}</p>
          </div>
          
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('showEmail')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.privacy.showEmail}
                onChange={(e) => updateSettings('privacy', { showEmail: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('showEmailHelp')}</p>
          </div>
        </div>
        
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('activityStatus')}</h3>
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('showActivity')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.privacy.showActivity}
                onChange={(e) => updateSettings('privacy', { showActivity: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('showActivityHelp')}</p>
          </div>
          
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('showListeningHistory')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.privacy.showListeningHistory}
                onChange={(e) => updateSettings('privacy', { showListeningHistory: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('showListeningHistoryHelp')}</p>
          </div>
        </div>
        
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('playlistVisibility')}</h3>
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('publicPlaylists')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.privacy.publicPlaylists}
                onChange={(e) => updateSettings('privacy', { publicPlaylists: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('publicPlaylistsHelp')}</p>
          </div>
        </div>
        
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('dataSharing')}</h3>
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('analytics')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.privacy.analytics}
                onChange={(e) => updateSettings('privacy', { analytics: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('analyticsHelp')}</p>
          </div>
          
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('personalization')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.privacy.personalization}
                onChange={(e) => updateSettings('privacy', { personalization: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('personalizationHelp')}</p>
          </div>
        </div>
        
        <div className="settings-divider">
          <h3 className="text-xl font-bold mb-4">{t('dataExport')}</h3>
          <p className="mb-4">{t('dataExportHelp')}</p>
          <button className="secondary-btn">
            <PiDownload className="mr-2" />
            {t('downloadData')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPlaybackSection = () => (
    <div className="settings-section">
      <h2 className="text-2xl font-bold mb-6">{t('playback')}</h2>
      
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="settings-group">
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('audioQuality')}</h3>
          <div className="settings-field">
            <label className="text-base font-medium">{t('streamingQuality')}</label>
            <select 
              value={safeSettings.playback.streamingQuality}
              onChange={(e) => updateSettings('playback', { streamingQuality: e.target.value })}
              className="settings-select"
            >
              <option value="low">{t('low')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="high">{t('high')}</option>
              <option value="veryHigh">{t('veryHigh')}</option>
            </select>
            <p className="text-sm text-gray-500">{t('streamingQualityHelp')}</p>
          </div>
          
          <div className="settings-field">
            <label className="text-base font-medium">{t('downloadQuality')}</label>
            <select 
              value={safeSettings.playback.downloadQuality}
              onChange={(e) => updateSettings('playback', { downloadQuality: e.target.value })}
              className="settings-select"
            >
              <option value="low">{t('low')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="high">{t('high')}</option>
              <option value="veryHigh">{t('veryHigh')}</option>
            </select>
            <p className="text-sm text-gray-500">{t('downloadQualityHelp')}</p>
          </div>
        </div>
        
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('playbackOptions')}</h3>
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('crossfade')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.playback.crossfade}
                onChange={(e) => updateSettings('playback', { crossfade: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('crossfadeHelp')}</p>
          </div>
          
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('autoplay')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.playback.autoplay}
                onChange={(e) => updateSettings('playback', { autoplay: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('autoplayHelp')}</p>
          </div>
          
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('normalizeVolume')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.playback.normalizeVolume}
                onChange={(e) => updateSettings('playback', { normalizeVolume: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('normalizeVolumeHelp')}</p>
          </div>
        </div>
        
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('devices')}</h3>
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('allowRemoteControl')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.playback.allowRemoteControl}
                onChange={(e) => updateSettings('playback', { allowRemoteControl: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('allowRemoteControlHelp')}</p>
          </div>
          
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('showDevices')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.playback.showDevices}
                onChange={(e) => updateSettings('playback', { showDevices: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('showDevicesHelp')}</p>
          </div>
        </div>
        
        <div className="settings-card">
          <h3 className="text-xl font-bold mb-4">{t('offlineMode')}</h3>
          <div className="settings-field">
            <div className="settings-toggle">
              <label className="text-base">{t('enableOfflineMode')}</label>
              <input 
                type="checkbox" 
                checked={safeSettings.playback.enableOfflineMode}
                onChange={(e) => updateSettings('playback', { enableOfflineMode: e.target.checked })}
              />
            </div>
            <p className="text-sm text-gray-500">{t('enableOfflineModeHelp')}</p>
          </div>
          
          <div className="settings-field">
            <label className="text-base font-medium">{t('storageLocation')}</label>
            <select 
              value={safeSettings.playback.storageLocation}
              onChange={(e) => updateSettings('playback', { storageLocation: e.target.value })}
              className="settings-select"
            >
              <option value="internal">{t('internalStorage')}</option>
              <option value="external">{t('externalStorage')}</option>
              <option value="custom">{t('customLocation')}</option>
            </select>
            <p className="text-sm text-gray-500">{t('storageLocationHelp')}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'account':
        return renderAccountSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'appearance':
        return renderAppearanceSection();
      case 'privacy':
        return renderPrivacySection();
      case 'playback':
        return renderPlaybackSection();
      default:
        return renderAccountSection();
    }
  };

  return (
    <>
      <Header />
      <div className="settings-container">
        <div className="settings-sidebar">
          <button 
            className={`settings-nav-item ${activeSection === 'account' ? 'active' : ''}`}
            onClick={() => setActiveSection('account')}
          >
            <PiUser className="text-xl" />
            <span className="text-base">{t('account')}</span>
          </button>
          <button 
            className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <PiBell className="text-xl" />
            <span className="text-base">{t('notifications')}</span>
          </button>
          <button 
            className={`settings-nav-item ${activeSection === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveSection('appearance')}
          >
            <PiPalette className="text-xl" />
            <span className="text-base">{t('appearance')}</span>
          </button>
          <button 
            className={`settings-nav-item ${activeSection === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveSection('privacy')}
          >
            <PiShield className="text-xl" />
            <span className="text-base">{t('privacy')}</span>
          </button>
          <button 
            className={`settings-nav-item ${activeSection === 'playback' ? 'active' : ''}`}
            onClick={() => setActiveSection('playback')}
          >
            <PiHeadphones className="text-xl" />
            <span className="text-base">{t('playback')}</span>
          </button>
          <button 
            className="settings-nav-item logout"
            onClick={handleLogout}
          >
            <PiSignOut className="text-xl" />
            <span className="text-base">{t('logout')}</span>
          </button>
        </div>
        <div className="settings-content">
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default Settings; 