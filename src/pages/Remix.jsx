import React, { useState, useRef, useEffect, useContext } from 'react';
import { PiPlayCircle, PiPauseCircle, PiWaveform, PiSliders, PiPlus, PiMinus, PiArrowCounterClockwise, PiMusicNote, PiUpload, PiMagnifyingGlass, PiX, PiSpeakerHigh, PiSpeakerNone, PiStar, PiStarFill, PiScissors, PiCopy, PiClipboardText, PiTrash, PiExport, PiGear, PiWaveformBold, PiWaveformFill, PiWaveformDuotone } from 'react-icons/pi';
import { LibraryContext } from '../LibraryContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Remix.css';

const Remix = () => {
  const navigate = useNavigate();
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [masterVolume, setMasterVolume] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportFormat, setExportFormat] = useState('mp3');
  const [exportQuality, setExportQuality] = useState('high');
  const [showTimeline, setShowTimeline] = useState(true);
  const [showAutomation, setShowAutomation] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(4); // 4/4 time signature
  const [tempo, setTempo] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showVST, setShowVST] = useState(false);
  const [selectedVST, setSelectedVST] = useState(null);

  const { likedSongs, playlistSongs, searchSongs } = useContext(LibraryContext);

  const [effects, setEffects] = useState({
    tempo: 1,
    pitch: 0,
    volume: 1,
    reverb: 0,
    delay: 0,
    filter: 0,
    compression: 0,
    eq: {
      low: 0,
      mid: 0,
      high: 0
    },
    limiter: 0,
    distortion: 0,
    chorus: 0,
    phaser: 0,
    flanger: 0
  });

  const audioRefs = useRef({});
  const canvasRef = useRef(null);
  const audioContext = useRef(null);
  const analyzerNode = useRef(null);
  const masterGainNode = useRef(null);
  const timelineRef = useRef(null);
  const automationRef = useRef(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    analyzerNode.current = audioContext.current.createAnalyser();
    masterGainNode.current = audioContext.current.createGain();
    masterGainNode.current.connect(audioContext.current.destination);
    analyzerNode.current.connect(masterGainNode.current);
    
    if (canvasRef.current) {
      setupVisualization(analyzerNode.current);
    }
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const results = searchSongs(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
    setIsSearching(false);
  }, [searchQuery, searchSongs]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          return newTime >= duration ? 0 : newTime;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleTrackUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      addNewTrack({
        id: Date.now(),
        name: file.name,
        file: URL.createObjectURL(file),
        source: 'upload',
        effects: { ...effects },
        automation: [],
        color: getRandomColor()
      });
    }
  };

  const addNewTrack = (track) => {
    setTracks(prev => [...prev, {
      ...track,
      volume: 1,
      isMuted: false,
      solo: false,
      color: getRandomColor(),
      automation: [],
      vst: [],
      sends: [],
      receives: []
    }]);
  };

  const getRandomColor = () => {
    const colors = ['#1DB954', '#FF4081', '#536DFE', '#FFC107', '#00BCD4'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleLibraryTrackSelect = (song) => {
    addNewTrack({
      id: Date.now(),
      name: song.title,
      file: song.audioUrl,
      source: 'library',
      artistName: song.artist,
      coverUrl: song.coverUrl,
      effects: { ...effects },
      automation: [],
      color: getRandomColor()
    });
    setShowLibrary(false);
  };

  const handlePlayPause = () => {
    if (tracks.length === 0) return;

    setIsPlaying(prev => !prev);
    tracks.forEach(track => {
      const audio = audioRefs.current[track.id];
      if (audio) {
        if (!isPlaying) {
          audio.play();
        } else {
          audio.pause();
        }
      }
    });
  };

  const handleTrackVolume = (trackId, volume) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, volume: parseFloat(volume) } : track
    ));
  };

  const handleTrackMute = (trackId) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, isMuted: !track.isMuted } : track
    ));
  };

  const handleTrackSolo = (trackId) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, solo: !track.solo } : 
      { ...track, isMuted: true }
    ));
  };

  const handleTrackRemove = (trackId) => {
    setTracks(prev => prev.filter(track => track.id !== trackId));
    const audio = audioRefs.current[trackId];
    if (audio) {
      audio.pause();
      delete audioRefs.current[trackId];
    }
  };

  const handleEffectChange = (trackId, effect, value) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? {
        ...track,
        effects: {
          ...track.effects,
          [effect]: value
        }
      } : track
    ));
  };

  const handleAutomation = (trackId, parameter, time, value) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? {
        ...track,
        automation: [
          ...track.automation,
          { parameter, time, value }
        ].sort((a, b) => a.time - b.time)
      } : track
    ));
  };

  const handleVSTAdd = (trackId, vst) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? {
        ...track,
        vst: [...track.vst, vst]
      } : track
    ));
  };

  const handleSendAdd = (trackId, targetTrackId, amount) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? {
        ...track,
        sends: [...track.sends, { targetTrackId, amount }]
      } : track
    ));
  };

  const handleExport = () => {
    console.log('Exporting mix...', { 
      format: exportFormat, 
      quality: exportQuality,
      tempo,
      timeSignature
    });
  };

  const setupVisualization = (analyzer) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    analyzer.fftSize = 2048;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyzer.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1db954';
      ctx.beginPath();

      const sliceWidth = WIDTH * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * HEIGHT / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  return (
    <div className="remix-container">
      <div className="remix-header">
        <div className="header-left">
          <h1>MixAudio Studio</h1>
          <div className="transport-controls">
            <button onClick={handlePlayPause}>
              {isPlaying ? <PiPauseCircle /> : <PiPlayCircle />}
            </button>
            <div className="tempo-control">
              <span>BPM: {tempo}</span>
              <input
                type="range"
                min="20"
                max="240"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
              />
            </div>
            <div className="time-signature">
              <select value={timeSignature} onChange={(e) => setTimeSignature(e.target.value)}>
                <option value="4/4">4/4</option>
                <option value="3/4">3/4</option>
                <option value="6/8">6/8</option>
              </select>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button onClick={() => setShowMixer(!showMixer)}>
            <PiSliders /> Mixer
          </button>
          <button onClick={() => setShowEffects(!showEffects)}>
            <PiWaveform /> Effects
          </button>
          <button onClick={() => setShowVST(!showVST)}>
            <PiGear /> VST
          </button>
          <button onClick={() => setShowExport(true)}>
            <PiExport /> Export
          </button>
        </div>
      </div>

      <div className="remix-main">
        <div className="track-list">
          {tracks.map(track => (
            <div 
              key={track.id} 
              className={`track ${selectedTrack === track.id ? 'selected' : ''}`}
              onClick={() => setSelectedTrack(track.id)}
            >
              <div className="track-header" style={{ backgroundColor: track.color }}>
                <span>{track.name}</span>
                <div className="track-controls">
                  <button onClick={() => handleTrackMute(track.id)}>
                    {track.isMuted ? <PiSpeakerNone /> : <PiSpeakerHigh />}
                  </button>
                  <button onClick={() => handleTrackSolo(track.id)}>
                    {track.solo ? <PiStarFill /> : <PiStar />}
                  </button>
                  <button onClick={() => handleTrackRemove(track.id)}>
                    <PiTrash />
                  </button>
                </div>
              </div>
              <div className="track-content">
                <div className="track-fader">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={track.volume}
                    onChange={(e) => handleTrackVolume(track.id, e.target.value)}
                  />
                </div>
                <div className="track-waveform">
                  <canvas ref={canvasRef} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {showTimeline && (
          <div className="timeline" ref={timelineRef}>
            <div className="timeline-ruler">
              {/* Time markers */}
            </div>
            <div className="timeline-tracks">
              {tracks.map(track => (
                <div key={track.id} className="timeline-track">
                  {/* Track regions */}
                </div>
              ))}
            </div>
          </div>
        )}

        {showAutomation && (
          <div className="automation" ref={automationRef}>
            {/* Automation lanes */}
          </div>
        )}
      </div>

      {showMixer && (
        <div className="mixer-panel">
          {tracks.map(track => (
            <div key={track.id} className="mixer-channel">
              <div className="channel-fader">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.volume}
                  onChange={(e) => handleTrackVolume(track.id, e.target.value)}
                />
              </div>
              <div className="channel-effects">
                {/* Effect slots */}
              </div>
            </div>
          ))}
          <div className="master-channel">
            <div className="master-fader">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => setMasterVolume(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      {showEffects && (
        <div className="effects-panel">
          {selectedTrack && (
            <>
              <div className="effect-group">
                <h3>EQ</h3>
                <div className="eq-controls">
                  <div className="eq-band">
                    <label>Low</label>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={effects.eq.low}
                      onChange={(e) => handleEffectChange(selectedTrack, 'eq.low', Number(e.target.value))}
                    />
                  </div>
                  <div className="eq-band">
                    <label>Mid</label>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={effects.eq.mid}
                      onChange={(e) => handleEffectChange(selectedTrack, 'eq.mid', Number(e.target.value))}
                    />
                  </div>
                  <div className="eq-band">
                    <label>High</label>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={effects.eq.high}
                      onChange={(e) => handleEffectChange(selectedTrack, 'eq.high', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              <div className="effect-group">
                <h3>Dynamics</h3>
                <div className="dynamics-controls">
                  <div className="control">
                    <label>Compression</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      value={effects.compression}
                      onChange={(e) => handleEffectChange(selectedTrack, 'compression', Number(e.target.value))}
                    />
                  </div>
                  <div className="control">
                    <label>Limiter</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      value={effects.limiter}
                      onChange={(e) => handleEffectChange(selectedTrack, 'limiter', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              <div className="effect-group">
                <h3>Modulation</h3>
                <div className="modulation-controls">
                  <div className="control">
                    <label>Chorus</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      value={effects.chorus}
                      onChange={(e) => handleEffectChange(selectedTrack, 'chorus', Number(e.target.value))}
                    />
                  </div>
                  <div className="control">
                    <label>Phaser</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      value={effects.phaser}
                      onChange={(e) => handleEffectChange(selectedTrack, 'phaser', Number(e.target.value))}
                    />
                  </div>
                  <div className="control">
                    <label>Flanger</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      value={effects.flanger}
                      onChange={(e) => handleEffectChange(selectedTrack, 'flanger', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {showVST && (
        <div className="vst-panel">
          <div className="vst-list">
            {/* VST plugins list */}
          </div>
          {selectedVST && (
            <div className="vst-interface">
              {/* VST plugin interface */}
            </div>
          )}
        </div>
      )}

      {showExport && (
        <div className="export-panel">
          <h2>Export Mix</h2>
          <div className="export-options">
            <div className="option">
              <label>Format</label>
              <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
                <option value="aiff">AIFF</option>
              </select>
            </div>
            <div className="option">
              <label>Quality</label>
              <select value={exportQuality} onChange={(e) => setExportQuality(e.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="export-actions">
            <button onClick={handleExport}>Export</button>
            <button onClick={() => setShowExport(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Remix; 