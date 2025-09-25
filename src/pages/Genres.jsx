import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../PlayerContext';
import { useLibrary } from '../LibraryContext';
import { PiPlay, PiPause, PiHeart, PiPlus } from 'react-icons/pi';
import './Genres.css';
import { songsApi, mapBackendSongs } from '../api';

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
  const [genreList, setGenreList] = useState([]);

  useEffect(() => {
    let mounted = true;
    songsApi.getAll()
      .then(data => {
        if (!mounted) return;
        const mapped = mapBackendSongs(data);
        const setG = new Set();
        mapped.forEach(s => { if (s.genre) setG.add(s.genre); });
        setGenreList(Array.from(setG));
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const fetchGenreSongs = async () => {
      if (!selectedGenre) return;
      try {
        const data = await songsApi.getByGenre(selectedGenre);
        const mapped = mapBackendSongs(data);
        const unique = getUniqueSongs(mapped);
        setGenreSongs(unique);
        loadDurations(unique);
      } catch (e) {
        console.error('Failed to fetch genre songs:', e);
        setGenreSongs([]);
      }
    };
    fetchGenreSongs();
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
        {genreList.map((name) => (
          <div
            key={name}
            className={`genre-card ${selectedGenre === name ? 'selected' : ''}`}
            onClick={() => handleGenreClick(name)}
          >
            <div className="genre-info">
              <h3>{name}</h3>
            </div>
          </div>
        ))}
      </div>

      {selectedGenre && (
        <div className="genre-songs">
          <h2>{selectedGenre} Songs</h2>
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