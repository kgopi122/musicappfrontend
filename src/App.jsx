import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Layout from './Layout';
import MainPage from './Home';
import SongPage from './SongPage';
import GenrePage from './GenrePage';
import ArtistPage from './pages/ArtistPage';
import SearchPage from './SearchPage.jsx';
import Library from './Library';
import Settings from './Settings';
import Profile from './Profile';
import { LibraryProvider } from './LibraryContext';
import { PlayerProvider } from './PlayerContext';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './styles/theme.css';
// import Header from './header';
import Remix from './pages/Remix';

const App = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <LibraryProvider>
          <PlayerProvider>
            <Router basename='/music'>
              <div className="app">
                
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<MainPage />} />
                    <Route path="song/:songId" element={<SongPage />} />
                    <Route path="genre/:genreName" element={<GenrePage />} />
                    <Route path="artist/:artistName" element={<ArtistPage />} />
                    <Route path="SearchPage" element={<SearchPage />} />
                    <Route path="library" element={<Library />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>
                  <Route path="/login" element={<Login />} />
                  <Route path="/remix" element={<Remix />} />
                </Routes>
              </div>
            </Router>
          </PlayerProvider>
        </LibraryProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
