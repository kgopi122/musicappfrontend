import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { PlayerContext } from './PlayerContext';
import Header from './header';
import { requireAuth } from './utils/auth';
import { songsApi, mapBackendSongs } from './api';

const Home = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [songsData, setSongsData] = useState([]);
  const navigate = useNavigate();
  const { setCurrentSong, setIsPlaying, setCurrentPlaylist } = useContext(PlayerContext);

  useEffect(() => {
    let isMounted = true;
    songsApi.getAll()
      .then(data => {
        if (!isMounted) return;
        setSongsData(mapBackendSongs(data));
      })
      .catch(err => {
        console.error('Failed to fetch songs:', err);
        setSongsData([]);
      });
    return () => { isMounted = false; };
  }, []);

  const uniqueArtists = useMemo(() => {
    const artistMap = new Map();
    songsData.forEach(song => {
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
  }, [songsData]);

  const genreCards = useMemo(() => {
    const map = new Map();
    for (const song of songsData) {
      const name = (song.genre || '').trim();
      if (!name) continue;
      if (!map.has(name)) {
        map.set(name, { name, image: song.image });
      }
    }
    return Array.from(map.values());
  }, [songsData]);

  const handleSongClick = (song) => {
    if (!requireAuth(navigate)) return;
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentPlaylist(songsData);
    navigate(`/song/${encodeURIComponent(song.title)}`, {
      state: {
        song,
        recommendedSongs: songsData.filter(s => s.id !== song.id).slice(0, 5)
      }
    });
    window.scrollTo(0, 0);
  };

  const handleGenreClick = (genreName) => {
    if (!requireAuth(navigate)) return;
    navigate(`/genre/${encodeURIComponent(genreName)}`);
    window.scrollTo(0, 0);
  };

  const handleArtistClick = (artist) => {
    if (!requireAuth(navigate)) return;
    const artistSongs = songsData.filter(song => song.artist === artist.name);
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

  return (
    <>
      <div id="new_arrivalstext">
        <h2>New Arrivals</h2>
      </div>
      <div id="new_arrivalsmenu">
        {songsData.map((song, index) => (
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
        {genreCards.map((genre, genreIndex) => (
          <div
            key={genre.name}
            className="genre"
            onClick={() => handleGenreClick(genre.name)}
          >
            {genre.image && (
              <img src={genre.image} alt={genre.name} className="genre-image" />
            )}
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
