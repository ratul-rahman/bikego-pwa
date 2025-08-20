// Minimal type definitions for Google Maps to satisfy TypeScript
declare global {
  namespace google {
    namespace maps {
      type LatLngLiteral = { lat: number; lng: number };

      class LatLngBounds {}

      class Map {
        constructor(el: HTMLElement, opts?: any);
        panTo: (latLng: LatLngLiteral) => void;
        setZoom: (zoom: number) => void;
        fitBounds: (bounds: LatLngBounds, padding?: number) => void;
      }

      interface DirectionsRoute {
        bounds: LatLngBounds;
      }

      interface DirectionsResult {
        routes: DirectionsRoute[];
      }

      class DirectionsService {
        route: (
          request: DirectionsRequest,
          callback: (result: DirectionsResult | null, status: DirectionsStatus) => void
        ) => void;
      }

      interface DirectionsRequest {
        origin: any;
        destination: any;
        travelMode: TravelMode;
      }

      enum TravelMode {
        WALKING = 'WALKING',
        BICYCLING = 'BICYCLING',
      }

      enum DirectionsStatus {
        OK = 'OK',
      }

      class Size {
        constructor(width: number, height: number);
      }

      enum SymbolPath {
        CIRCLE,
      }

      namespace places {
          class Autocomplete {
              constructor(inputElement: HTMLInputElement, opts?: any);
              getPlace: () => PlaceResult;
              addListener: (eventName: string, handler: () => void) => void;
          }

          interface PlaceResult {
              geometry?: {
                  location: {
                      lat: () => number;
                      lng: () => number;
                  }
              };
              formatted_address?: string;
          }
      }
    }
  }

  interface Window {
    google: any;
  }
}


export interface Bike {
  id: number;
  location: { lat: number; lng: number }; // Use latitude and longitude
  battery: number;
  model: string;
  rate: number; // BDT per minute
  range: number; // in km
}

export interface BikeWithDistance extends Bike {
  distance: number; // in km
  walkTime: number; // in minutes
}

export type AppState = 'loggedOut' | 'loggedIn' | 'bikeSelected' | 'scanning' | 'inRide' | 'inRidePaused' | 'rideEnded';
export type ModalContent = 'rideHistory' | 'payments' | 'promotions' | 'help' | 'settings' | 'profile' | 'stats' | null;

export interface RideDetails {
  startTime: number;
  duration: number; // in seconds
  cost: number;
  distance: number; // in km
  isPaused: boolean;
  bikeModel: string;
}

export interface PastRide extends RideDetails {
    id: string;
    date: string;
}

export interface LatLng {
    lat: number;
    lng: number;
}