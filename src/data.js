//data.js
import { AZURE_CONFIG } from './config/azure.js';

export const categories = {
  MOVIES: 'movies',
  ALBUMS: 'albums',
  PLAYLISTS: 'playlists',
  GENRES: 'genres'
};

export const genres = {
  POP: {
    name: 'Pop',
    image: AZURE_CONFIG.getImageUrl('og1.webp'),
    songs: []
  },
  ROCK: {
    name: 'Rock',
    image: AZURE_CONFIG.getImageUrl('all_hail1.jpg'),
    songs: []
  },
  CLASSICAL: {
    name: 'Classical',
    image: AZURE_CONFIG.getImageUrl('jersey1.jpeg'),
    songs: []
  },
  FOLK: {
    name: 'Folk',
    image: AZURE_CONFIG.getImageUrl('salaar3.jpeg'),
    songs: []
  },
  HINDI: {
    name: 'Hindi',
    image: AZURE_CONFIG.getImageUrl('og1.webp'),
    songs: []
  },
  TELUGU: {
    name: 'Telugu',
    image: AZURE_CONFIG.getImageUrl('jersey1.jpeg'),
    songs: []
  },
  TAMIL: {
    name: 'Tamil',
    image: AZURE_CONFIG.getImageUrl('salaar3.jpeg'),
    songs: []
  },
  KANNADA: {
    name: 'Kannada',
    image: AZURE_CONFIG.getImageUrl('all_hail1.jpg'),
    songs: []
  },
  MALAYALAM: {
    name: 'Malayalam',
    image: AZURE_CONFIG.getImageUrl('salaar3.jpeg'),
    songs: []
  },
  Sad: {
    name: 'Sad',
    image: AZURE_CONFIG.getImageUrl('og1.webp'),
    songs: []
  },
  Mass: {
    name: 'Mass',
    image: AZURE_CONFIG.getImageUrl('all_hail1.jpg'),
    songs: []
  },
  Romantic: {
    name: 'Romantic',
    image: AZURE_CONFIG.getImageUrl('salaar3.jpeg'),
    songs: []
  }
};

