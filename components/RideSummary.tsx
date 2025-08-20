
import React, { useState } from 'react';
import type { RideDetails } from '../types';
import { SpinnerIcon, CheckIcon } from './icons';
import { processPayment } from '../api';

interface RideSummaryProps {
  rideDetails: RideDetails;
  onClose: () => void;
}

const RideSummary: React.FC<RideSummaryProps> = ({ rideDetails, onClose }) => {
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    };

    const handlePay = async () => {
        setPaymentStatus('processing');
        try {
            const result = await processPayment(rideDetails);
            if (result.success) {
                setPaymentStatus('success');
                setTimeout(() => {
                    onClose();
                }, 1500); // Wait 1.5s on success message before closing
            } else {
                setPaymentStatus('error');
            }
        } catch (error) {
            console.error("Payment failed", error);
            setPaymentStatus('error');
        }
    };
    
    const renderPaymentButton = () => {
        switch (paymentStatus) {
            case 'processing':
                return (
                    <button
                        disabled
                        className="w-full flex items-center justify-center bg-yellow-500 text-white font-bold py-3 rounded-lg text-lg transition-colors duration-300"
                    >
                        <SpinnerIcon className="mr-3 h-5 w-5" />
                        Processing...
                    </button>
                );
            case 'success':
                return (
                    <button
                        disabled
                        className="w-full flex items-center justify-center bg-brand-green text-white font-bold py-3 rounded-lg text-lg transition-colors duration-300"
                    >
                         <CheckIcon className="mr-3 h-6 w-6" />
                        Payment Successful
                    </button>
                );
            case 'error':
                 return (
                    <button
                        onClick={handlePay}
                        className="w-full bg-red-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-red-700 transition-colors duration-300"
                    >
                        Payment Failed - Retry
                    </button>
                );
            case 'idle':
            default:
                return (
                    <button
                        onClick={handlePay}
                        className="w-full bg-brand-dark dark:bg-brand-light text-white dark:text-brand-dark font-bold py-3 rounded-lg text-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors duration-300"
                    >
                        Pay ৳{rideDetails.cost.toFixed(2)} with bKash
                    </button>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white dark:bg-brand-dark-secondary rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
                <h2 className="text-3xl font-bold text-brand-dark dark:text-brand-light mb-2">Ride Complete!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Here's your ride summary.</p>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-baseline bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-300">Total Cost</span>
                        <span className="text-2xl font-bold text-brand-green">৳{rideDetails.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-baseline bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-300">Duration</span>
                        <span className="text-lg font-semibold text-brand-dark dark:text-brand-light">{formatTime(rideDetails.duration)}</span>
                    </div>
                    <div className="flex justify-between items-baseline bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-300">Distance</span>
                        <span className="text-lg font-semibold text-brand-dark dark:text-brand-light">{rideDetails.distance.toFixed(2)} km</span>
                    </div>
                </div>

                {renderPaymentButton()}
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default RideSummary;