import { useEffect, useState } from 'react';

const DARK_BG  = '#030712';
const LIGHT_BG = '#f9fafb';

const applyTheme = (dark: boolean) => {
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
    root.style.backgroundColor = DARK_BG;
    document.body.style.backgroundColor = DARK_BG;
    localStorage.setItem('theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.style.backgroundColor = LIGHT_BG;
    document.body.style.backgroundColor = LIGHT_BG;
    localStorage.setItem('theme', 'light');
  }
};

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark')  return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => { applyTheme(isDark); }, [isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  return { isDark, toggleDarkMode };
}