// Songs array
export const songs = [
  {
    id: '1',
    title: 'All Hail The Tiger',
    artist: 'Anirudh',
    singer: 'Thaman, Raghu Ram',
    image: AZURE_CONFIG.getImageUrl('all_hail1.jpg'),
    artistImage: AZURE_CONFIG.getArtistImageUrl('Pawan Kalyan Smile Images.jpeg'),
    audioSrc: AZURE_CONFIG.getAudioUrl('[iSongs.info] 01 - All Hail The Tiger.mp3'),
    genre: 'Mass',
    movieName: 'Devara',
    year: 2024,
    duration: '3:45',
    language: 'Telugu',
    category: categories.MOVIES,
    lyrics: 'Lyrics for All Hail The Tiger...',
    isFavorite: true
  },
  {
    id: '2',
    title: 'Ola Olaala Ala',
    artist: 'Harris Jayaraj',
    singer: 'Karunya, Ranina Reddy',
    image: AZURE_CONFIG.getImageUrl('orange.jpg'),
    artistImage: AZURE_CONFIG.getArtistImageUrl('harish jayaraj.jpg'),
    audioSrc: AZURE_CONFIG.getAudioUrl('[iSongs.info] 01 - Ola Olaala Ala.mp3'),
    genre: 'Romantic',
    movieName: 'Orange',
    year: 2010,
    duration: '5:10',
    language: 'Telugu',
    category: categories.MOVIES,
    lyrics: 'Lyrics for Ola Olaala Ala...',
    isFavorite: false
  },
  {
    id: '3',
    title: 'Ye Mera Jaha',
    artist: 'Mani Sharma',
    singer: 'KK',
    image: AZURE_CONFIG.getImageUrl('kushi.jpg'),
    artistImage: AZURE_CONFIG.getArtistImageUrl('KK.jpg'),
    audioSrc: AZURE_CONFIG.getAudioUrl('[iSongs.info] 01 - Ye Mera Jaha.mp3'),
    genre: 'Romantic',
    movieName: 'Kushi',
    year: 2001,
    duration: '5:12',
    language: 'Telugu',
    category: categories.MOVIES,
    lyrics: 'Lyrics for Ye Mera Jaha...',
    isFavorite: true
  },
  {
    id: '4',
    title: 'Ammaye Sannaga',
    artist: 'Mani Sharma',
    singer: 'Udit Narayan, Kavita Krishnamurthy',
    image: AZURE_CONFIG.getImageUrl('kushi.jpg'),
    artistImage: AZURE_CONFIG.getArtistImageUrl('mani sharma.jpg'),
    audioSrc: AZURE_CONFIG.getAudioUrl('[iSongs.info] 02 - Ammaye Sannaga.mp3'),
    genre: 'Romantic',
    movieName: 'Kushi',
    year: 2001,
    duration: '4:52',
    language: 'Telugu',
    category: categories.MOVIES,
    lyrics: 'Lyrics for Ammaye Sannaga...',
    isFavorite: false
  },
  {
    id: '5',
    title: 'Chilipiga Chusthavala',
    artist: 'Harris Jayaraj',
    singer: 'Karthik',
    image: AZURE_CONFIG.getImageUrl('orange.jpg'),
    artistImage: AZURE_CONFIG.getArtistImageUrl('harish jayaraj.jpg'),
    audioSrc: AZURE_CONFIG.getAudioUrl('[iSongs.info] 02 - Chilipiga.mp3'),
    genre: 'Romantic',
    movieName: 'Orange',
    year: 2010,
    duration: '4:50',
    language: 'Telugu',
    category: categories.MOVIES,
    lyrics: 'Lyrics for Chilipiga Chusthavala...',
    isFavorite: true
  },
  {
    id: '6',
    title: 'Cheliya Cheliya',
    artist: 'Mani Sharma',
    singer: 'Srinivas, Harini',
    image: AZURE_CONFIG.getImageUrl('kushi.jpg'),
    artistImage: AZURE_CONFIG.getArtistImageUrl('mani sharma.jpg'),
    audioSrc: AZURE_CONFIG.getAudioUrl('[iSongs.info] 03 - Cheliya Cheliya.mp3'),
    genre: 'Romantic',
    movieName: 'Kushi',
    year: 2001,
    duration: '5:00',
    language: 'Telugu',
    category: categories.MOVIES,
    lyrics: 'Lyrics for Cheliya Cheliya...',
    isFavorite: false
  },
  {
    id: '7',
    title: 'Cheppave Chirugali',
    artist: 'Mani Sharma',
    singer: 'Udit Narayan, Sujatha',
    image: AZURE_CONFIG.getImageUrl('Okkadu.jpg'),
    artistImage: AZURE_CONFIG.getArtistImageUrl('mani sharma.jpg'),
    audioSrc: AZURE_CONFIG.getAudioUrl('[iSongs.info] 03 - Cheppave Chirugali.mp3'),
    genre: 'Romantic',
    movieName: 'Okkadu',
    year: 2003,
    duration: '5:30',
    language: 'Telugu',
    category: categories.MOVIES,
    lyrics: 'Lyrics for Cheppave Chirugali...',
    isFavorite: true
  },
  {
    id: '8',
    title: 'Premante',
    artist: 'Mani Sharma',
    singer: 'Devan Ekambaram, Kalpana',
    image: AZURE_CONFIG.getImageUrl('kushi.jpg'),
    artistImage: AZURE_CONFIG.getArtistImageUrl('mani sharma.jpg'),
    audioSrc: AZURE_CONFIG.getAudioUrl('[iSongs.info] 04 - Premante.mp3'),
    genre: 'Romantic',
    movieName: 'Kushi',
    year: 2001,
    duration: '6:12',
    language: 'Telugu',
    category: categories.MOVIES,
    lyrics: 'Lyrics for Premante...',
    isFavorite: false
  },
  {
    id: '9',
    title: 'Holi Holi',
    artist: 'Mani Sharma',
    singer: 'Mano, Swarnalatha',
    image: AZURE_CONFIG.getImageUrl('kushi.jpg'),
    artistImage: AZURE_CONFIG.getArtistImageUrl('mani sharma.jpg'),
    audioSrc: AZURE_CONFIG.getAudioUrl('[iSongs.info] 05 - Holi Holi.mp3'),
    genre: 'Folk',
    movieName: 'Kushi',
    year: 2001,
    duration: '5:12',
    language: 'Telugu',
    category: categories.MOVIES,
    lyrics: 'Lyrics for Holi Holi...',
    isFavorite: true
  },
  {
    id: '10',
    title: 'Aaru Sethulunnaa',
    artist: 'Anirudh',
    singer: 'Thaman, Raghu Ram',
    image: AZURE_CONFIG.getImageUrl('jersey1.jpeg'),
    artistImage: AZURE_CONFIG.getArtistImageUrl('Pawan Kalyan Smile Images.jpeg'),
    audioSrc: AZURE_CONFIG.getAudioUrl('Aaru Sethulunnaa.mp3'),
    genre: 'Mass',
    movieName: 'Jersey',
    year: 2022,
    duration: '4:10',
    language: 'Telugu',
    category: categories.MOVIES,
    lyrics: 'Lyrics for Aaru Sethulunnaa...',
    isFavorite: false
  },
  {
    id: '11',
    title: 'Vinaraa',
    artist: 'Anirudh',
    singer: 'Thaman, Raghu Ram',
    image: AZURE_CONFIG.getImageUrl('all_hail1.jpg'),
    artistImage: AZURE_CONFIG.getArtistImageUrl('Pawan Kalyan Smile Images.jpeg'),
    audioSrc: AZURE_CONFIG.getAudioUrl('Vinaraa.mp3'),
    genre: 'Mass',
    movieName: 'Devara',
    year: 2024,
    duration: '3:30',
    language: 'Telugu',
    category: categories.MOVIES,
    lyrics: 'Lyrics for Vinaraa...',
    isFavorite: true
  }
];

