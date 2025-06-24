import React, { createContext, useContext, useState, useEffect } from 'react';
import './styles/theme.css';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    return savedFontSize ? parseInt(savedFontSize) : 16;
  });

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('settings');
    return savedSettings ? JSON.parse(savedSettings) : {
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        newReleases: true
      },
      privacy: {
        profileVisibility: true,
        activityStatus: true,
        playlistVisibility: true
      },
      playback: {
        audioQuality: 'high',
        crossfade: true,
        autoplay: true
      }
    };
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Apply theme-specific styles
    document.body.style.backgroundColor = 'var(--background)';
    document.body.style.color = 'var(--text)';
  }, [theme]);

  // Apply font size
  useEffect(() => {
    // Calculate font size multipliers based on the base font size
    const baseSize = fontSize;
    const multipliers = {
      xs: 0.75,    // 12px
      sm: 0.875,   // 14px
      base: 1,     // 16px
      lg: 1.125,   // 18px
      xl: 1.25,    // 20px
      '2xl': 1.5,  // 24px
      '3xl': 1.875,// 30px
      '4xl': 2.25  // 36px
    };

    // Apply font sizes to CSS variables
    Object.entries(multipliers).forEach(([size, multiplier]) => {
      document.documentElement.style.setProperty(
        `--font-size-${size}`,
        `${baseSize * multiplier}px`
      );
    });

    // Set base font size
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (category, value) => {
    setSettings(prevSettings => {
      if (typeof value === 'object') {
        return {
          ...prevSettings,
          [category]: {
            ...prevSettings[category],
            ...value
          }
        };
      }
      return {
        ...prevSettings,
        [category]: value
      };
    });
  };

  const value = {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    settings,
    updateSettings
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 