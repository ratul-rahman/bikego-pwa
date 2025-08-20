import type { Bike } from './types';

// Centered around Dhaka University area
export const MAP_CENTER = {
  lat: 23.734,
  lng: 90.393
};

export const BIKES: Bike[] = [
  { id: 1, location: { lat: 23.735, lng: 90.394 }, battery: 85, model: 'Sprinter ZX', rate: 2.5, range: 45 },
  { id: 2, location: { lat: 23.733, lng: 90.392 }, battery: 92, model: 'CityGlide', rate: 2.0, range: 50 },
  { id: 3, location: { lat: 23.736, lng: 90.391 }, battery: 60, model: 'Sprinter ZX', rate: 2.5, range: 30 },
  { id: 4, location: { lat: 23.732, lng: 90.395 }, battery: 78, model: 'EcoRide', rate: 1.8, range: 40 },
  { id: 5, location: { lat: 23.734, lng: 90.390 }, battery: 45, model: 'CityGlide', rate: 2.0, range: 22 },
];

// A dummy geofenced area around the university
export const GEOFENCE_PATH = [
  { lat: 23.740, lng: 90.388 },
  { lat: 23.740, lng: 90.398 },
  { lat: 23.728, lng: 90.398 },
  { lat: 23.728, lng: 90.388 },
];
