import { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { FaMoon, FaSun } from 'react-icons/fa';
import { FEATURES } from '../config/features';

// Light/dark theme for the storefront. Inactive while FEATURES.darkMode is
// false: the site stays light and nothing is stored or applied.
//
// When on, it sets <html data-theme="dark|light">. All dark colours live in
// theme/dark.css, scoped to html[data-theme="dark"], and antd components switch
// to antd's built-in dark algorithm.

const STORAGE_KEY = 'storefront_theme';

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {}, enabled: false });

const initialTheme = () => {
  if (!FEATURES.darkMode) return 'light';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage blocked: fall through to the device setting.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(initialTheme);

  useEffect(() => {
    if (!FEATURES.darkMode) return;
    document.documentElement.setAttribute('data-theme', mode);
    try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* ignore */ }
  }, [mode]);

  const isDark = FEATURES.darkMode && mode === 'dark';
  const toggleTheme = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, enabled: FEATURES.darkMode }}>
      {FEATURES.darkMode ? (
        <ConfigProvider
          theme={{
            algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
            token: isDark ? { colorBgContainer: '#1b1f27', colorBgElevated: '#232833' } : {},
          }}
        >
          {children}
        </ConfigProvider>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Sun/moon button for the header. Renders nothing while dark mode is disabled.
export const ThemeToggle = () => {
  const { isDark, toggleTheme, enabled } = useTheme();
  if (!enabled) return null;
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle flex items-center justify-center w-8 h-8 rounded-full bg-transparent border-0 cursor-pointer text-black"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
    >
      {isDark ? <FaSun size={18} /> : <FaMoon size={17} />}
    </button>
  );
};
