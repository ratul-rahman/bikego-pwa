import React from 'react';
import type { BikeWithDistance } from '../types';
import { BatteryIcon, CloseIcon } from './icons';

interface BikeCardProps {
  bike: BikeWithDistance;
  onUnlock: () => void;
  onClose: () => void;
}

const InfoPill: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-3 w-full">
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">{icon}<span className="text-sm">{label}</span></div>
        <p className="text-lg font-bold text-brand-dark dark:text-brand-light">{value}</p>
    </div>
);


const BikeCard: React.FC<BikeCardProps> = ({ bike, onUnlock, onClose }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-brand-dark-secondary p-4 rounded-t-2xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.3)] z-30 animate-slide-up">
        <div className="relative">
             <button onClick={onClose} className="absolute -top-2 -right-2 bg-gray-200 dark:bg-gray-600 rounded-full p-1 z-40">
                <CloseIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-brand-dark dark:text-brand-light">{bike.model}</h2>
                <p className="text-gray-500 dark:text-gray-400">{bike.walkTime.toFixed(0)} min walk away ({bike.distance.toFixed(1)} km)</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <InfoPill icon={<BatteryIcon batteryLevel={bike.battery} className="h-5 w-5"/>} label="Battery" value={`${bike.battery}%`} />
                <InfoPill icon={<span className="text-xl">৳</span>} label="Rate" value={`${bike.rate}/min`} />
                <InfoPill icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} label="Range" value={`${bike.range} km`} />
            </div>

            <div className="flex items-center gap-3">
                <button
                    className="w-1/3 bg-gray-200 dark:bg-gray-600 text-brand-dark dark:text-brand-light font-bold py-4 rounded-lg text-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-300"
                >
                    Route
                </button>
                <button
                    onClick={onUnlock}
                    className="w-2/3 bg-brand-green text-white font-bold py-4 rounded-lg text-lg hover:bg-green-500 transition-colors duration-300"
                >
                    Unlock Bike
                </button>
            </div>
        </div>
        <style>{`
            @keyframes slide-up {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            .animate-slide-up { animation: slide-up 0.3s ease-out; }
        `}</style>
    </div>
  );
};

export default BikeCard;