import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

interface DarkModeToggleProps {
  onToggle?: (isDark: boolean) => void;
}

export function DarkModeToggle({ onToggle }: DarkModeToggleProps) {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update localStorage
    localStorage.setItem('darkMode', String(isDark));
    
    // Update document class
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    onToggle?.(isDark);
  }, [isDark, onToggle]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={`p-2 rounded-lg transition-all ${
        isDark
          ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
          : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
      }`}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

// Export utility functions
export function enableDarkMode() {
  document.documentElement.classList.add('dark');
  localStorage.setItem('darkMode', 'true');
}

export function disableDarkMode() {
  document.documentElement.classList.remove('dark');
  localStorage.setItem('darkMode', 'false');
}

export function getDarkModePreference(): boolean {
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) return saved === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
