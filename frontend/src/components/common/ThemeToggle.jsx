import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl border border-slate-700 dark:border-slate-800 bg-slate-800/80 dark:bg-slate-900 text-slate-300 dark:text-slate-300 hover:text-amber-400 dark:hover:text-amber-400 hover:bg-slate-700 transition flex items-center space-x-1.5 text-xs font-medium"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
