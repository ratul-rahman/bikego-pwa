import React from 'react';
import { GoogleMap, Marker, Polygon, DirectionsRenderer } from '@react-google-maps/api';
import type { Bike, LatLng } from '../types';
import { BIKES, MAP_CENTER, GEOFENCE_PATH } from '../constants';

interface MapProps {
  onSelectBike: (bike: Bike) => void;
  userLocation: LatLng | null;
  selectedBike: Bike | null;
  directions: google.maps.DirectionsResult | null;
  bikingDirections: google.maps.DirectionsResult | null;
  theme: 'light' | 'dark';
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const lightMapStyle = [ // Custom map style for a cleaner look
    {
      "featureType": "poi",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "transit",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "landscape",
      "stylers": [{ "color": "#f1f5f9" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#cbd5e1" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [{ "color": "#e2e8f0" }]
    },
    {
      "featureType": "water",
      "stylers": [{ "color": "#bae6fd" }]
    },
];

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

const mapOptions = (theme: 'light' | 'dark') => ({
  disableDefaultUI: true,
  zoomControl: true,
  styles: theme === 'light' ? lightMapStyle : darkMapStyle,
});

const geofenceOptions = {
    fillColor: "#00B894",
    fillOpacity: 0.1,
    strokeColor: "#00B894",
    strokeOpacity: 0.8,
    strokeWeight: 2,
};

const Map: React.FC<MapProps> = ({ onSelectBike, userLocation, selectedBike, directions, bikingDirections, theme }) => {
  const mapRef = React.useRef<google.maps.Map | null>(null);

  const onMapLoad = React.useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  React.useEffect(() => {
    if (mapRef.current && userLocation && !selectedBike) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
    }
  }, [userLocation, selectedBike]);
  
  React.useEffect(() => {
      const currentDirections = directions || bikingDirections;
      if (mapRef.current && currentDirections?.routes[0]?.bounds) {
          mapRef.current.fitBounds(currentDirections.routes[0].bounds, 80); // 80px padding
      }
  }, [directions, bikingDirections]);

  if (typeof window === 'undefined' || !window.google) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-200 p-4 text-center">
        <p className="text-gray-600">Loading Map... If it doesn't load, please ensure you have replaced 'YOUR_GOOGLE_MAPS_API_KEY_HERE' in index.html with a valid key.</p>
      </div>
    );
  }

  const bikeMarkerWithLabel = (bike: Bike) => {
    const scale = selectedBike?.id === bike.id ? 1.2 : 1;
    // Using a simpler, theme-independent marker for better visibility in both modes.
    const bgColor = selectedBike?.id === bike.id ? '#00B894' : '#1E293B';
    const textColor = 'white';

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 48C21.6347 47.4175 23.2292 46.7215 24.7653 45.92C29.9296 43.2022 34.4436 39.0988 37.6105 34.1443C40.7774 29.1898 40.7774 23.6102 37.6105 18.6557C34.4436 13.7012 29.9296 9.59778 24.7653 6.87998C23.2292 6.07848 21.6347 5.38252 20 4.8C18.3653 5.38252 16.7708 6.07848 15.2347 6.87998C10.0704 9.59778 5.55644 13.7012 2.38951 18.6557C-0.777372 23.6102 -0.777372 29.1898 2.38951 34.1443C5.55644 39.0988 10.0704 43.2022 15.2347 45.92C16.7708 46.7215 18.3653 47.4175 20 48Z" fill="${bgColor}"/>
          <circle cx="20" cy="20" r="16" fill="white"/>
          <circle cx="20" cy="20" r="14" fill="${bike.battery > 70 ? '#00B894' : bike.battery > 30 ? '#FBBF24' : '#EF4444'}"/>
          <text x="20" y="25" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="${textColor}" text-anchor="middle">${bike.battery}%</text>
        </svg>`
      )}`,
      scaledSize: new window.google.maps.Size(30 * scale, 36 * scale),
      anchor: new window.google.maps.Point(15 * scale, 36 * scale),
    };
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={userLocation || MAP_CENTER}
      zoom={15}
      options={mapOptions(theme)}
      onLoad={onMapLoad}
    >
      <Polygon
        paths={GEOFENCE_PATH}
        options={geofenceOptions}
      />

      {BIKES.map((bike) => (
        <Marker
          key={bike.id}
          position={bike.location}
          onClick={() => onSelectBike(bike)}
          icon={bikeMarkerWithLabel(bike)}
          title={`Bike ${bike.id} - ${bike.battery}%`}
          zIndex={selectedBike?.id === bike.id ? 10 : 1}
        />
      ))}

      {userLocation && (
          <Marker
              position={userLocation}
              title="Your Location"
              icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#4285F4",
                  fillOpacity: 1,
                  strokeColor: "white",
                  strokeWeight: 2,
              }}
          />
      )}
      
      {directions && (
          <DirectionsRenderer
              directions={directions}
              options={{
                  suppressMarkers: true,
                  polylineOptions: {
                      strokeColor: theme === 'light' ? '#1E293B' : '#A78BFA',
                      strokeWeight: 6,
                      strokeOpacity: 0.8,
                  }
              }}
          />
      )}

      {bikingDirections && (
          <DirectionsRenderer
              directions={bikingDirections}
              options={{
                  suppressMarkers: true,
                  polylineOptions: {
                      strokeColor: '#00B894',
                      strokeWeight: 6,
                      strokeOpacity: 0.9,
                  }
              }}
          />
      )}
    </GoogleMap>
  );
};

export default React.memo(Map);