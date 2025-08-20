

import React from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { AppState, Bike, RideDetails, LatLng, BikeWithDistance, ModalContent, PastRide } from './types';
import * as api from './api';
import { sortBikesByDistance, getDistance } from './utils';
import Login from './components/Login';
import Map from './components/Map';
import Header from './components/Header';
import BikeCard from './components/BikeCard';
import QrScanner from './components/QrScanner';
import RideStatus from './components/RideStatus';
import RideSummary from './components/RideSummary';
import LocationPanel from './components/LocationPanel';
import SideMenu from './components/SideMenu';
import ProfileMenu from './components/ProfileMenu';
import Modal from './components/Modal';
import { ClockIcon, LeafIcon, RoadIcon, UserCircleIcon } from './components/icons';


const ToggleSwitch: React.FC<{ enabled: boolean, setEnabled: (enabled: boolean) => void }> = ({ enabled, setEnabled }) => (
    <button
        onClick={() => setEnabled(!enabled)}
        className={`${enabled ? 'bg-brand-green' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0`}
        role="switch"
        aria-checked={enabled}
    >
        <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
    </button>
);

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex items-center gap-4">
        <div className="bg-brand-green/20 text-brand-green p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-xl font-bold text-brand-dark dark:text-brand-light">{value}</p>
        </div>
    </div>
);


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('loggedOut');
  const [selectedBike, setSelectedBike] = useState<BikeWithDistance | null>(null);
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoadingBikes, setIsLoadingBikes] = useState(true);
  const [bikeError, setBikeError] = useState<string | null>(null);
  const [sortedBikes, setSortedBikes] = useState<BikeWithDistance[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<string | null>(null);
  const [bikingDirections, setBikingDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  // New states for advanced features
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>(null);
  const [pastRides, setPastRides] = useState<PastRide[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const handleThemeToggle = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  const fetchAndSetBikes = useCallback(async (location: LatLng) => {
    try {
        setBikeError(null);
        setIsLoadingBikes(true);
        const fetchedBikes = await api.fetchBikes(location);
        setBikes(fetchedBikes);
    } catch (error) {
        setBikeError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
        setIsLoadingBikes(false);
    }
  }, []);

  // Location and data fetching
  useEffect(() => {
    if (appState === 'loggedIn') {
      setIsLoadingLocation(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const location = { lat: latitude, lng: longitude };
            setUserLocation(location);
            fetchAndSetBikes(location);
            setIsLoadingLocation(false);
          },
          (error) => {
            console.error(`Error getting location (Code: ${error.code}): ${error.message}`);
            const fallbackLocation = { lat: 23.734, lng: 90.393 }; // Fallback to Dhaka University area
            setUserLocation(fallbackLocation); // Set map center to fallback
            fetchAndSetBikes(fallbackLocation);
            setIsLoadingLocation(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        setIsLoadingLocation(false);
      }
    }
  }, [appState, fetchAndSetBikes]);
  
  useEffect(() => {
    if (userLocation) {
        setSortedBikes(sortBikesByDistance(bikes, userLocation));
    }
  }, [bikes, userLocation])

  const handleGetWalkingDirections = useCallback((bike: Bike) => {
    if (!userLocation || typeof window === 'undefined' || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: userLocation,
        destination: bike.location,
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error fetching walking directions: ${status}`);
        }
      }
    );
  }, [userLocation]);
  
  const handleGetBikingDirections = useCallback((bike: Bike, dest: LatLng) => {
      if (typeof window === 'undefined' || !window.google) return;
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: bike.location,
          destination: dest,
          travelMode: window.google.maps.TravelMode.BICYCLING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setBikingDirections(result);
          } else {
            console.error(`Error fetching biking directions: ${status}`);
          }
        }
      );
  }, []);

  const handleSetDestination = useCallback((location: LatLng, address: string) => {
    setDestination(location);
    setDestinationAddress(address);
    if (selectedBike) {
        handleGetBikingDirections(selectedBike, location);
    }
  }, [selectedBike, handleGetBikingDirections]);
  
  const handleClearDestination = useCallback(() => {
      setDestination(null);
      setDestinationAddress(null);
      setBikingDirections(null);
  }, []);

  const handleLogin = useCallback(() => setAppState('loggedIn'), []);

  const handleSelectBike = useCallback((bike: Bike) => {
    const bikeWithInfo = sortedBikes.find(b => b.id === bike.id);
    if (bikeWithInfo) {
      setSelectedBike(bikeWithInfo);
      setAppState('bikeSelected');
      handleGetWalkingDirections(bike);
      setIsPanelExpanded(false); // Collapse panel
      if (destination) {
          handleGetBikingDirections(bike, destination);
      }
    }
  }, [sortedBikes, destination, handleGetWalkingDirections, handleGetBikingDirections]);

  const handleCloseBikeCard = useCallback(() => {
    setSelectedBike(null);
    setDirections(null);
    if(!destination) {
        setBikingDirections(null);
    }
    setAppState('loggedIn');
  }, [destination]);

  const handleUnlock = useCallback(() => setAppState('scanning'), []);
  
  const handleScanCancel = useCallback(() => setAppState('bikeSelected'), []);

  const handleScanSuccess = useCallback(async () => {
    if (selectedBike) {
      try {
        await api.startRide(selectedBike.id);
        setRideDetails({
            startTime: Date.now(),
            duration: 0,
            cost: 0,
            distance: 0,
            isPaused: false,
            bikeModel: selectedBike.model
        });
        setAppState('inRide');
      } catch (e) {
        console.error("Failed to start ride:", e);
        // Here you might show an error toast to the user
        setAppState('bikeSelected'); // Go back to bike card
      }
    }
  }, [selectedBike]);

  const handleEndRide = useCallback(async () => {
    if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
    }
    if (rideDetails) {
        try {
            await api.endRide(rideDetails);
            setAppState('rideEnded');
        } catch (e) {
            console.error("Failed to end ride:", e);
            // Even if API fails, we should probably let the user see the summary.
            // In a real app, you'd have retry logic.
            setAppState('rideEnded');
        }
    }
  }, [rideDetails]);
  
  const handleCloseSummary = useCallback(() => {
      if (rideDetails) {
          const newRide: PastRide = {
              ...rideDetails,
              id: rideDetails.startTime.toString(),
              date: new Date(rideDetails.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'}),
          };
          setPastRides(prev => [newRide, ...prev]);
      }
      setRideDetails(null);
      setSelectedBike(null);
      setDirections(null);
      setBikingDirections(null);
      handleClearDestination();
      setAppState('loggedIn');
  }, [rideDetails, handleClearDestination]);

  const handleLogout = useCallback(() => {
      setIsProfileMenuOpen(false);
      setAppState('loggedOut');
      // Reset all state
      setSelectedBike(null);
      setRideDetails(null);
      setUserLocation(null);
      setBikes([]);
      setSortedBikes([]);
      setDirections(null);
      setBikingDirections(null);
      setDestination(null);
      setDestinationAddress(null);
      setPastRides([]);
  }, []);

  // Ride simulation and auto-pause logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (appState === 'inRide' || appState === 'inRidePaused') {
      interval = setInterval(() => {
        setRideDetails(prevDetails => {
            if (!prevDetails || !selectedBike) return null;

            const newDuration = Math.floor((Date.now() - prevDetails.startTime) / 1000);
            
            const isMoving = (newDuration % 60) < 25; 
            const speed = isMoving ? 15 : 0; // 15 km/h when moving

            if (!isMoving && appState === 'inRide') {
                if (stopTimerRef.current === null) {
                    stopTimerRef.current = setTimeout(() => {
                        setAppState('inRidePaused');
                    }, 30000);
                }
            } else if (isMoving) {
                if (stopTimerRef.current) {
                    clearTimeout(stopTimerRef.current);
                    stopTimerRef.current = null;
                }
                if (appState === 'inRidePaused') {
                    setAppState('inRide');
                }
            }
            
            const PAUSE_RATE_PER_MINUTE = 0.5;
            const costIncrement = (appState === 'inRidePaused' ? PAUSE_RATE_PER_MINUTE : selectedBike.rate) / 60;
            const distanceIncrement = speed / 3600; // km per second

            return { 
                ...prevDetails, 
                duration: newDuration, 
                cost: prevDetails.cost + costIncrement, 
                distance: prevDetails.distance + distanceIncrement,
                isPaused: appState === 'inRidePaused'
            };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
    };
  }, [appState, selectedBike]);
  
  const recommendedBikes = useMemo(() => {
    if (!destination || !userLocation) return sortedBikes;
    return sortedBikes.filter(bike => {
        const bikeToDestinationDist = getDistance(bike.location, destination);
        const userToBikeDist = getDistance(userLocation, bike.location);
        return bike.range > (userToBikeDist + bikeToDestinationDist) * 1.2; // 20% buffer
    });
  }, [destination, sortedBikes, userLocation]);

  const handleMenuClick = useCallback(() => {
    setIsProfileMenuOpen(false);
    setIsSideMenuOpen(prev => !prev);
  }, [])

  const handleProfileClick = useCallback(() => {
    setIsSideMenuOpen(false);
    setIsProfileMenuOpen(prev => !prev);
  }, [])

  const handleModalNavigation = useCallback((content: ModalContent) => {
    setIsSideMenuOpen(false);
    setIsProfileMenuOpen(false);
    setModalContent(content);
  }, [])
  
  const formatTime = (totalSeconds: number) => {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}m ${seconds}s`;
  };

  const renderModalContent = () => {
    const totalDistance = pastRides.reduce((acc, ride) => acc + ride.distance, 0);
    // Assuming avg. car trip cost is 15 BDT/km and emits 0.12 kg CO2/km
    const moneySaved = totalDistance * 15;
    const co2Saved = totalDistance * 0.12;
    
    switch(modalContent) {
        case 'rideHistory':
            return (
                <div className="text-left min-h-[200px] max-h-96 overflow-y-auto pr-2">
                    {pastRides.length > 0 ? (
                        <ul className="space-y-3">
                            {pastRides.map(ride => (
                                <li key={ride.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <p className="font-bold text-brand-dark dark:text-brand-light">{ride.bikeModel}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{ride.date}</p>
                                    <div className="flex justify-between items-center mt-2 text-sm">
                                        <span>Cost: <span className="font-semibold">৳{ride.cost.toFixed(2)}</span></span>
                                        <span>Time: <span className="font-semibold">{formatTime(ride.duration)}</span></span>
                                        <span>Dist: <span className="font-semibold">{ride.distance.toFixed(2)} km</span></span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                           <ClockIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                           <h3 className="font-bold text-lg text-brand-dark dark:text-brand-light">No Ride History</h3>
                           <p>Your past rides will appear here.</p>
                        </div>
                    )}
                </div>
            );
        case 'payments':
             return (
                <div className="space-y-4 text-left">
                    <div>
                        <h3 className="font-semibold text-brand-dark dark:text-brand-light mb-2">Primary Method</h3>
                        <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#d82a77] rounded-md flex items-center justify-center text-white font-bold text-xl">b</div>
                                <div>
                                    <p className="font-bold text-brand-dark dark:text-brand-light">bKash</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">+880 1*** ***123</p>
                                </div>
                            </div>
                            <button className="text-sm text-brand-green font-semibold">Change</button>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-brand-dark dark:text-brand-light mb-2">Recent Transactions</h3>
                        <ul className="space-y-2">
                             {pastRides.length > 0 ? pastRides.slice(0, 3).map(ride => (
                                <li key={ride.id} className="flex justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <p className="text-sm text-gray-800 dark:text-gray-200">Ride Payment</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{ride.date}</p>
                                    </div>
                                    <span className="font-semibold text-brand-dark dark:text-brand-light">- ৳{ride.cost.toFixed(2)}</span>
                                </li>
                            )) : (
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-2">No recent transactions.</p>
                            )}
                        </ul>
                    </div>
                    <button className="w-full mt-4 bg-brand-green text-white font-bold py-3 rounded-lg hover:bg-green-500">Add Payment Method</button>
                </div>
            );
        case 'promotions':
            return (
                 <div className="space-y-4 text-left">
                    <div>
                        <h3 className="font-semibold text-brand-dark dark:text-brand-light mb-2">Enter Promo Code</h3>
                        <div className="flex gap-2">
                            <input type="text" placeholder="e.g., RIDE50" className="flex-grow p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-brand-green focus:outline-none text-brand-dark dark:text-brand-light" />
                            <button className="bg-brand-green text-white font-bold px-6 py-3 rounded-lg hover:bg-green-500 flex-shrink-0">Apply</button>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-brand-dark dark:text-brand-light mb-2">Available Offers</h3>
                        <ul className="space-y-2">
                            <li className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="font-bold text-brand-green">25% OFF on your next 3 rides</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Use code: NEWUSER25. Valid for 7 days.</p>
                            </li>
                            <li className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="font-bold text-brand-green">Ride for ৳10</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Valid on Friday rides between 10 AM - 4 PM.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            );
        case 'help':
            return (
                <div className="space-y-4 text-left">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="font-semibold text-brand-dark dark:text-brand-light">How do I start a ride?</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Find a bike on the map, tap on it, and then tap "Unlock Bike". Scan the QR code on the bike to start your ride.</p>
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="font-semibold text-brand-dark dark:text-brand-light">Where can I park the bike?</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">You must park the bike within the green geofenced area shown on the map. Parking outside this zone may incur a penalty.</p>
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="font-semibold text-brand-dark dark:text-brand-light">What if my bike has an issue?</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Please end your ride safely and report the issue through the "Help Center" in the app. You can also contact our support line.</p>
                    </div>
                </div>
            );
        case 'settings':
            return (
                <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div>
                            <p className="font-semibold text-brand-dark dark:text-brand-light">Push Notifications</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Receive ride and offer updates.</p>
                        </div>
                        <ToggleSwitch enabled={notificationsEnabled} setEnabled={setNotificationsEnabled} />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="font-semibold text-brand-dark dark:text-brand-light">Language</p>
                        <p className="text-gray-500 dark:text-gray-400">English</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="font-semibold text-brand-dark dark:text-brand-light">App Version</p>
                        <p className="text-gray-500 dark:text-gray-400">1.1.0</p>
                    </div>
                </div>
            );
        case 'profile':
            return (
                 <div className="flex flex-col items-center text-center">
                    <UserCircleIcon className="h-24 w-24 text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold text-brand-dark dark:text-brand-light">Samin Rahman</h3>
                    <p className="text-gray-500 dark:text-gray-400">+880 1712345678</p>
                </div>
            );
        case 'stats':
             return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard icon={<ClockIcon className="h-6 w-6" />} label="Total Rides" value={pastRides.length} />
                    <StatCard icon={<RoadIcon className="h-6 w-6" />} label="Total Distance" value={`${totalDistance.toFixed(1)} km`} />
                    <StatCard icon={<span className="font-bold text-xl">৳</span>} label="Money Saved" value={`৳${moneySaved.toFixed(0)}`} />
                    <StatCard icon={<LeafIcon className="h-6 w-6" />} label="CO2 Saved" value={`${co2Saved.toFixed(2)} kg`} />
                </div>
            );
        default:
            return null;
    }
  }


  return (
    <div className="relative h-full w-full max-w-md mx-auto bg-brand-light dark:bg-brand-dark overflow-hidden font-sans">
      {appState === 'loggedOut' && <Login onLogin={handleLogin} />}
      
      {(appState !== 'loggedOut') && (
        <>
            <Header 
                theme={theme} 
                onThemeToggle={handleThemeToggle} 
                onMenuClick={handleMenuClick}
                onProfileClick={handleProfileClick}
            />
             <ProfileMenu isOpen={isProfileMenuOpen} onNavigate={handleModalNavigation} onLogout={handleLogout} />
            <Map 
              onSelectBike={handleSelectBike}
              userLocation={userLocation}
              selectedBike={selectedBike}
              directions={directions}
              bikingDirections={bikingDirections}
              theme={theme}
            />
        </>
      )}
      <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} onNavigate={handleModalNavigation} />
      
      {appState === 'loggedIn' && isLoadingLocation && !selectedBike && (
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-brand-dark-secondary p-4 text-center z-30 shadow-lg">
            <p className="font-semibold animate-pulse text-brand-dark dark:text-brand-light">Finding your location...</p>
        </div>
      )}

      {appState === 'loggedIn' && !isLoadingLocation && userLocation && !selectedBike && (
          <LocationPanel 
            bikes={recommendedBikes} 
            onSelectBike={handleSelectBike}
            onSetDestination={handleSetDestination}
            onClearDestination={handleClearDestination}
            destinationAddress={destinationAddress}
            isExpanded={isPanelExpanded}
            setIsExpanded={setIsPanelExpanded}
            isLoading={isLoadingBikes}
            error={bikeError}
            onRetry={() => userLocation && fetchAndSetBikes(userLocation)}
          />
      )}

      {appState === 'bikeSelected' && selectedBike && (
          <BikeCard bike={selectedBike} onUnlock={handleUnlock} onClose={handleCloseBikeCard} />
      )}

      {appState === 'scanning' && <QrScanner onScanSuccess={handleScanSuccess} onCancel={handleScanCancel} />}

      {(appState === 'inRide' || appState === 'inRidePaused') && selectedBike && rideDetails && (
          <RideStatus bike={selectedBike} rideDetails={rideDetails} onEndRide={handleEndRide} />
      )}

      {appState === 'rideEnded' && rideDetails && (
          <RideSummary rideDetails={rideDetails} onClose={handleCloseSummary} />
      )}

      <Modal 
          isOpen={modalContent !== null}
          onClose={() => setModalContent(null)}
          title={modalContent === 'rideHistory' ? 'Ride History' : modalContent?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) || ''}
      >
          {renderModalContent()}
      </Modal>

    </div>
  );
};

export default App;