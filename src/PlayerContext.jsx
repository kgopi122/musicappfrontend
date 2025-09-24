// PlayerContext.jsx
import React, { createContext, useState, useRef, useEffect } from "react";
import { songs } from "./data";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [currentSong, setCurrentSong] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [durations, setDurations] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load durations for all songs in the playlist
  useEffect(() => {
    const loadDurations = async () => {
      const newDurations = {};
      
      for (const song of currentPlaylist) {
        if (!song.audioSrc) continue;
        
        try {
          const audio = new Audio();
          audio.preload = "metadata";
          
          await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error('Timeout loading audio metadata'));
            }, 5000);

            audio.addEventListener('loadedmetadata', () => {
              clearTimeout(timeoutId);
              newDurations[song.title] = audio.duration;
              resolve();
            });

            audio.addEventListener('error', (e) => {
              clearTimeout(timeoutId);
              console.error(`Error loading audio for ${song.title}:`, e);
              newDurations[song.title] = 0;
              resolve();
            });

            // Fix the audio source path
            const fixedPath = song.audioSrc.startsWith('/') ? song.audioSrc : `/${song.audioSrc}`;
            audio.src = fixedPath;
          });
        } catch (error) {
          console.error(`Error loading duration for ${song.title}:`, error);
          newDurations[song.title] = 0;
        }
      }
      
      setDurations(newDurations);
    };

    loadDurations();
  }, [currentPlaylist]);

  // Handle audio state changes
  useEffect(() => {
    if (currentSong?.audioSrc) {
      setIsLoading(true);
      
      // Stop current playback and reset
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setProgress(0);
      
      // Fix the audio source path
      const fixedPath = currentSong.audioSrc.startsWith('/') ? currentSong.audioSrc : `/${currentSong.audioSrc}`;
      audioRef.current.src = fixedPath;
      audioRef.current.load();
      
      // Start playing if isPlaying is true
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsLoading(false);
            })
            .catch(error => {
              console.error("Error playing audio:", error);
              setIsLoading(false);
            });
        }
      } else {
        setIsLoading(false);
      }
    }
  }, [currentSong]);

  // Handle play/pause state
  useEffect(() => {
    if (!currentSong?.audioSrc || isLoading) return;
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Error playing audio:", error);
          console.error(`Current song audio source: ${currentSong?.audioSrc}`);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong, isLoading]);

  // Handle song ending
  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(error => {
          console.error("Error playing audio:", error);
        });
      } else if (currentPlaylist.length > 0) {
        // Find the current song index in the playlist
        const currentIndex = currentPlaylist.findIndex(song => song.id === currentSong?.id);
        
        // If there's a next song in the playlist, play it
        if (currentIndex < currentPlaylist.length - 1) {
          const nextSong = currentPlaylist[currentIndex + 1];
          
          // Update the current song and index
          setCurrentSong(nextSong);
          setCurrentIndex(currentIndex + 1);
          setIsPlaying(true);
        } else {
          // If it's the last song, stop playing
          setIsPlaying(false);
          audio.pause();
          audio.currentTime = 0;
        }
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [isLooping, currentPlaylist, currentSong, setCurrentSong, setCurrentIndex, setIsPlaying]);

  // Update progress and duration
  useEffect(() => {
    const audio = audioRef.current;
    
    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setDuration(audio.duration);
      }
    };

    const handleMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleMetadata);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleMetadata);
    };
  }, []);

  const handlePlayPause = () => {
    if (!currentSong?.audioSrc || isLoading) return;
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentPlaylist.length === 0) return;
    
    // Stop current playback
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setProgress(0);
    
    // Find current song index in playlist
    const currentIndex = currentPlaylist.findIndex(song => song.id === currentSong?.id);
    
    if (currentIndex < currentPlaylist.length - 1) {
      const nextSong = currentPlaylist[currentIndex + 1];
      setCurrentSong(nextSong);
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (currentPlaylist.length === 0) return;
    
    // Stop current playback
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setProgress(0);
    
    // Find current song index in playlist
    const currentIndex = currentPlaylist.findIndex(song => song.id === currentSong?.id);
    
    if (currentIndex > 0) {
      const prevSong = currentPlaylist[currentIndex - 1];
      setCurrentSong(prevSong);
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  };

  const seekTo = (time) => {
    if (!currentSong?.audioSrc || isLoading) return;
    audioRef.current.currentTime = time;
    setProgress((time / audioRef.current.duration) * 100);
  };

  const formatTime = (time) => {
    if (isNaN(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <PlayerContext.Provider
      value={{
        audioRef,
        currentSong,
        setCurrentSong,
        currentPlaylist,
        setCurrentPlaylist,
        currentIndex,
        setCurrentIndex,
        isPlaying,
        setIsPlaying,
        isLooping,
        setIsLooping,
        isShuffling,
        setIsShuffling,
        volume,
        setVolume,
        progress,
        duration,
        durations,
        isLoading,
        formatTime,
        seekTo,
        handlePlayPause,
        handleNext,
        handlePrevious,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
