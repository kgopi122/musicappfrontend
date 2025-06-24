import DownloadButton from './DownloadButton';

const PlayBar = () => {
  return (
    <div className="play-bar">
      <div className="now-playing">
        {currentSong && (
          <>
            <img src={currentSong.image} alt={currentSong.title} className="now-playing-img" />
            <div className="now-playing-info">
              <div className="now-playing-title">{currentSong.title}</div>
              <div className="now-playing-artist">{currentSong.artist}</div>
            </div>
          </>
        )}
      </div>

      <div className="play-controls">
        <button className="control-button" onClick={handlePrevious}>
          <FontAwesomeIcon icon={faStepBackward} />
        </button>
        <button className="play-button" onClick={handlePlayPause}>
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>
        <button className="control-button" onClick={handleNext}>
          <FontAwesomeIcon icon={faStepForward} />
        </button>
      </div>

      <div className="play-options">
        <button className="control-button" onClick={handleVolumeClick}>
          <FontAwesomeIcon icon={volumeIcon} />
        </button>
        <div className="volume-slider-container" style={{ display: showVolumeSlider ? 'block' : 'none' }}>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
        {currentSong && (
          <DownloadButton
            song={currentSong}
            className="control-button"
            size="medium"
          />
        )}
      </div>
    </div>
  );
};

export default PlayBar; 