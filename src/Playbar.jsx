import React, { useContext, useState, useRef, useEffect } from 'react';
import { PlayerContext } from './PlayerContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faPause, 
  faForward, 
  faBackward, 
  faVolumeUp, 
  faVolumeMute,
  faVolumeDown,
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
  
  faShuffle,
  faRepeat,
  faHeart,
  faHeart as faHeartSolid,
  faList,
  faRotateRight
} from '@fortawesome/free-solid-svg-icons';
import './Playbar.css';
import { AZURE_CONFIG } from './config/azure';

const Playbar = () => {
  const { 
    currentSong, 
    isPlaying, 
    setIsPlaying,
    handlePlayPause,
    handleNext,
    handlePrevious,
    progress,
    duration,
    seekTo,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isShuffling,
    setIsShuffling,
    isLooping,
    setIsLooping,
    toggleFavorite,
    isFavorite,
    formatTime,
    audioRef
  } = useContext(PlayerContext);

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeRef = useRef(null);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [currentTime, setCurrentTime] = useState(0);

  // Format time in MM:SS
  const formatTimeDisplay = (time) => {
    if (!time) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, [audioRef]);

  // Handle volume slider click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get volume icon based on level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return faVolumeMute;
    if (volume < 0.3) return faVolumeLow;
    if (volume < 0.7) return faVolumeDown;
    return faVolumeHigh;
  };

  // Toggle shuffle
  const toggleShuffle = () => {
    setIsShuffling(!isShuffling);
  };

  // Toggle repeat
  const toggleRepeat = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Cycle through repeat modes: off -> all -> one -> off
    if (repeatMode === 'off') {
      setRepeatMode('all');
      audio.loop = true;
      setIsLooping(true);
    } else if (repeatMode === 'all') {
      setRepeatMode('one');
      audio.loop = false;
      setIsLooping(true);
    } else {
      setRepeatMode('off');
      audio.loop = false;
      setIsLooping(false);
    }
  };

  // Get repeat icon based on mode
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'all':
        return faRepeat;
      case 'one':
        return faRotateRight;
      default:
        return faRepeat;
    }
  };

  // Get repeat tooltip based on mode
  const getRepeatTooltip = () => {
    switch (repeatMode) {
      case 'all':
        return 'Repeat All';
      case 'one':
        return 'Repeat One';
      default:
        return 'Repeat Off';
    }
  };

  // Handle song end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === 'all') {
        handleNext();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [repeatMode, handleNext, audioRef]);

  return (
    <div className="playbar">
      <div className="playbar-content">
        {/* Left section - Song info */}
        <div className="song-info">
          <img 
            src={currentSong?.image || '/vibe-guru-logo.png'} 
            alt={currentSong?.title || 'No song playing'} 
            className="song-thumbnail"
          />
          <div className="song-details">
            <h4>{currentSong?.title || 'No song playing'}</h4>
            <p style={{ color: 'green', cursor: 'pointer' }}>{currentSong?.artist || 'Select a song to play'}</p>
          </div>
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
            title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            disabled={!currentSong}
          >
            <FontAwesomeIcon icon={isFavorite ? faHeartSolid : faHeart} />
          </button>
        </div>

        {/* Center section - Player controls */}
        <div className="player-controls">
          <div className="control-buttons">
            <button 
              className={`control-btn ${isShuffling ? 'active' : ''}`}
              onClick={toggleShuffle}
              title={isShuffling ? 'Shuffle On' : 'Normal Playback'}
              disabled={!currentSong}
            >
              <FontAwesomeIcon icon={isShuffling ? faShuffle : faList} />
            </button>
            
            <button 
              className="control-btn"
              onClick={handlePrevious}
              title="Previous Track"
              disabled={!currentSong}
            >
              <FontAwesomeIcon icon={faBackward} />
            </button>
            
            <button 
              className="play-btn"
              onClick={handlePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
              disabled={!currentSong}
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>
            
            <button 
              className="control-btn"
              onClick={handleNext}
              title="Next Track"
              disabled={!currentSong}
            >
              <FontAwesomeIcon icon={faForward} />
            </button>
            
            <button 
              className={`control-btn ${repeatMode !== 'off' ? 'active' : ''}`}
              onClick={toggleRepeat}
              title={getRepeatTooltip()}
              disabled={!currentSong}
            >
              <FontAwesomeIcon icon={getRepeatIcon()} />
              {repeatMode === 'one' && <span className="repeat-one-indicator">1</span>}
            </button>
          </div>

          <div className="progress-container">
            <span className="time current">{formatTimeDisplay(currentTime)}</span>
            <div className="progress-bar">
              <div 
                className="progress"
                style={{ width: `${progress}%` }}
              />
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="progress-input"
                disabled={!currentSong}
              />
            </div>
            <span className="time duration">{formatTimeDisplay(duration)}</span>
          </div>
        </div>

        {/* Right section - Volume control */}
        <div className="volume-control" ref={volumeRef}>
          <button 
            className="volume-btn"
            onClick={toggleMute}
            onMouseEnter={() => setShowVolumeSlider(true)}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <FontAwesomeIcon icon={getVolumeIcon()} />
          </button>
          {showVolumeSlider && (
            <div className="volume-slider-container">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="volume-slider"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playbar;
