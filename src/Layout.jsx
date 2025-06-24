// Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header';
import Playbar from './Playbar';
import './styles/header.css';

const Layout = () => {
  return (
    <div id="body" style={{ 
      width: '100%', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <Header />
      <main id="main-content" style={{
        flex: 1,
        width: '100%',
        minHeight: 'calc(100vh - 80px)',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <Outlet />
      </main>
      <Playbar />
    </div>
  );
};

export default Layout;
