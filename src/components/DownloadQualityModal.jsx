import React, { useState, useEffect } from 'react';
import './DownloadQualityModal.css';

const DownloadQualityModal = ({ isOpen, onClose, onQualitySelect, song, position }) => {
  const [fileSize, setFileSize] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && song) {
      fetchFileSize(song.audioSrc);
    }
  }, [isOpen, song]);

  const fetchFileSize = async (url) => {
    setIsLoading(true);
    setError(null);
    try {
      // First try HEAD request
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          setFileSize(parseInt(contentLength, 10));
          setIsLoading(false);
          return;
        }
      }

      // If HEAD request fails or no content-length, try GET request
      const getResponse = await fetch(url);
      if (!getResponse.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const blob = await getResponse.blob();
      setFileSize(blob.size);
    } catch (err) {
      console.error('Error fetching file size:', err);
      setError('Could not determine file size. Please try downloading anyway.');
      // Set a default size if we can't determine the actual size
      setFileSize(5 * 1024 * 1024); // Default to 5MB
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getQualityOptions = () => {
    if (!fileSize) return [];

    const baseSize = fileSize;
    return [
      { label: 'High Quality', size: formatFileSize(baseSize) },
      { label: 'Medium Quality', size: formatFileSize(baseSize * 0.7) },
      { label: 'Low Quality', size: formatFileSize(baseSize * 0.4) }
    ];
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="quality-modal"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <div className="quality-header">
          <h3>Select Download Quality</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {isLoading ? (
          <div className="loading-message">Loading quality options...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="quality-options">
            {getQualityOptions().map((option, index) => (
              <button
                key={index}
                className="quality-option"
                onClick={() => onQualitySelect(option)}
              >
                <span className="quality-label">{option.label}</span>
                <span className="quality-size">{option.size}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadQualityModal; 