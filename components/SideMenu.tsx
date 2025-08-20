import React from 'react';
import { CloseIcon, ClockIcon, CreditCardIcon, TagIcon, QuestionMarkCircleIcon, CogIcon } from './icons';
import type { ModalContent } from '../types';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (content: ModalContent) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate }) => {
    const menuItems = [
        { label: 'Ride History', icon: <ClockIcon />, content: 'rideHistory' as ModalContent },
        { label: 'Payments', icon: <CreditCardIcon />, content: 'payments' as ModalContent },
        { label: 'Promotions', icon: <TagIcon />, content: 'promotions' as ModalContent },
        { label: 'Help Center', icon: <QuestionMarkCircleIcon />, content: 'help' as ModalContent },
        { label: 'Settings', icon: <CogIcon />, content: 'settings' as ModalContent },
    ];

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div className={`fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-brand-dark shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-brand-dark dark:text-brand-light">Menu</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close menu">
                        <CloseIcon className="h-6 w-6 text-brand-dark dark:text-brand-light"/>
                    </button>
                </div>
                <nav className="p-4">
                    <ul>
                        {menuItems.map(item => (
                            <li key={item.label}>
                                <button 
                                    onClick={() => onNavigate(item.content)}
                                    className="w-full flex items-center gap-4 p-3 rounded-lg text-lg text-brand-dark dark:text-brand-light hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <span className="text-brand-green">{item.icon}</span>
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default SideMenu;
