import React, { useRef, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import type { BikeWithDistance, LatLng } from '../types';
import { BatteryIcon, CloseIcon, SpinnerIcon } from './icons';

interface LocationPanelProps {
    bikes: BikeWithDistance[];
    onSelectBike: (bike: BikeWithDistance) => void;
    onSetDestination: (location: LatLng, address: string) => void;
    onClearDestination: () => void;
    destinationAddress: string | null;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
}

const LocationPanel: React.FC<LocationPanelProps> = ({ bikes, onSelectBike, onSetDestination, onClearDestination, destinationAddress, isExpanded, setIsExpanded, isLoading, error, onRetry }) => {
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // Find the actual input element for the ref
        const inputElement = document.getElementById('autocomplete-input') as HTMLInputElement;
        if (inputElement) {
            inputRef.current = inputElement;
        }
    }, []);

    const handlePlaceSelect = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location && place.formatted_address) {
                const location = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };
                onSetDestination(location, place.formatted_address);
                setIsExpanded(true);
                inputRef.current?.blur();
            }
        }
    };
    
    const clearDestination = () => {
        onClearDestination();
        if (inputRef.current) inputRef.current.value = '';
    }

    const renderDestinationInput = () => {
        if (typeof window === 'undefined' || !window.google || !window.google.maps.places) {
            return <div className="w-full text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-brand-dark dark:text-brand-light">Map services loading...</div>;
        }

        return (
            <div className="relative w-full">
                <Autocomplete
                    onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
                    onPlaceChanged={handlePlaceSelect}
                    options={{ fields: ["formatted_address", "geometry.location"] }}
                >
                    <input
                        id="autocomplete-input"
                        type="text"
                        placeholder="Where to?"
                        defaultValue={destinationAddress || ''}
                        className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent focus:outline-none text-brand-dark dark:text-brand-light"
                    />
                </Autocomplete>
                {destinationAddress && (
                    <button onClick={clearDestination} className="absolute inset-y-0 right-0 flex items-center pr-3" aria-label="Clear destination">
                        <CloseIcon className="h-5 w-5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" />
                    </button>
                )}
            </div>
        );
    }
    
    const renderBikeList = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500 dark:text-gray-400">
                    <SpinnerIcon className="h-8 w-8 mb-2" />
                    <p>Finding nearby bikes...</p>
                </div>
            );
        }

        if (error) {
            return (
                 <div className="flex flex-col items-center justify-center h-40 text-center text-red-500">
                    <p className="mb-4">{error}</p>
                    <button onClick={onRetry} className="bg-brand-green text-white font-semibold py-2 px-6 rounded-lg">
                        Try Again
                    </button>
                </div>
            )
        }

        return (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {bikes.length > 0 ? bikes.slice(0, 5).map(bike => (
                    <li key={bike.id} onClick={() => onSelectBike(bike)} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                        <div className="flex items-center gap-4">
                            <BatteryIcon batteryLevel={bike.battery} className="h-8 w-8" />
                            <div>
                                <p className="font-bold text-brand-dark dark:text-brand-light">{bike.model}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{bike.battery}% battery, {bike.range} km range</p>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                             <p className="font-bold text-brand-dark dark:text-brand-light">{bike.walkTime.toFixed(0)} min</p>
                             <p className="text-sm text-gray-500 dark:text-gray-400">{bike.distance.toFixed(1)} km</p>
                        </div>
                    </li>
                )) : (
                    <li className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center text-gray-500 dark:text-gray-400">
                        No suitable bikes found.
                    </li>
                )}
            </ul>
        )
    }

    return (
        <div className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-brand-dark-secondary rounded-t-2xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.3)] z-30 transition-transform duration-300 ease-out ${isExpanded ? 'transform-none' : 'translate-y-[calc(100%-100px)]'}`}
             style={{ touchAction: 'pan-y' }}>
            <div className="p-4">
                <div 
                    className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3 cursor-grab"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
                ></div>

                {renderDestinationInput()}
                
                <div className={`mt-4 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="flex items-center justify-between mb-2">
                       <h2 className="text-xl font-bold text-brand-dark dark:text-brand-light">{destinationAddress ? 'Recommended Bikes' : 'Nearest Bikes'}</h2>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        {destinationAddress 
                            ? 'Bikes with enough range for your trip.'
                            : 'Choose a bike to see details and directions.'
                        }
                    </p>
                    {renderBikeList()}
                </div>
            </div>
        </div>
    );
};

export default React.memo(LocationPanel);