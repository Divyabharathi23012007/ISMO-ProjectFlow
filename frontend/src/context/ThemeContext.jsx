import { createContext, useContext, useState, useEffect } from 'react';

export const themes = {
  dark: {
    name: 'Dark',
    key: 'dark',
    icon: '🌑',
    bg: '#0a0f1e',
    sidebar: '#0d1424',
    card: '#111827',
    cardBorder: '#1e2a3a',
    text: '#f1f5f9',
    textMuted: '#64748b',
    accent: '#6366f1',
    accentHover: '#818cf8',
    accentBg: 'rgba(99,102,241,0.1)',
    inputBg: '#1e2a3a',
    inputBorder: '#2d3f55',
  },
  light: {
    name: 'Light',
    key: 'light',
    icon: '☀️',
    bg: '#f0f4f8',
    sidebar: '#ffffff',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    accentBg: 'rgba(99,102,241,0.08)',
    inputBg: '#f8fafc',
    inputBorder: '#e2e8f0',
  },
  midnight: {
    name: 'Midnight',
    key: 'midnight',
    icon: '🌌',
    bg: '#05050f',
    sidebar: '#08081a',
    card: '#0d0d20',
    cardBorder: '#1a1a35',
    text: '#e2e8f0',
    textMuted: '#4a5568',
    accent: '#a855f7',
    accentHover: '#c084fc',
    accentBg: 'rgba(168,85,247,0.1)',
    inputBg: '#111125',
    inputBorder: '#1e1e3a',
  },
  ocean: {
    name: 'Ocean',
    key: 'ocean',
    icon: '🌊',
    bg: '#051320',
    sidebar: '#071a2b',
    card: '#0a2035',
    cardBorder: '#0e3050',
    text: '#e0f2fe',
    textMuted: '#5b8db8',
    accent: '#06b6d4',
    accentHover: '#22d3ee',
    accentBg: 'rgba(6,182,212,0.1)',
    inputBg: '#0d243a',
    inputBorder: '#1a3a55',
  },
  forest: {
    name: 'Forest',
    key: 'forest',
    icon: '🌿',
    bg: '#071510',
    sidebar: '#0a1e14',
    card: '#0d2418',
    cardBorder: '#163525',
    text: '#dcfce7',
    textMuted: '#4d8060',
    accent: '#22c55e',
    accentHover: '#4ade80',
    accentBg: 'rgba(34,197,94,0.1)',
    inputBg: '#0f2a1c',
    inputBorder: '#1a4030',
  },
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem('theme') || 'dark');
  const theme = themes[themeKey] || themes.dark;

  useEffect(() => {
    localStorage.setItem('theme', themeKey);
    const r = document.documentElement;
    r.style.setProperty('--bg', theme.bg);
    r.style.setProperty('--sidebar', theme.sidebar);
    r.style.setProperty('--card', theme.card);
    r.style.setProperty('--card-border', theme.cardBorder);
    r.style.setProperty('--text', theme.text);
    r.style.setProperty('--text-muted', theme.textMuted);
    r.style.setProperty('--accent', theme.accent);
    r.style.setProperty('--accent-hover', theme.accentHover);
    r.style.setProperty('--accent-bg', theme.accentBg);
    r.style.setProperty('--input-bg', theme.inputBg);
    r.style.setProperty('--input-border', theme.inputBorder);
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;
  }, [themeKey, theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeKey, setTheme: setThemeKey, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};
