// SongList.jsx
import React from 'react';
import SongCard from './SongCard';

const SongList = ({ songs, onSongClick }) => {
  return (
    <div id="new_arrivalsmenu">
      {songs.map((song, index) => (
        <SongCard
          key={index}
          song={song}
          onClick={() => onSongClick(song)}
        />
      ))}
    </div>
  );
};

export default SongList;
