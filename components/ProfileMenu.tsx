import React from 'react';
import { LogoutIcon, UserCircleIcon, ChartBarIcon } from './icons';
import type { ModalContent } from '../types';

interface ProfileMenuProps {
    isOpen: boolean;
    onNavigate: (content: ModalContent) => void;
    onLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ isOpen, onNavigate, onLogout }) => {
    if (!isOpen) return null;

    const menuItems = [
        { label: 'My Profile', icon: <UserCircleIcon className="h-5 w-5" />, content: 'profile' as ModalContent },
        { label: 'My Stats', icon: <ChartBarIcon className="h-5 w-5" />, content: 'stats' as ModalContent },
    ];

    return (
        <div className="absolute top-20 right-4 w-48 bg-white dark:bg-brand-dark-secondary rounded-lg shadow-xl z-40 animate-fade-in-fast overflow-hidden">
            <ul>
                {menuItems.map(item => (
                    <li key={item.label}>
                        <button 
                            onClick={() => onNavigate(item.content)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-dark dark:text-brand-light hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    </li>
                ))}
                <li>
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-200 dark:border-gray-600 transition-colors"
                    >
                        <LogoutIcon className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </li>
            </ul>
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out; }
            `}</style>
        </div>
    );
};

export default ProfileMenu;
