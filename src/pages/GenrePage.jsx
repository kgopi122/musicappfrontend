import DownloadButton from '../components/DownloadButton';

const GenrePage = () => {
  const handleDownload = async (song, quality) => {
    try {
      showToast('Preparing download...', 'info');

      // Fetch the original audio file
      const response = await fetch(song.audioSrc);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Calculate target size in bytes
      const targetSize = parseSizeToBytes(quality.size);
      
      // Compress the audio to match the target size
      const compressedBuffer = await compressAudio(audioBuffer, targetSize);
      
      // Create WAV file
      const wavBlob = audioBufferToWav(compressedBuffer);
      
      // Verify the size
      if (Math.abs(wavBlob.size - targetSize) > 100) {
        throw new Error('Compressed file size does not match target size');
      }

      // Create download link
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.title} - ${quality.label}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Download complete!', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showToast('Download failed. Please try again.', 'error');
    }
  };

  return (
    <div className="genre-page">
      <div className="songs-list">
        {songs.map((song) => (
          <div key={song.id} className="song-item">
            <div className="song-actions">
              <button className="action-button" onClick={() => handlePlay(song)}>
                <FontAwesomeIcon icon={faPlay} />
              </button>
              <button className="action-button" onClick={() => handleAddToPlaylist(song)}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <DownloadButton
                song={{ ...song, onDownload: (quality) => handleDownload(song, quality) }}
                className="action-button"
                size="medium"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenrePage; 