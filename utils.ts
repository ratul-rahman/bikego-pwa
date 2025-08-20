import type { Bike, BikeWithDistance } from './types';

// Haversine distance formula
export const getDistance = (
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// Average walking speed: 5 km/h
const WALKING_SPEED_KMPH = 5;

export const sortBikesByDistance = (
  bikes: Bike[],
  userLocation: { lat: number; lng: number }
): BikeWithDistance[] => {
  if (!userLocation) return [];

  return bikes
    .map((bike) => {
      const distance = getDistance(userLocation, bike.location);
      const walkTime = (distance / WALKING_SPEED_KMPH) * 60; // in minutes
      return { ...bike, distance, walkTime };
    })
    .sort((a, b) => a.distance - b.distance);
};
