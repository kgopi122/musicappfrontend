// SongCard.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

const SongCard = ({ song, onClick }) => {
  return (
    <div className="new-arrivals-item" onClick={onClick}>
      <img src={song.image} alt={song.title} />
      <div className="song-info-hover">
        <FontAwesomeIcon icon={faMusic} />
        <label>{song.title}</label>
        <label style={{ color: 'green', cursor: 'pointer' }}>{song.artist}</label>
      </div>
    </div>
  );
};

export default SongCard;
