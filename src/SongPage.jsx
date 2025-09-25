import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  PiPlayFill, PiPauseFill, PiPlusCircleFill, PiDownloadSimple,
  PiSkipBackFill, PiSkipForwardFill, PiShuffleFill, PiRepeatFill, PiHeartFill
} from 'react-icons/pi';
import { requireAuth } from './utils/auth';
import { likedSongsApi, playlistSongsApi } from './api';
import DownloadQualityDropdown from './components/DownloadQualityModal';

import './SongPage.css';
import './Playbar.css';
import Header from './header';
import { LibraryContext } from './LibraryContext';
import { PlayerContext } from './PlayerContext';

// Song video mapping
const songVideos = {
  'Tum Hi Ho': '/videos/tum-hi-ho.mp4',
  'Raabta': '/videos/raabta.mp4',
  'Kesariya': '/videos/kesariya.mp4',
  'Tum Se Hi': '/videos/tum-se-hi.mp4',
  'default': '/videos/default-music-bg.mp4'
};

const SongPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { song: initialSong, recommendedSongs: initialRecommendedSongs } = location.state || {};
  const [durations, setDurations] = useState({});
  const [addedSongIndex, setAddedSongIndex] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [currentLyrics, setCurrentLyrics] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const lyricsRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('');
  const { songId } = useParams();
  const [currentTime, setCurrentTime] = useState(0);
  const [downloadPosition, setDownloadPosition] = useState({ top: 0, left: 0 });
  const [selectedSong, setSelectedSong] = useState(null);
  const [showQualityModal, setShowQualityModal] = useState(false);

  // Add state for feedback messages
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!requireAuth(navigate)) return;
  }, [songId, navigate]);

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

  // Combine main song with recommended songs and set up playlist
  useEffect(() => {
    if (initialSong) {
      // Get all songs from the same movie from the current playlist context if available
      const movieSongs = (allSongs.length > 0 ? allSongs : [initialSong]).filter(song =>
        song.movieName === initialSong.movieName
      );

      const sortedMovieSongs = movieSongs.sort((a, b) => a.id - b.id);
      setAllSongs(sortedMovieSongs);

      setCurrentVideo(songVideos[initialSong.title] || songVideos.default);
      setCurrentPlaylist(sortedMovieSongs);

      const similarSongs = sortedMovieSongs.filter(song =>
        song.id !== initialSong.id && (song.artist === initialSong.artist || song.genre === initialSong.genre)
      );
      const sortedSimilarSongs = similarSongs; 
      setRecommendedSongs(sortedSimilarSongs);
    }
  }, [initialSong, setCurrentPlaylist]);

  // Add state for recommended songs
  const [recommendedSongs, setRecommendedSongs] = useState([]);

  // ✅ Preload durations (parallel and reliable)
  useEffect(() => {
    const loadDurations = async () => {
      const promises = allSongs.map((song, index) => {
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
  }, [allSongs]);

  // Handle recommended song click
  const handleRecommendedSongClick = (recSong, index, event) => {
    // Check if the click was on an action button or its children
    if (event.target.closest('.song-actions') || 
        event.target.closest('.add-download') || 
        event.target.closest('.action-button')) {
      return;
    }
    
    event.stopPropagation();
    
    // Create a new playlist starting from the clicked song
    const newPlaylist = allSongs.slice(index);
    setCurrentSong(recSong);
    setPlaylist(newPlaylist);
    play();
  };

  // Handle similar song click
  const handleSimilarSongClick = (similarSong, event) => {
    event.stopPropagation();

    // Create a new playlist with the similar song and other similar songs
    const similarSongsPlaylist = recommendedSongs.filter(song =>
      song.id !== similarSong.id
    );
    const newPlaylist = [similarSong, ...similarSongsPlaylist];
    setCurrentPlaylist(newPlaylist);

    setCurrentSong(similarSong);
    setIsPlaying(true);
  };

  // Handle next song in song page
  const handleNextSong = () => {
    const currentIndex = allSongs.findIndex(song => song.id === currentSong?.id);
    if (currentIndex < allSongs.length - 1) {
      const nextSong = allSongs[currentIndex + 1];
      setCurrentSong(nextSong);
      setIsPlaying(true);
      // Update playlist to maintain context with only movie songs
      const newPlaylist = allSongs.slice(currentIndex + 1);
      setCurrentPlaylist(newPlaylist);
    }
  };

  // Handle previous song in song page
  const handlePreviousSong = () => {
    const currentIndex = allSongs.findIndex(song => song.id === currentSong?.id);
    if (currentIndex > 0) {
      const prevSong = allSongs[currentIndex - 1];
      setCurrentSong(prevSong);
      setIsPlaying(true);
      // Update playlist to maintain context with only movie songs
      const newPlaylist = allSongs.slice(currentIndex - 1);
      setCurrentPlaylist(newPlaylist);
    }
  };

  // Show feedback message
  const showFeedbackMessage = (message) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setFeedbackMessage('');
    }, 2000);
  };

  // Update isLiked and isInPlaylist functions
  const isLiked = (song) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return false;
    
    const storedLikedSongs = localStorage.getItem(`musicapp_${userEmail}_likedSongs`);
    if (!storedLikedSongs) return false;
    
    const likedSongs = JSON.parse(storedLikedSongs);
    return likedSongs.some(s => s.id === song.id);
  };

  const isInPlaylist = (song) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return false;
    
    const storedPlaylistSongs = localStorage.getItem(`musicapp_${userEmail}_playlistSongs`);
    if (!storedPlaylistSongs) return false;
    
    const playlistSongs = JSON.parse(storedPlaylistSongs);
    return playlistSongs.some(s => s.id === song.id);
  };

  // Initialize liked and playlist songs from localStorage
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    // Initialize liked songs
    const storedLikedSongs = localStorage.getItem(`musicapp_${userEmail}_likedSongs`);
    if (storedLikedSongs) {
      setLikedSongs(JSON.parse(storedLikedSongs));
    }

    // Initialize playlist songs
    const storedPlaylistSongs = localStorage.getItem(`musicapp_${userEmail}_playlistSongs`);
    if (storedPlaylistSongs) {
      setPlaylistSongs(JSON.parse(storedPlaylistSongs));
    }
  }, []);

  // Handle like song
  const handleLikeSong = (song) => {
    if (!requireAuth(navigate)) return;

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    // Get existing liked songs from localStorage
    const storedLikedSongs = localStorage.getItem(`musicapp_${userEmail}_likedSongs`);
    let likedSongs = storedLikedSongs ? JSON.parse(storedLikedSongs) : [];

    if (likedSongs.some(s => s.id === song.id)) {
      // Remove from liked songs
      likedSongs = likedSongs.filter(s => s.id !== song.id);
      showToast('Removed from favorites', 'info');
    } else {
      // Add to liked songs with timestamp
      const songWithTimestamp = {
        ...song,
        addedAt: new Date().toISOString()
      };
      likedSongs.push(songWithTimestamp);
      showToast('Added to favorites', 'success');
    }

    // Save updated liked songs to localStorage
    localStorage.setItem(`musicapp_${userEmail}_likedSongs`, JSON.stringify(likedSongs));
    
    // Update the UI
    setLikedSongs(likedSongs);
  };

  // Handle add to playlist
  const handleAddToPlaylist = (song) => {
    if (!requireAuth(navigate)) return;

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    // Get existing playlist songs from localStorage
    const storedPlaylistSongs = localStorage.getItem(`musicapp_${userEmail}_playlistSongs`);
    let playlistSongs = storedPlaylistSongs ? JSON.parse(storedPlaylistSongs) : [];

    if (playlistSongs.some(s => s.id === song.id)) {
      showToast('Song already in playlist', 'info');
      return;
    }

    // Add to playlist with timestamp
    const songWithTimestamp = {
      ...song,
      addedAt: new Date().toISOString()
    };
    playlistSongs.push(songWithTimestamp);

    // Save updated playlist songs to localStorage
    localStorage.setItem(`musicapp_${userEmail}_playlistSongs`, JSON.stringify(playlistSongs));
    showToast('Added to playlist', 'success');
    
    // Update the UI
    setPlaylistSongs(playlistSongs);
  };

  // Handle download
  const handleDownload = async (song, event) => {
    event.stopPropagation();
    
    try {
      showToast('Preparing download...', 'info');

      // Get the original file path and name
      const originalPath = song.audioSrc;
      const fileName = originalPath.split('/').pop(); // Get the original filename

      // Fetch the original audio file
      const response = await fetch(originalPath, {
        headers: {
          'Accept': 'audio/*',
          'Content-Type': 'audio/mpeg'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audio file');
      }

      // Get the audio data
      const audioData = await response.arrayBuffer();
      if (!audioData || audioData.byteLength === 0) {
        throw new Error('Received empty audio data');
      }

      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Decode the audio data
      const audioBuffer = await audioContext.decodeAudioData(audioData);

      // Convert to WAV
      const wavBlob = audioBufferToWav(audioBuffer);

      // Create and trigger download with original filename
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; // Use the original filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Clean up
      await audioContext.close();

      showToast('Download complete!', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showToast('Download failed. Please try again.', 'error');
    }
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

  // Helper function to write string to DataView
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

  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
    if (!showLyrics && currentSong) {
      const lyrics = songLyrics[currentSong.title] || songLyrics.default;
      setCurrentLyrics(lyrics);
    }
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleVideoError = (e) => {
    console.error('Video error:', e);
    setCurrentVideo(songVideos.default);
  };

  // Sample lyrics for songs
  const songLyrics = {
    'Tum Hi Ho': [
      { time: 0, text: "Tum hi ho, tum hi ho" },
      { time: 4, text: "Aashiqui hai tum hi ho" },
      { time: 8, text: "Tum hi ho, tum hi ho" },
      { time: 12, text: "Aashiqui hai tum hi ho" },
      { time: 16, text: "Tum hi ho, tum hi ho" },
      { time: 20, text: "Aashiqui hai tum hi ho" },
      { time: 24, text: "Tum hi ho, tum hi ho" },
      { time: 28, text: "Aashiqui hai tum hi ho" }
    ],
    'Raabta': [
      { time: 0, text: "Raabta, raabta, raabta" },
      { time: 4, text: "Tere sang yaara" },
      { time: 8, text: "Raabta, raabta, raabta" },
      { time: 12, text: "Tere sang yaara" },
      { time: 16, text: "Raabta, raabta, raabta" },
      { time: 20, text: "Tere sang yaara" },
      { time: 24, text: "Raabta, raabta, raabta" },
      { time: 28, text: "Tere sang yaara" }
    ],
    'Kesariya': [
      { time: 0, text: "Kesariya, kesariya" },
      { time: 4, text: "Tera ishq hai piya" },
      { time: 8, text: "Kesariya, kesariya" },
      { time: 12, text: "Tera ishq hai piya" },
      { time: 16, text: "Kesariya, kesariya" },
      { time: 20, text: "Tera ishq hai piya" },
      { time: 24, text: "Kesariya, kesariya" },
      { time: 28, text: "Tera ishq hai piya" }
    ],
    'Tum Se Hi': [
      { time: 0, text: "Tum se hi, tum se hi" },
      { time: 4, text: "Dil ko hai aaram" },
      { time: 8, text: "Tum se hi, tum se hi" },
      { time: 12, text: "Dil ko hai aaram" },
      { time: 16, text: "Tum se hi, tum se hi" },
      { time: 20, text: "Dil ko hai aaram" },
      { time: 24, text: "Tum se hi, tum se hi" },
      { time: 28, text: "Dil ko hai aaram" }
    ],
    'default': [
      { time: 0, text: "This is the beginning of the song" },
      { time: 4, text: "Where the melody starts to flow" },
      { time: 8, text: "And the rhythm takes control" },
      { time: 12, text: "As the music starts to grow" },
      { time: 16, text: "Feel the beat in your soul" },
      { time: 20, text: "Let the harmony unfold" },
      { time: 24, text: "As the story is told" },
      { time: 28, text: "Through the music we know" }
    ]
  };

  // Update current time and lyrics
  useEffect(() => {
    if (!audioRef.current) return;

    const updateTime = () => {
      setCurrentTime(audioRef.current.currentTime);
    };

    audioRef.current.addEventListener('timeupdate', updateTime);
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateTime);
      }
    };
  }, [audioRef]);

  // Update current lyrics based on time
  useEffect(() => {
    if (!currentSong) return;

    const lyrics = songLyrics[currentSong.title] || songLyrics.default;
    const currentLyricIndex = lyrics.findIndex(lyric => lyric.time > currentTime) - 1;
    setCurrentLyricIndex(currentLyricIndex >= 0 ? currentLyricIndex : 0);
    setCurrentLyrics(lyrics);
  }, [currentTime, currentSong]);

  // Update song details when currentSong changes
  useEffect(() => {
    if (currentSong) {
      // Update video
      setCurrentVideo(songVideos[currentSong.title] || songVideos.default);

      // Update lyrics
      if (currentSong.lyrics) {
        const lyricsLines = currentSong.lyrics.split('\n').map(line => ({ text: line }));
        setCurrentLyrics(lyricsLines);
      } else {
        const lyrics = songLyrics[currentSong.title] || songLyrics.default;
        setCurrentLyrics(lyrics);
      }

      // Update playlist to maintain song page context with only movie songs
      const currentIndex = allSongs.findIndex(song => song.id === currentSong.id);
      if (currentIndex !== -1) {
        const newPlaylist = allSongs.slice(currentIndex);
        setCurrentPlaylist(newPlaylist);
      }
    }
  }, [currentSong, allSongs, setCurrentPlaylist]);

  // Check liked and playlist status on component load
  useEffect(() => {
    const checkSongStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Check liked status for all songs
        const likedPromises = allSongs.map(song =>
          fetch(`/api/liked-songs/check/${song.id}`, {
            headers: { 'Authorization': token }
          }).then(res => res.json())
        );

        // Check playlist status for all songs
        const playlistPromises = allSongs.map(song =>
          fetch(`/api/playlist-songs/check/${song.id}`, {
            headers: { 'Authorization': token }
          }).then(res => res.json())
        );

        const [likedResults, playlistResults] = await Promise.all([
          Promise.all(likedPromises),
          Promise.all(playlistPromises)
        ]);

        // Update liked songs
        const newLikedSongs = allSongs.filter((song, index) => likedResults[index].liked);
        setLikedSongs(newLikedSongs);

        // Update playlist songs
        const newPlaylistSongs = allSongs.filter((song, index) => playlistResults[index].inPlaylist);
        setPlaylistSongs(newPlaylistSongs);
      } catch (error) {
        console.error('Error checking song status:', error);
      }
    };

    if (allSongs.length > 0) {
      checkSongStatus();
    }
  }, [allSongs]);

  // Function to migrate data from localStorage to database
  const migrateDataToDatabase = async () => {
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');
    
    if (!userEmail || !token) {
      showToast('Please login to migrate data', 'error');
      return;
    }

    try {
      showToast('Starting data migration...', 'info');

      // Get liked songs from localStorage
      const storedLikedSongs = localStorage.getItem(`musicapp_${userEmail}_likedSongs`);
      const likedSongs = storedLikedSongs ? JSON.parse(storedLikedSongs) : [];

      // Get playlist songs from localStorage
      const storedPlaylistSongs = localStorage.getItem(`musicapp_${userEmail}_playlistSongs`);
      const playlistSongs = storedPlaylistSongs ? JSON.parse(storedPlaylistSongs) : [];

      // Migrate liked songs
      for (const song of likedSongs) {
        try {
          const response = await fetch(`/api/liked-songs/toggle`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': token
            },
            body: JSON.stringify({
              songId: parseInt(song.id),
              songTitle: song.title,
              artist: song.artist,
              movieName: song.movieName || '',
              imageUrl: song.image,
              audioSrc: song.audioSrc
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error migrating liked song ${song.title}:`, errorText);
            throw new Error(`Failed to migrate liked song ${song.title}`);
          }

          // Wait a bit between requests to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error migrating liked song ${song.title}:`, error);
          showToast(`Failed to migrate ${song.title}. Continuing with others...`, 'error');
        }
      }

      // Migrate playlist songs
      for (const song of playlistSongs) {
        try {
          const response = await fetch(`/api/playlist-songs/add`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': token
            },
            body: JSON.stringify({
              songId: parseInt(song.id),
              songTitle: song.title,
              artist: song.artist,
              movieName: song.movieName || '',
              imageUrl: song.image,
              audioSrc: song.audioSrc
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error migrating playlist song ${song.title}:`, errorText);
            throw new Error(`Failed to migrate playlist song ${song.title}`);
          }

          // Wait a bit between requests to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error migrating playlist song ${song.title}:`, error);
          showToast(`Failed to migrate ${song.title}. Continuing with others...`, 'error');
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem(`musicapp_${userEmail}_likedSongs`);
      localStorage.removeItem(`musicapp_${userEmail}_playlistSongs`);

      showToast('Data migration completed successfully!', 'success');
    } catch (error) {
      console.error('Migration error:', error);
      showToast('Failed to migrate data. Please try again.', 'error');
    }
  };

  // Add migration button to the UI
  const renderMigrationButton = () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return null;

    const hasLocalData = localStorage.getItem(`musicapp_${userEmail}_likedSongs`) || 
                        localStorage.getItem(`musicapp_${userEmail}_playlistSongs`);

    if (!hasLocalData) return null;

    return (
      <button 
        className="migrate-data-button"
        onClick={migrateDataToDatabase}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: '#1DB954',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        Migrate Data to Database
      </button>
    );
  };

  // Add handleArtistClick function
  const handleArtistClick = (artistName) => {
    const encodedArtistName = encodeURIComponent(artistName);
    navigate(`/artist/${encodedArtistName}`);
  };

  if (!initialSong) {
    return <div>Song not found</div>;
  }

  return (
    <div id="songPage">
      {renderMigrationButton()}
      {showFeedback && (
        <div className="feedback-message">
          {feedbackMessage}
        </div>
      )}
      <div id="songPage-main-content">
        <div id="songPage-song-details">
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
          <div id="songPage-song-details-container">
            <div className="song-details-main">
              <div className="songPage-song-image-container">
                <img src={currentSong?.image || initialSong?.image} alt={currentSong?.title || initialSong?.title} />
              </div>
              <div id="songPage-song-info">
                <h2>{currentSong?.title || initialSong?.title}</h2>
                <p 
                  className="artist-name" 
                  style={{ color: 'green', cursor: 'pointer' }}
                  onClick={() => handleArtistClick(currentSong?.artist || initialSong?.artist)}
                >
                  {currentSong?.artist || initialSong?.artist}
                </p>
                <p className="movie-name" style={{ cursor: 'pointer' }}>{currentSong?.movieName || initialSong?.movieName}</p>
                <p>{currentSong?.year || initialSong?.year}</p>
                <button
                  className={`show-lyrics-button ${showLyrics ? 'active' : ''}`}
                  onClick={toggleLyrics}
                >
                  {showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
                </button>
              </div>
            </div>

            {showLyrics && (
              <div className="lyrics-section">
                <div className="lyrics-content" ref={lyricsRef}>
                  {currentLyrics.map((line, index) => (
                    <p
                      key={index}
                      className={`lyrics-line ${currentLyricIndex === index ? 'active' : ''}`}
                    >
                      {line.text}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div id="recommended-songs">
          <h3>Songs from {initialSong.movieName}</h3>
          <div className="recommended-songs-list">
            {allSongs
              .filter(recSong => recSong.id !== initialSong.id)
              .map((recSong, index) => (
                <div
                  key={recSong.id}
                  className={`recommended-song-item ${currentSong?.id === recSong.id ? 'selected-song' : ''}`}
                  onClick={(e) => {
                    if (!e.target.closest('.song-actions') && 
                        !e.target.closest('.add-download') && 
                        !e.target.closest('.action-button')) {
                      handleRecommendedSongClick(recSong, index, e);
                    }
                  }}
                >
                  <div className="recommended-song-info">
                    <img src={recSong.image} alt={recSong.title} />
                    <div>
                      <h4>{recSong.title}</h4>
                      <p 
                        className="artist-name" 
                        style={{ color: 'green', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArtistClick(recSong.artist);
                        }}
                      >
                        {recSong.artist}
                      </p>
                    </div>
                  </div>
                  <div className="add-download">
                    <button
                      className={`control-button-like ${isLiked(recSong) ? 'liked' : ''}`}
                      onClick={(e) => handleLikeSong(recSong)}
                      title={isLiked(recSong) ? 'Remove from liked songs' : 'Add to liked songs'}
                    >
                      <PiHeartFill />
                    </button>
                    <button
                      className={`song-action-button ${isInPlaylist(recSong) ? 'added' : ''}`}
                      onClick={(e) => handleAddToPlaylist(recSong)}
                      title={isInPlaylist(recSong) ? 'Remove from playlist' : 'Add to playlist'}
                    >
                      <PiPlusCircleFill />
                    </button>
                    <button className="song-action-button" title="Download song" onClick={(e) => handleDownload(recSong, e)}>
                      <PiDownloadSimple />
                      
                    </button>
                    <span className="duration">{durations[index] || '--:--'}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div id="you-may-also-like">
          <h3>You May Also Like</h3>
          <div className="horizontal-songs-list">
            {recommendedSongs.map((similarSong) => (
              <div
                key={similarSong.id}
                className="horizontal-song-card"
                onClick={(e) => handleSimilarSongClick(similarSong, e)}
              >
                <div className="song-image-container">
                  <img src={similarSong.image} alt={similarSong.title} />
                  <div className="song-overlay">
                    <button
                      className={`play-button ${currentSong?.id === similarSong.id && isPlaying ? 'playing' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimilarSongClick(similarSong, e);
                      }}
                    >
                      {currentSong?.id === similarSong.id && isPlaying ? <PiPauseFill /> : <PiPlayFill />}
                    </button>
                  </div>
                </div>
                <div className="song-info">
                  <div id='you-may-also-like-song-info'>
                    <h4>{similarSong.title}</h4>
                    <p 
                      className="artist-name" 
                      style={{ color: 'green', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArtistClick(similarSong.artist);
                      }}
                    >
                      {similarSong.artist}
                    </p>
                    <p className="movie-name song-meta" style={{ cursor: 'pointer' }}>{similarSong.movieName}</p>
                    <p className="genre song-meta">{similarSong.genre}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
