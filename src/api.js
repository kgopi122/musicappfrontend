import axios from 'axios';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:8080/api';
const MEDIA_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_MEDIA_BASE_URL) || '';

function normalizeUrl(url) {
    if (!url) return '';
    const isAbsolute = /^https?:\/\//i.test(url);
    if (isAbsolute) return url;
    if (!MEDIA_BASE_URL) return url; // fallback to raw if base not set
    const sep = MEDIA_BASE_URL.endsWith('/') || url.startsWith('/') ? '' : '/';
    return `${MEDIA_BASE_URL}${sep}${url}`;
}

// Liked Songs API
export const likedSongsApi = {
    getLikedSongs: (userId) => axios.get(`${API_BASE_URL}/liked-songs/${userId}`),
    toggleLikeSong: (userId, song) => axios.post(`${API_BASE_URL}/liked-songs/${userId}/toggle`, song),
    isSongLiked: (userId, songId) => axios.get(`${API_BASE_URL}/liked-songs/${userId}/check/${songId}`)
};

// Playlist Songs API
export const playlistSongsApi = {
    getPlaylistSongs: (userId) => axios.get(`${API_BASE_URL}/playlist-songs/${userId}`),
    addToPlaylist: (userId, song) => axios.post(`${API_BASE_URL}/playlist-songs/${userId}/add`, song),
    removeFromPlaylist: (userId, songId) => axios.delete(`${API_BASE_URL}/playlist-songs/${userId}/remove/${songId}`),
    isInPlaylist: (userId, songId) => axios.get(`${API_BASE_URL}/playlist-songs/${userId}/check/${songId}`)
};

export const songsApi = {
    getAll: () => axios.get(`${API_BASE_URL}/songs`).then(r => r.data),
    getByGenre: (genre) => axios.get(`${API_BASE_URL}/songs/genre/${encodeURIComponent(genre)}`).then(r => r.data),
    getByArtist: (artist) => axios.get(`${API_BASE_URL}/songs/artist/${encodeURIComponent(artist)}`).then(r => r.data),
    getByMovie: (movieName) => axios.get(`${API_BASE_URL}/songs/movie/${encodeURIComponent(movieName)}`).then(r => r.data),
};

export function mapBackendSongToFrontend(song) {
    return {
        id: String(song.id),
        title: song.title,
        artist: song.artist,
        singer: song.singer,
        image: normalizeUrl(song.imageUrl),
        artistImage: normalizeUrl(song.artistImageUrl),
        audioSrc: normalizeUrl(song.audioUrl),
        genre: song.genre,
        movieName: song.movieName,
        year: song.year,
        duration: song.duration,
        language: song.language,
        category: song.category,
        lyrics: song.lyrics,
        isFavorite: Boolean(song.isFavorite)
    };
}

export function mapBackendSongs(songs) {
    return (songs || []).map(mapBackendSongToFrontend);
}

export function callApi(reqmethod, url, data, responseHandler)
{
    var option;

    if(reqmethod === 'GET' || reqmethod === 'DELETE')
        option = {method : reqmethod, headers : {'Content-Type' : 'application/json'}};
    else
        option = {method : reqmethod, headers : {'Content-Type' : 'application/json'}, body : data};

    fetch(url, option)
    .then(response=>
    {
        if(!response.ok)
            throw new Error(response.status +' '+response.statusText);
        return response.text();
    } )

    .then(data=> responseHandler(data))

    .catch(error=>alert(error));
   

}

export function setSession(sesname, sesvalue, expday)
{
    let D = new Date();
    D.setTime(D.getTime() + expday * 86400000);
    document.cookie = `${sesname}=${sesvalue};expires=${D.toUTCString()};path="/";secure`;    
}

export function getSession(sesname)
{
    let decodeCookie = decodeURIComponent(document.cookie);
    let cookieData = decodeCookie.split(";");

    for(let x in cookieData)
    {
        if(cookieData[x].includes(sesname))
            return cookieData[x].substring(cookieData[x].indexOf(sesname) + sesname.length + 1);

        return "";
    }
}