// Populate genre songs arrays
export const populateGenreSongs = () => {
  // Clear existing songs in genres
  Object.keys(genres).forEach(genreKey => {
    if (typeof genres[genreKey] === 'object' && genres[genreKey].songs) {
      genres[genreKey].songs = [];
    }
  });

  // Add songs to their respective genres
  songs.forEach(song => {
    if (genres[song.genre] && typeof genres[song.genre] === 'object' && genres[song.genre].songs) {
      genres[song.genre].songs.push(song);
    }
  });
};

// Call the function to populate genre songs
populateGenreSongs();

// Function to remove duplicates based on song properties
function getUniqueSongs(songArray) {
  return songArray.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.title === value.title && t.artist === value.artist && t.audioSrc === value.audioSrc
    ))
  );
}

export const getSongsByGenre = (genre) => {
  // Get direct genre songs
  let genreSongs = [];
  
  // Check if the genre exists in our genres object
  if (genres[genre] && typeof genres[genre] === 'object' && genres[genre].songs) {
    genreSongs = [...genres[genre].songs];
  } else {
    // If not, filter songs by genre
    genreSongs = songs.filter(song => song.genre === genre);
  }
  
  // Remove duplicates
  return getUniqueSongs(genreSongs);
};

export const getSongsByMovie = (movie) => {
  return songs.filter(song => song.movieName === movie);
};

export const getSongsByArtist = (artist) => {
  return songs.filter(song => song.artist === artist);
};

export const getSongsByYear = (year) => {
  return songs.filter(song => song.year === year);
};

export const getFavoriteSongs = () => {
  return songs.filter(song => song.isFavorite);
};

export const searchSongs = (query) => {
  const searchTerms = query.toLowerCase().split(' ');
  return songs.filter(song => {
    const searchableText = `${song.title} ${song.artist} ${song.movieName} ${song.genre} ${song.year}`.toLowerCase();
    return searchTerms.every(term => searchableText.includes(term));
  });
};

export const playlists = [
  {
    id: 1,
    name: "Favorite Songs",
    songs: songs.filter(song => song.isFavorite),
    image: AZURE_CONFIG.getImageUrl('vibe-guru-logo.png')
  },
  {
    id: 2,
    name: "Recent Plays",
    songs: songs.slice(0, 5), // Last 5 played songs
    image: AZURE_CONFIG.getImageUrl('vibe-guru-removebg-preview.png')
  }
];

export default {
  songs,
  categories,
  genres,
  playlists,
  getSongsByGenre,
  getSongsByMovie,
  getSongsByArtist,
  getSongsByYear,
  getFavoriteSongs,
  searchSongs
};