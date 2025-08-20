import type { Bike, LatLng, RideDetails } from './types';
import { BIKES } from './constants';

// --- SIMULATED BACKEND API ---

const SIMULATED_LATENCY = 800; // ms

// A helper to simulate network delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- User Authentication ---

/**
 * Simulates sending an OTP to a user's phone.
 * In a real app, this would trigger an SMS service.
 */
export const sendOtp = async (phone: string): Promise<{ success: boolean }> => {
    console.log(`API: Sending OTP to ${phone}`);
    await wait(SIMULATED_LATENCY);
    // In a real app, you'd handle errors from the SMS gateway.
    // For the prototype, we'll always succeed.
    return { success: true };
};

/**
 * Simulates verifying an OTP.
 * The backend would check the submitted OTP against the one it generated.
 */
export const verifyOtp = async (phone: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    console.log(`API: Verifying OTP ${otp} for ${phone}`);
    await wait(SIMULATED_LATENCY);

    if (otp === '123456') {
        // Correct OTP
        return { success: true };
    } else {
        // Incorrect OTP
        return { success: false, error: 'Invalid OTP. Please try again.' };
    }
};


// --- Data Fetching ---

/**
 * Simulates fetching available bikes from the server.
 * The server would query its database for bikes near the user's location.
 */
export const fetchBikes = async (userLocation: LatLng): Promise<Bike[]> => {
    console.log('API: Fetching bikes near', userLocation);
    await wait(SIMULATED_LATENCY);
    
    // Simulate a potential network failure
    if (Math.random() < 0.1) { // 10% chance of failure
        throw new Error("Failed to connect to the server. Please check your connection.");
    }
    
    // In a real app, the backend would do this filtering. Here we do it client-side.
    return BIKES;
};

// --- Ride Management ---

/**
 * Simulates starting a ride.
 * The backend would validate the request, lock the bike to the user, and create a new ride record.
 */
export const startRide = async (bikeId: number): Promise<{ success: boolean }> => {
    console.log(`API: Starting ride for bike ${bikeId}`);
    await wait(SIMULATED_LATENCY);
    return { success: true };
};

/**
 * Simulates ending a ride.
 * The backend would calculate the final cost, update the ride record, and make the bike available again.
 */
export const endRide = async (rideDetails: RideDetails): Promise<{ success: boolean }> => {
    console.log('API: Ending ride with details:', rideDetails);
    await wait(SIMULATED_LATENCY);
    return { success: true };
};

// --- Payments ---

/**
 * Simulates processing a payment through a payment gateway.
 */
export const processPayment = async (rideDetails: RideDetails): Promise<{ success: boolean; transactionId: string }> => {
    console.log(`API: Processing payment of ৳${rideDetails.cost.toFixed(2)}`);
    await wait(SIMULATED_LATENCY * 2); // Payments take a bit longer
    return { success: true, transactionId: `txn_${Date.now()}` };
};
