import { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import { antdDarkTheme, antdLightTheme } from '../config/antdTheme';

const STORAGE_KEY = 'admin-theme';
const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

const initialTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* storage blocked */ }
  // First visit: follow the device setting.
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

// Drives both halves of the admin's styling: the CSS variables (via
// <html data-theme>) used by Tailwind classes, and Ant Design's theme tokens.
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* storage blocked */ }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ConfigProvider theme={theme === 'dark' ? antdDarkTheme : antdLightTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
