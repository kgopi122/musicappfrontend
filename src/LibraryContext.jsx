// LibraryContext.js
import React, { createContext, useState, useEffect, useMemo } from 'react';

// Helper functions for local storage
const getStorageKey = (userId, type) => `musicapp_${userId}_${type}`;

const loadFromStorage = (userId, type) => {
  try {
    const data = localStorage.getItem(getStorageKey(userId, type));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error loading ${type} from storage:`, error);
    return [];
  }
};

const saveToStorage = (userId, type, data) => {
  try {
    localStorage.setItem(getStorageKey(userId, type), JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${type} to storage:`, error);
  }
};

export const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [userId, setUserId] = useState(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userEmail');
    if (storedUserId) {
      setUserId(storedUserId);
      // Load liked songs for this specific user
      const userLikedSongs = loadFromStorage(storedUserId, 'likedSongs');
      setLikedSongs(userLikedSongs);
      
      // Load playlist songs for this specific user
      const userPlaylistSongs = loadFromStorage(storedUserId, 'playlistSongs');
      setPlaylistSongs(userPlaylistSongs);
    }
  }, []);

  // Update localStorage when likedSongs changes
  useEffect(() => {
    if (userId) {
      saveToStorage(userId, 'likedSongs', likedSongs);
    }
  }, [likedSongs, userId]);

  // Update localStorage when playlistSongs changes
  useEffect(() => {
    if (userId) {
      saveToStorage(userId, 'playlistSongs', playlistSongs);
    }
  }, [playlistSongs, userId]);

  const addToLikedSongs = (song) => {
    if (!userId) return; // Don't add if no user is logged in
    
    const songWithTimestamp = {
      ...song,
      addedAt: new Date().toISOString(),
      userId: userId // Add userId to the song object
    };
    
    // Check if song already exists for this user
    const songExists = likedSongs.some(s => s.id === song.id && s.userId === userId);
    if (!songExists) {
      setLikedSongs(prev => [...prev, songWithTimestamp]);
    }
  };

  const removeFromLikedSongs = (songId) => {
    if (!userId) return; // Don't remove if no user is logged in
    
    // Only remove songs that belong to the current user
    setLikedSongs(prev => {
      const updatedSongs = prev.filter(song => !(song.id === songId && song.userId === userId));
      // Update localStorage immediately
      saveToStorage(userId, 'likedSongs', updatedSongs);
      return updatedSongs;
    });
  };

  const addToPlaylist = (song) => {
    if (!userId) return; // Don't add if no user is logged in
    
    const songWithTimestamp = {
      ...song,
      addedAt: new Date().toISOString(),
      userId: userId // Add userId to the song object
    };
    
    // Check if song already exists for this user
    const songExists = playlistSongs.some(s => s.id === song.id && s.userId === userId);
    if (!songExists) {
      setPlaylistSongs(prev => [...prev, songWithTimestamp]);
    }
  };

  const removeFromPlaylist = (songId) => {
    if (!userId) return; // Don't remove if no user is logged in
    
    // Only remove songs that belong to the current user
    setPlaylistSongs(prev => {
      const updatedSongs = prev.filter(song => !(song.id === songId && song.userId === userId));
      // Update localStorage immediately
      saveToStorage(userId, 'playlistSongs', updatedSongs);
      return updatedSongs;
    });
  };

  const setUser = (email) => {
    // Idempotent: avoid loops if the same email is set repeatedly
    if (email === userId) return;
    setUserId(email);
    // Load user's songs when setting a new user
    const userLikedSongs = loadFromStorage(email, 'likedSongs');
    const userPlaylistSongs = loadFromStorage(email, 'playlistSongs');
    setLikedSongs(userLikedSongs);
    setPlaylistSongs(userPlaylistSongs);
  };

  const clearUser = () => {
    setUserId(null);
    setLikedSongs([]);
    setPlaylistSongs([]);
  };

  const value = useMemo(() => ({
    likedSongs,
    setLikedSongs,
    playlistSongs,
    setPlaylistSongs,
    userId,
    setUser,
    clearUser,
    addToLikedSongs,
    removeFromLikedSongs,
    addToPlaylist,
    removeFromPlaylist
  }), [likedSongs, playlistSongs, userId]);

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};
