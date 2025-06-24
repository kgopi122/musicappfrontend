import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { genres, songs } from '../data';
import { usePlayer } from '../PlayerContext';
import { useLibrary } from '../LibraryContext';
import { PiPlay, PiPause, PiHeart, PiPlus } from 'react-icons/pi';
import './Genres.css';

// Function to remove duplicates based on song properties
function getUniqueSongs(songArray) {
  return songArray.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.title === value.title && t.artist === value.artist && t.audioSrc === value.audioSrc
    ))
  );
}

const Genres = () => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, play, pause, setCurrentSong, setPlaylist } = usePlayer();
  const { favorites, addToFavorites, removeFromFavorites, addToPlaylist } = useLibrary();
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreSongs, setGenreSongs] = useState([]);
  const [durations, setDurations] = useState({});

  useEffect(() => {
    if (selectedGenre) {
      // Get the genre name from the selected genre key
      const genreName = genres[selectedGenre].name;
      
      console.log(`Selected genre key: ${selectedGenre}`);
      console.log(`Genre name: ${genreName}`);
      
      // Get songs for this genre
      const songsForGenre = songs.filter(song => song.genre === genreName);
      
      console.log(`Songs for ${genreName}:`, songsForGenre.map(s => s.title));
      
      // Remove duplicates
      const uniqueSongs = getUniqueSongs(songsForGenre);
      
      console.log(`Total songs for ${genreName}: ${uniqueSongs.length}`);
      console.log(`Songs:`, uniqueSongs.map(s => s.title));
      
      setGenreSongs(uniqueSongs);
      loadDurations(uniqueSongs);
    }
  }, [selectedGenre]);

  const loadDurations = async (songs) => {
    const newDurations = { ...durations };
    const songsToLoad = songs.filter(song => !durations[song.id]);

    for (const song of songsToLoad) {
      try {
        const audio = new Audio(song.audioSrc);
        await new Promise((resolve) => {
          audio.addEventListener('loadedmetadata', () => {
            const minutes = Math.floor(audio.duration / 60);
            const seconds = Math.floor(audio.duration % 60);
            newDurations[song.id] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            resolve();
          });
          audio.load();
        });
      } catch (error) {
        console.error(`Error loading duration for ${song.title}:`, error);
        newDurations[song.id] = song.duration || '0:00';
      }
    }

    setDurations(newDurations);
  };

  const handleGenreClick = (genreName) => {
    setSelectedGenre(genreName);
  };

  const handleSongClick = (song) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    } else {
      setCurrentSong(song);
      setPlaylist(genreSongs);
      play();
    }
  };

  const handleLikeClick = (e, song) => {
    e.stopPropagation();
    if (favorites.some(fav => fav.id === song.id)) {
      removeFromFavorites(song);
    } else {
      addToFavorites(song);
    }
  };

  const handleAddToPlaylist = (e, song) => {
    e.stopPropagation();
    addToPlaylist(song);
  };

  const formatDuration = (song) => {
    return durations[song.id] || song.duration || '0:00';
  };

  return (
    <div className="genres-page">
      <div className="genres-grid">
        {Object.entries(genres).map(([key, genre]) => (
          <div
            key={key}
            className={`genre-card ${selectedGenre === key ? 'selected' : ''}`}
            onClick={() => handleGenreClick(key)}
          >
            <img src={genre.image} alt={genre.name} className="genre-image" />
            <div className="genre-info">
              <h3>{genre.name}</h3>
              <p>{genre.songs.length} songs</p>
            </div>
          </div>
        ))}
      </div>

      {selectedGenre && (
        <div className="genre-songs">
          <h2>{genres[selectedGenre].name} Songs</h2>
          <div className="songs-list">
            {genreSongs.length > 0 ? (
              genreSongs.map((song) => (
                <div
                  key={song.id}
                  className={`song-card ${currentSong?.id === song.id ? 'active' : ''}`}
                  onClick={() => handleSongClick(song)}
                >
                  <img src={song.image} alt={song.title} className="song-image" />
                  <div className="song-info">
                    <h3>{song.title}</h3>
                    <p className="artist-name" style={{ color: 'green', cursor: 'pointer' }}>{song.artist}</p>
                    <p className="song-duration">{formatDuration(song)}</p>
                  </div>
                  <div className="song-actions">
                    <button
                      className={`action-button ${currentSong?.id === song.id && isPlaying ? 'playing' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSongClick(song);
                      }}
                    >
                      {currentSong?.id === song.id && isPlaying ? <PiPause /> : <PiPlay />}
                    </button>
                    <button
                      className={`action-button ${favorites.some(fav => fav.id === song.id) ? 'liked' : ''}`}
                      onClick={(e) => handleLikeClick(e, song)}
                    >
                      <PiHeart />
                    </button>
                    <button
                      className="action-button"
                      onClick={(e) => handleAddToPlaylist(e, song)}
                    >
                      <PiPlus />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-songs-message">No songs found in this genre.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Genres; 