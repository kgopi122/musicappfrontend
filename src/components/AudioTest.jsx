import React, { useState } from 'react';
import { songsApi, mapBackendSongs } from '../api';

const AudioTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const testAudioUrls = async () => {
    setIsTesting(true);
    setTestResults([]);

    const results = [];

    try {
      const data = await songsApi.getAll();
      const mapped = mapBackendSongs(data).slice(0, 3);
      for (const song of mapped) {
        try {
          const response = await fetch(song.audioSrc, { 
            method: 'HEAD',
            mode: 'cors'
          });
          results.push({
            song: song.title,
            url: song.audioSrc,
            status: response.ok ? 'SUCCESS' : 'FAILED',
            statusCode: response.status,
            error: null
          });
        } catch (error) {
          results.push({
            song: song.title,
            url: song.audioSrc,
            status: 'ERROR',
            statusCode: null,
            error: error.message
          });
        }
      }
    } catch (e) {
      results.push({ song: 'Fetch Error', url: '-', status: 'ERROR', statusCode: null, error: String(e) });
    }

    setTestResults(results);
    setIsTesting(false);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Audio URL Test</h3>
      <button 
        onClick={testAudioUrls} 
        disabled={isTesting}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#1DB954', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: isTesting ? 'not-allowed' : 'pointer'
        }}
      >
        {isTesting ? 'Testing...' : 'Test Audio URLs'}
      </button>
      
      {testResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Test Results:</h4>
          {testResults.map((result, index) => (
            <div 
              key={index} 
              style={{ 
                padding: '10px', 
                margin: '5px 0', 
                backgroundColor: result.status === 'SUCCESS' ? '#d4edda' : '#f8d7da',
                border: `1px solid ${result.status === 'SUCCESS' ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '5px'
              }}
            >
              <strong>{result.song}</strong><br/>
              <small>URL: {result.url}</small><br/>
              <span style={{ 
                color: result.status === 'SUCCESS' ? 'green' : 'red',
                fontWeight: 'bold'
              }}>
                {result.status} {result.statusCode && `(${result.statusCode})`}
              </span>
              {result.error && <div style={{ color: 'red' }}>Error: {result.error}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioTest;


