import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, ThemeConfig, fonts, borderRadii } from '../config/themes';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  themeId: string;
  setThemeId: (id: string) => void;
  fontId: string;
  setFontId: (id: string) => void;
  radiusId: string;
  setRadiusId: (id: string) => void;
  availableThemes: ThemeConfig[];
  currentTheme: ThemeConfig;
  availableFonts: typeof fonts;
  availableRadii: typeof borderRadii;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mode state (light/dark)
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) return savedMode as ThemeMode;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  // Theme ID state (color scheme)
  const [themeId, setThemeIdState] = useState<string>(() => {
    return localStorage.getItem('themeId') || 'default';
  });

  // Font state
  const [fontId, setFontIdState] = useState<string>(() => {
    return localStorage.getItem('fontId') || 'inter';
  });

  // Radius state
  const [radiusId, setRadiusIdState] = useState<string>(() => {
    return localStorage.getItem('radiusId') || 'md';
  });

  const currentTheme = themes.find(t => t.id === themeId) || themes[0];

  // Apply Mode
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Apply Theme Colors
  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--color-hexa-primary', currentTheme.colors.primary);
    root.style.setProperty('--color-hexa-secondary', currentTheme.colors.secondary);
    root.style.setProperty('--color-hexa-dark', currentTheme.colors.dark);
    localStorage.setItem('themeId', themeId);
  }, [themeId, currentTheme]);

  // Apply Font
  useEffect(() => {
    const root = window.document.documentElement;
    const font = fonts.find(f => f.id === fontId) || fonts[0];
    root.style.setProperty('--font-family-sans', font.value);
    // Also set the body font family directly to ensure it applies
    document.body.style.fontFamily = font.value;
    localStorage.setItem('fontId', fontId);
  }, [fontId]);

  // Apply Radius
  useEffect(() => {
    const root = window.document.documentElement;
    const radius = borderRadii.find(r => r.id === radiusId) || borderRadii[2];
    root.style.setProperty('--radius-default', radius.value);
    localStorage.setItem('radiusId', radiusId);
  }, [radiusId]);

  const toggleMode = () => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setThemeId = (id: string) => {
    if (themes.find(t => t.id === id)) {
      setThemeIdState(id);
    }
  };

  const setFontId = (id: string) => {
    if (fonts.find(f => f.id === id)) {
      setFontIdState(id);
    }
  };

  const setRadiusId = (id: string) => {
    if (borderRadii.find(r => r.id === id)) {
      setRadiusIdState(id);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      mode, 
      toggleMode, 
      themeId, 
      setThemeId,
      fontId,
      setFontId,
      radiusId,
      setRadiusId,
      availableThemes: themes,
      currentTheme,
      availableFonts: fonts,
      availableRadii: borderRadii
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
