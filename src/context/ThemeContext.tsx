import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'ocean-light' | 'forest-light' | 'ocean-dark' | 'midnight-purple';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'taskflow-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('ocean-light');

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored) {
      setThemeState(stored);
      applyTheme(stored);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-forest-light', 'theme-midnight-purple');
    
    switch (newTheme) {
      case 'ocean-light':
        break;
      case 'forest-light':
        root.classList.add('theme-forest-light');
        break;
      case 'ocean-dark':
        root.classList.add('dark');
        break;
      case 'midnight-purple':
        root.classList.add('dark', 'theme-midnight-purple');
        break;
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const THEME_OPTIONS: { value: Theme; label: string; description: string; isDark: boolean }[] = [
  { value: 'ocean-light', label: 'Ocean Light', description: 'Clean blue theme', isDark: false },
  { value: 'forest-light', label: 'Forest Light', description: 'Natural green theme', isDark: false },
  { value: 'ocean-dark', label: 'Ocean Dark', description: 'Dark blue theme', isDark: true },
  { value: 'midnight-purple', label: 'Midnight Purple', description: 'Purple dark theme', isDark: true },
];
