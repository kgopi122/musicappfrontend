import React, { useState } from 'react';
import { PiDownloadSimple } from 'react-icons/pi';
import DownloadQualityDropdown from './DownloadQualityModal';
import '../styles/DownloadButton.css';

const DownloadButton = ({ song, className = '', size = 'medium' }) => {
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [downloadPosition, setDownloadPosition] = useState({ top: 0, left: 0 });

  const handleDownload = (event) => {
    // Prevent event propagation to stop song playback
    event.preventDefault();
    event.stopPropagation();
    
    const rect = event.currentTarget.getBoundingClientRect();
    setDownloadPosition({
      top: rect.top,
      left: rect.left + rect.width / 2
    });
    setShowQualityModal(true);
  };

  const handleQualitySelect = (quality) => {
    setShowQualityModal(false);
    if (song.onDownload) {
      song.onDownload(quality);
    }
  };

  return (
    <>
      <button
        className={`download-button ${className} ${size}`}
        onClick={handleDownload}
        title="Download"
        aria-label="Download"
      >
        <PiDownloadSimple />
      </button>

      <DownloadQualityDropdown
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        onQualitySelect={handleQualitySelect}
        song={song}
        position={downloadPosition}
      />
    </>
  );
};

export default DownloadButton; 