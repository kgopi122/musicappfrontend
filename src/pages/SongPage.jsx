import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { songs, getSongsByMovie } from '../data';
import { usePlayer } from '../PlayerContext';
import { useLibrary } from '../LibraryContext';
import { PiPlay, PiPause, PiHeart, PiPlus, PiArrowLeft, PiHeartFill, PiPlusCircleFill, PiDownloadSimple } from 'react-icons/pi';
import DownloadButton from '../components/DownloadButton';
import DownloadQualityDropdown from '../components/DownloadQualityModal';
import './SongPage.css';

const SongPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSong, isPlaying, setIsPlaying, setPlaylist } = usePlayer();
  const { favorites, addToFavorites, removeFromFavorites, addToPlaylist } = useLibrary();
  const [song, setSong] = useState(null);
  const [duration, setDuration] = useState('');
  const [relatedSongs, setRelatedSongs] = useState({
    sameMovie: [],
    sameArtist: [],
    sameGenre: []
  });
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [downloadPosition, setDownloadPosition] = useState({ top: 0, left: 0 });

  // Helper function to parse size string to bytes
  const parseSizeToBytes = (sizeStr) => {
    const units = { 'B': 1, 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024 };
    const [size, unit] = sizeStr.split(' ');
    return parseFloat(size) * units[unit];
  };

  // Helper function to compress audio
  const compressAudio = async (audioBuffer, targetSize) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();

    const renderedBuffer = await offlineContext.startRendering();
    return renderedBuffer;
  };

  // Helper function to convert AudioBuffer to WAV
  const audioBufferToWav = (buffer) => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = buffer.length * blockAlign;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, totalSize - 8, true);
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
    const channelData = [];
    for (let i = 0; i < numChannels; i++) {
      channelData.push(buffer.getChannelData(i));
    }

    let pos = 0;
    while (pos < buffer.length) {
      for (let i = 0; i < numChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i][pos]));
        const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset + pos * blockAlign + i * bytesPerSample, value, true);
      }
      pos++;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  // Helper function to write string to DataView
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Add toast notification function
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

  useEffect(() => {
    const foundSong = songs.find(s => s.id === id);
    if (foundSong) {
      setSong(foundSong);
      loadDuration(foundSong);
      
      // Find songs from the same movie only
      const sameMovieSongs = songs.filter(s => 
        s.id !== foundSong.id && 
        s.movieName === foundSong.movieName
      );
      
      setRelatedSongs({
        sameMovie: sameMovieSongs,
        sameArtist: [], // Clear these as we're only showing same movie songs
        sameGenre: []
      });
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  const loadDuration = async (song) => {
    try {
      const audio = new Audio(song.audioSrc);
      await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          const minutes = Math.floor(audio.duration / 60);
          const seconds = Math.floor(audio.duration % 60);
          setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          resolve();
        });
        audio.load();
      });
    } catch (error) {
      console.error(`Error loading duration for ${song.title}:`, error);
      setDuration(song.duration || '0:00');
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    } else {
      setPlaylist([song]);
      setIsPlaying(true);
    }
  };

  const handleSongCardClick = (e) => {
    // Only play if the click is not on an action button
    if (!e.target.closest('.song-actions')) {
      handlePlayClick(e);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (favorites.some(fav => fav.id === song.id)) {
      removeFromFavorites(song);
    } else {
      addToFavorites(song);
    }
  };

  const handleAddToPlaylist = (e) => {
    e.stopPropagation();
    addToPlaylist(song);
  };

  const handleRelatedSongClick = (relatedSong, e) => {
    e.stopPropagation();
    // Only play if the click is not on an action button
    if (!e.target.closest('.song-actions')) {
      setPlaylist([relatedSong]);
      setIsPlaying(true);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDownload = async (quality) => {
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

  const handleDownloadClick = (song, event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setDownloadPosition({
      top: rect.top,
      left: rect.left + rect.width / 2
    });
    setSelectedSong(song);
    setShowQualityModal(true);
  };

  const handleRecommendedSongClick = (e, song) => {
    e.stopPropagation();
    const recommendedSongs = [song, ...relatedSongs.filter(s => s.id !== song.id)];
    setPlaylist(recommendedSongs);
    setIsPlaying(true);
  };

  const handleLikeSong = (song, event) => {
    event.stopPropagation();
    if (favorites.some(fav => fav.id === song.id)) {
      removeFromFavorites(song);
    } else {
      addToFavorites(song);
    }
  };

  const handleAddToPlaylist = (song, index, event) => {
    event.stopPropagation();
    addToPlaylist(song);
    setTimeout(() => {
      // Remove the song from the playlist
      setPlaylist(playlist => playlist.filter(s => s.id !== song.id));
    }, 2000);
  };

  if (!song) return null;

  // Check if there are any songs from the same movie
  const hasSameMovieSongs = relatedSongs.sameMovie.length > 0;
  
  // Check if there are any songs from the same artist or genre
  const hasRelatedSongs = relatedSongs.sameArtist.length > 0 || relatedSongs.sameGenre.length > 0;

  return (
    <div className="song-page">
      <div className="song-page-header">
        <button className="back-button" onClick={handleBackClick}>
          <PiArrowLeft />
        </button>
        <h1>Now Playing</h1>
      </div>

      <div className="song-details">
        <div className="song-image-container" onClick={handleSongCardClick}>
          <img src={song.image} alt={song.title} className="song-image" />
          <div className="song-overlay">
            <button 
              className={`play-button ${currentSong?.id === song.id && isPlaying ? 'playing' : ''}`}
              onClick={handlePlayClick}
            >
              {currentSong?.id === song.id && isPlaying ? <PiPause /> : <PiPlay />}
            </button>
          </div>
        </div>
        <div className="song-info">
          <h2>{song.title}</h2>
          <p className="artist artist-name" style={{ color: 'green', cursor: 'pointer' }}>{song.artist}</p>
          <p className="movie movie-name" style={{ cursor: 'pointer' }}>{song.movieName}</p>
          <p className="genre">{song.genre}</p>
          <p className="year">{song.year}</p>
          <p className="duration">{duration || song.duration}</p>
          <div className="song-actions">
            <button 
              className={`action-button ${favorites.some(fav => fav.id === song.id) ? 'liked' : ''}`}
              onClick={handleLikeClick}
            >
              <PiHeart />
            </button>
            <button 
              className="action-button"
              onClick={handleAddToPlaylist}
            >
              <PiPlus />
            </button>
            <button
              className="action-button"
              onClick={(e) => handleDownloadClick(song, e)}
            >
              <PiDownloadSimple />
            </button>
          </div>
        </div>
      </div>

      <div className="song-lyrics">
        <h3>Lyrics</h3>
        <p>{song.lyrics}</p>
      </div>

      {hasSameMovieSongs && (
        <div className="related-songs">
          <h3>Top Results</h3>
          <div className="songs-grid">
            {relatedSongs.sameMovie.map((relatedSong, index) => (
              <div 
                key={relatedSong.id} 
                className="song-card"
                onClick={(e) => {
                  // Only play if not clicking on buttons
                  if (!e.target.closest('.song-actions') && 
                      !e.target.closest('.add-download') && 
                      !e.target.closest('.action-button')) {
                    handleRecommendedSongClick(e, relatedSong);
                  }
                }}
              >
                <div className="song-image-container">
                  <img src={relatedSong.image} alt={relatedSong.title} className="song-image" />
                  <div className="song-overlay">
                    <button 
                      className={`play-button ${currentSong?.id === relatedSong.id && isPlaying ? 'playing' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRecommendedSongClick(e, relatedSong);
                      }}
                    >
                      {currentSong?.id === relatedSong.id && isPlaying ? <PiPause /> : <PiPlay />}
                    </button>
                  </div>
                </div>
                <div className="song-info">
                  <h3>{relatedSong.title}</h3>
                  <p className="artist-name" style={{ color: 'green', cursor: 'pointer' }}>{relatedSong.artist}</p>
                  <div className="add-download">
                    <button
                      className={`control-button-like ${favorites.some(fav => fav.id === relatedSong.id) ? 'liked' : ''}`}
                      onClick={(e) => handleLikeSong(relatedSong, e)}
                    >
                      <PiHeartFill />
                    </button>
                    <button
                      className={`song-action-button ${addToPlaylist(relatedSong) ? 'added' : ''}`}
                      onClick={(e) => handleAddToPlaylist(relatedSong, index, e)}
                    >
                      <PiPlusCircleFill />
                    </button>
                    <button
                      className="song-action-button"
                      onClick={(e) => handleDownloadClick(relatedSong, e)}
                    >
                      <PiDownloadSimple />
                    </button>
                    <span className="duration">{duration || relatedSong.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasRelatedSongs && (
        <div className="related-songs">
          <h3>You May Like This</h3>
          <div className="songs-grid">
            {[...relatedSongs.sameArtist, ...relatedSongs.sameGenre].map((relatedSong, index) => (
              <div 
                key={relatedSong.id} 
                className="song-card"
                onClick={(e) => {
                  // Only play if not clicking on buttons
                  if (!e.target.closest('.song-actions') && 
                      !e.target.closest('.add-download') && 
                      !e.target.closest('.action-button')) {
                    handleRecommendedSongClick(e, relatedSong);
                  }
                }}
              >
                <div className="song-image-container">
                  <img src={relatedSong.image} alt={relatedSong.title} className="song-image" />
                  <div className="song-overlay">
                    <button 
                      className={`play-button ${currentSong?.id === relatedSong.id && isPlaying ? 'playing' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRecommendedSongClick(e, relatedSong);
                      }}
                    >
                      {currentSong?.id === relatedSong.id && isPlaying ? <PiPause /> : <PiPlay />}
                    </button>
                  </div>
                </div>
                <div className="song-info">
                  <h3>{relatedSong.title}</h3>
                  <p className="artist-name" style={{ color: 'green', cursor: 'pointer' }}>{relatedSong.artist}</p>
                  <div className="add-download">
                    <button
                      className={`control-button-like ${favorites.some(fav => fav.id === relatedSong.id) ? 'liked' : ''}`}
                      onClick={(e) => handleLikeSong(relatedSong, e)}
                    >
                      <PiHeartFill />
                    </button>
                    <button
                      className={`song-action-button ${addToPlaylist(relatedSong) ? 'added' : ''}`}
                      onClick={(e) => handleAddToPlaylist(relatedSong, index, e)}
                    >
                      <PiPlusCircleFill />
                    </button>
                    <button
                      className="song-action-button"
                      onClick={(e) => handleDownloadClick(relatedSong, e)}
                    >
                      <PiDownloadSimple />
                    </button>
                    <span className="duration">{duration || relatedSong.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Quality Modal */}
      <DownloadQualityDropdown
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        onQualitySelect={handleDownload}
        song={selectedSong}
        position={downloadPosition}
      />
    </div>
  );
};

export default SongPage; 