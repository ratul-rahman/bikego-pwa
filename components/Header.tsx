
import React from 'react';
import { MenuIcon, UserIcon, SunIcon, MoonIcon } from './icons';

interface HeaderProps {
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
    onMenuClick: () => void;
    onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle, onMenuClick, onProfileClick }) => {
  return (
    <header className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center">
      <button onClick={onMenuClick} className="bg-white/80 dark:bg-brand-dark-secondary/80 backdrop-blur-sm p-3 rounded-full shadow-lg" aria-label="Open menu">
        <MenuIcon className="h-6 w-6 text-brand-dark dark:text-brand-light" />
      </button>
      <div className="flex items-center gap-2 bg-white/80 dark:bg-brand-dark-secondary/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-brand-light">BikeGo</h1>
        <button onClick={onThemeToggle} className="p-1 rounded-full" aria-label="Toggle theme">
            {theme === 'light' 
                ? <MoonIcon className="h-5 w-5 text-brand-dark dark:text-brand-light" /> 
                : <SunIcon className="h-5 w-5 text-brand-dark dark:text-brand-light" />
            }
        </button>
      </div>
      <button onClick={onProfileClick} className="bg-white/80 dark:bg-brand-dark-secondary/80 backdrop-blur-sm p-3 rounded-full shadow-lg" aria-label="Open profile menu">
        <UserIcon className="h-6 w-6 text-brand-dark dark:text-brand-light" />
      </button>
    </header>
  );
};

export default Header;