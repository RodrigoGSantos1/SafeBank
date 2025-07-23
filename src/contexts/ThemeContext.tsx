import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

const lightColors: ThemeColors = {
  primary: '#FE7359',
  background: '#FFFFFF',
  card: '#F8F9FA',
  textPrimary: '#1A1A1A',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
};

const darkColors: ThemeColors = {
  primary: '#FE7359',
  background: '#121E28',
  card: '#1E293B',
  textPrimary: '#FFFFFF',
  textSecondary: '#CBD5E1',
  border: '#334155',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

const THEME_STORAGE_KEY = '@SafeBank:theme';

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');

  const isDark = theme === 'system' 
    ? systemColorScheme === 'dark'
    : theme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeState(savedTheme as Theme);
        }
      } catch (error) {
      }
    };

    loadSavedTheme();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    colors,
    isDark,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 