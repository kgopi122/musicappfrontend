import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { songs, genres, categories } from './data';
import './MainPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { PlayerContext } from './PlayerContext';
import Header from './header';
import { requireAuth } from './utils/auth';

const Home = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();
  const { setCurrentSong, setIsPlaying, setCurrentPlaylist } = useContext(PlayerContext);

  // Get unique artists with their images and song counts
  const uniqueArtists = useMemo(() => {
    const artistMap = new Map();
    
    songs.forEach(song => {
      if (!artistMap.has(song.artist)) {
        artistMap.set(song.artist, {
          name: song.artist,
          image: song.artistImage,
          songCount: 1
        });
      } else {
        const artist = artistMap.get(song.artist);
        artist.songCount += 1;
      }
    });
    
    return Array.from(artistMap.values());
  }, [songs]);

  const handleSongClick = (song) => {
    if (!requireAuth(navigate)) return;
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentPlaylist(songs);
    
    navigate(`/song/${encodeURIComponent(song.title)}`, {
      state: {
        song,
        recommendedSongs: songs.filter(s => s.id !== song.id).slice(0, 5)
      }
    });
    window.scrollTo(0, 0);
  };

  const handleGenreClick = (genreName) => {
    if (!requireAuth(navigate)) return;
    const genreSongs = genres[genreName]?.songs || [];
    navigate(`/genre/${encodeURIComponent(genreName)}`, {
      state: { 
        genre: {
          name: genreName,
          songs: genreSongs
        }
      }
    });
    window.scrollTo(0, 0);
  };

  const handleArtistClick = (artist) => {
    if (!requireAuth(navigate)) return;
    const artistSongs = songs.filter(song => song.artist === artist.name);
    navigate(`/artist/${encodeURIComponent(artist.name)}`, {
      state: { 
        artist: {
          name: artist.name,
          image: artist.image,
          songs: artistSongs
        }
      }
    });
    window.scrollTo(0, 0);
  };

  const handleNewFeatureClick = (feature) => {
    if (!requireAuth(navigate)) return;
    
    switch(feature) {
      case 'post':
        navigate('/post-song');
        break;
      case 'remix':
        navigate('/remix');
        break;
      case 'colisten':
        navigate('/colisten');
        break;
      case 'playlist':
        navigate('/create-playlist');
        break;
      default:
        break;
    }
    window.scrollTo(0, 0);
  };

  // Create genre objects for display using the new genre structure
  const genreObjects = Object.entries(genres).map(([key, genre]) => ({
    name: genre.name,
    image: genre.image
  }));

  return (
    <>
      <div id="new_arrivalstext">
        <h2>New Arrivals</h2>
      </div>
      <div id="new_arrivalsmenu">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className="new-arrivals-item"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleSongClick(song)}
          >
            <img src={song.image} alt={song.title} />
            <div className="song-info-hover">
              <FontAwesomeIcon icon={faMusic} />
              <label>{song.title}</label>
              <label className="artist-name" style={{ color: 'green', cursor: 'pointer' }}>{song.artist}</label>
            </div>
          </div>
        ))}
      </div>

      <div id="new_featurestext">
        <h2>New Features</h2>
      </div>
      <div id="new_featuresmenu">
        <button onClick={() => handleNewFeatureClick('post')}>Post your Song</button>
        <button onClick={() => handleNewFeatureClick('remix')}>Try Remix</button>
        <button onClick={() => handleNewFeatureClick('colisten')}>Co-listen</button>
        <button onClick={() => handleNewFeatureClick('playlist')}>Playlist</button>
      </div>

      <div id="genres-text">
        <h2>Genres</h2>
      </div>
      <div id="genresmenu">
        {genreObjects.map((genre, genreIndex) => (
          <div
            key={genreIndex}
            className="genre"
            onClick={() => handleGenreClick(genre.name)}
          >
            <img src={genre.image} alt={genre.name} className="genre-image" />
            <div className="genre-info">
              <h3>{genre.name}</h3>
            </div>
          </div>
        ))}
      </div>

      <div id="artists-text">
        <h2>Popular Artists</h2>
      </div>
      <div id="artistsmenu">
        {uniqueArtists.map((artist, index) => (
          <div 
            key={artist.name} 
            className="artist"
            onClick={() => handleArtistClick(artist)}
          >
            <div className="artist-image-container">
              <img src={artist.image} alt={artist.name} />
            </div>
            <div className="artist-info">
              <h3>{artist.name}</h3>
              <p>{artist.songCount} Songs</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
