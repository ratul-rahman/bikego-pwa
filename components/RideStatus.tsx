
import React, { useEffect, useState } from 'react';
import type { Bike, RideDetails } from '../types';

interface RideStatusProps {
  bike: Bike;
  rideDetails: RideDetails;
  onEndRide: () => void;
}

const RideStatus: React.FC<RideStatusProps> = ({ bike, rideDetails, onEndRide }) => {

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-brand-dark text-brand-dark dark:text-white p-4 rounded-t-2xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.3)] z-30 animate-slide-up">
      {rideDetails.isPaused && (
        <div className="absolute inset-x-0 -top-10 flex justify-center">
            <div className="bg-yellow-400 text-yellow-900 font-bold px-4 py-1.5 rounded-full text-sm shadow-lg animate-pulse">
                RIDE PAUSED
            </div>
        </div>
      )}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">On a Ride with</h2>
        <p className="text-brand-green text-lg">{bike.model}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Time</span>
          <p className="text-xl font-bold">{formatTime(rideDetails.duration)}</p>
        </div>
        <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Cost</span>
          <p className="text-xl font-bold">৳{rideDetails.cost.toFixed(2)}</p>
        </div>
        <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Distance</span>
          <p className="text-xl font-bold">{rideDetails.distance.toFixed(2)} km</p>
        </div>
      </div>

      <button
        onClick={onEndRide}
        className="w-full bg-red-600 text-white font-bold py-4 rounded-lg text-lg hover:bg-red-700 transition-colors duration-300"
      >
        End Ride
      </button>

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

export default RideStatus;