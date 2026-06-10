import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

const LIGHT_COLORS = {
  background: '#f9fafb',
  text: '#111827',
  subtext: '#6b7280',
  card: '#ffffff',
  border: '#e5e7eb',
  primary: '#2563eb',
  accent: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  cardBgLight: '#f3f4f6',
  cardBgActive: '#111827',
  brandPillText: '#4b5563',
  brandPillTextActive: '#ffffff',
  shadowColor: '#000000',
  statusBar: 'dark-content',
};

const DARK_COLORS = {
  background: '#0f172a',
  text: '#f8fafc',
  subtext: '#94a3b8',
  card: '#1e293b',
  border: '#334155',
  primary: '#3b82f6',
  accent: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  cardBgLight: '#1e293b',
  cardBgActive: '#f8fafc',
  brandPillText: '#94a3b8',
  brandPillTextActive: '#0f172a',
  shadowColor: '#000000',
  statusBar: 'light-content',
};

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState(systemScheme || 'light');

  useEffect(() => {
    if (systemScheme) {
      setTheme(systemScheme);
    }
  }, [systemScheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
