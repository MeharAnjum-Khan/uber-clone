'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { ridesApi } from '@/src/api/ridesApi';
import { MapPin, LocateFixed, ArrowRight, Loader2, Map as MapIcon, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/src/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400 font-medium">Loading Nagpur Map...</div>
});

export default function RequestRidePage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropCoords, setDropCoords] = useState<[number, number] | null>(null);
  const [selectingMode, setSelectingMode] = useState<'pickup' | 'drop' | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  type RideEstimateOption = {
    type?: string;
    price?: number;
    eta?: number;
    distance?: number;
  };

  const [estimated, setEstimated] = useState<RideEstimateOption[] | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddress = async (lat: number, lng: number, type: 'pickup' | 'drop') => {
    try {
      setGeocoding(true);
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'UberCloneNagpur/1.0'
        }
      });
      
      const data = await res.json();

      if (data && data.address) {
        const addr = data.address;
        const neighborhood = addr.suburb || addr.neighbourhood || addr.residential || addr.commercial || addr.subdistrict;
        const road = addr.road || addr.pedestrian || addr.path;
        const city = addr.city || addr.town || addr.village || 'Nagpur';
        
        let displayStr = '';
        if (neighborhood && road) {
          displayStr = `${neighborhood}, ${road}`;
        } else if (neighborhood) {
          displayStr = `${neighborhood}, ${city}`;
        } else if (road) {
          displayStr = `${road}, ${city}`;
        } else {
          displayStr = data.display_name?.split(',').slice(0, 2).join(',') || 'Nagpur Location';
        }

        if (type === 'pickup') setPickupAddress(displayStr);
        else setDropAddress(displayStr);
      } else {
        throw new Error('No address found');
      }
    } catch (err) {
      console.error('Geocoding failed', err);
      const fallback = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      if (type === 'pickup') setPickupAddress(fallback);
      else setDropAddress(fallback);
    } finally {
      setGeocoding(false);
    }
  };

  const handleEstimate = async () => {
    try {
      if (!pickupCoords || !dropCoords) {
        setError('Please select pickup and dropoff locations on the map.');
        return;
      }
      setError(null);
      setLoadingEstimate(true);
      setEstimated(null);
      setSelectedType(null);
      const token = await getToken();
      if (!token) throw new Error('You must be logged in to request a ride.');
      const coordinates = {
        pickupLat: pickupCoords[0],
        pickupLng: pickupCoords[1],
        dropLat: dropCoords[0],
        dropLng: dropCoords[1],
      };
      const result = await ridesApi.getEstimate(token, coordinates);
      setEstimated(Array.isArray(result) ? result : []);
    } catch (err: unknown) {
      console.error('Estimate error', err);
      setError('Failed to fetch estimate. Please try again.');
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleRequestRide = async () => {
    if (!selectedType || !pickupCoords || !dropCoords) return;
    try {
      setError(null);
      setRequesting(true);
      const token = await getToken();
      if (!token) throw new Error('You must be logged in to request a ride.');
      const rideData = {
        pickup: {
          lat: pickupCoords[0],
          lng: pickupCoords[1],
          address: pickupAddress || 'Nagpur Pickup',
        },
        drop: {
          lat: dropCoords[0],
          lng: dropCoords[1],
          address: dropAddress || 'Nagpur Dropoff',
        },
        rideType: selectedType,
      };
      const res = await ridesApi.requestRide(token, rideData);
      if (res && res.rideId) {
        router.push(`/rides/active?rideId=${encodeURIComponent(res.rideId)}`);
      } else {
        setError('Ride request created but response was unexpected.');
      }
    } catch (err: unknown) {
      console.error('Request ride error', err);
      setError('Failed to request ride. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  const handleMapPickupChange = (lat: number, lng: number) => {
    setPickupCoords([lat, lng]);
    fetchAddress(lat, lng, 'pickup');
  };

  const handleMapDropChange = (lat: number, lng: number) => {
    setDropCoords([lat, lng]);
    fetchAddress(lat, lng, 'drop');
  };

  const useCurrentLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPickupCoords([lat, lng]);
        fetchAddress(lat, lng, 'pickup');
      }, (err) => {
        console.error('Geolocation error', err);
        setError('Could not get your current location.');
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center px-4 py-8 md:py-12 text-black">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
        
        <div className="w-full md:w-[420px] bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Where to?</h1>
            <p className="text-gray-500 text-sm font-medium">Set your pickup and destination in Nagpur.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium flex items-center gap-2">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div 
              className={`group flex items-center gap-3 rounded-2xl border-2 px-4 py-4 transition-all cursor-pointer ${selectingMode === 'pickup' ? 'border-black bg-white shadow-sm' : 'border-gray-50 bg-gray-50 hover:bg-gray-100/80'}`}
              onClick={() => setSelectingMode('pickup')}
            >
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                {geocoding && selectingMode === 'pickup' ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-extrabold mb-0.5">Pickup Location</p>
                <div className="text-sm md:text-base font-bold text-black truncate">
                  {pickupAddress || (geocoding && selectingMode === 'pickup' ? 'Locating...' : 'Set on map')}
                </div>
              </div>
              {pickupCoords && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setPickupCoords(null); setPickupAddress(''); }} 
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div 
              className={`group flex items-center gap-3 rounded-2xl border-2 px-4 py-4 transition-all cursor-pointer ${selectingMode === 'drop' ? 'border-black bg-white shadow-sm' : 'border-gray-50 bg-gray-50 hover:bg-gray-100/80'}`}
              onClick={() => setSelectingMode('drop')}
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                {geocoding && selectingMode === 'drop' ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-extrabold mb-0.5">Destination</p>
                <div className="text-sm md:text-base font-bold text-black truncate">
                  {dropAddress || (geocoding && selectingMode === 'drop' ? 'Locating...' : 'Where to?')}
                </div>
              </div>
              {dropCoords && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setDropCoords(null); setDropAddress(''); }} 
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <button
              type="button"
              onClick={useCurrentLocation}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white border border-gray-200 px-4 py-3.5 text-sm font-bold text-gray-700 hover:border-black hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              <LocateFixed size={18} />
              Use My Current Location
            </button>
          </div>

          {!estimated ? (
            <button
              type="button"
              onClick={handleEstimate}
              disabled={loadingEstimate || !pickupCoords || !dropCoords || geocoding}
              className="w-full rounded-2xl bg-black py-4.5 text-lg font-bold text-white hover:bg-gray-900 disabled:opacity-40 transition-all shadow-lg active:scale-[0.98]"
            >
              {loadingEstimate ? 'Calculating...' : 'Find Rides'}
            </button>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available Rides</h2>
                <button onClick={() => setEstimated(null)} className="text-xs font-bold text-blue-600 hover:underline">Reset Map</button>
              </div>
              
              <div className="space-y-3 overflow-y-auto pr-2 -mx-2 px-2 pb-4">
                {estimated.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setSelectedType(option.type ?? null)}
                    className={`w-full flex items-center justify-between rounded-2xl border-2 px-4 py-4 text-left transition-all ${selectedType === option.type ? 'border-black bg-black text-white shadow-xl scale-[1.02]' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedType === option.type ? 'bg-white/10' : 'bg-gray-100'}`}>
                        <MapIcon size={24} className={selectedType === option.type ? 'text-white' : 'text-black'} />
                      </div>
                      <div>
                        <p className="font-bold text-base leading-tight">{option.type || 'GoRide'}</p>
                        <p className={`text-xs font-bold ${selectedType === option.type ? 'text-white/60' : 'text-gray-500'}`}>
                          {option.eta} min away
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-bold">₹{(option.price ?? 0).toFixed(0)}</p>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRequestRide}
                disabled={!selectedType || requesting}
                className="mt-auto w-full rounded-2xl bg-black py-4.5 text-lg font-bold text-white hover:bg-gray-900 disabled:opacity-50 transition-all shadow-xl active:scale-[0.98]"
              >
                {requesting ? 'Confirming...' : `Confirm ${selectedType || 'Ride'}`}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 h-[500px] md:h-auto bg-white rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden relative min-h-[550px]">
          <MapView 
            pickup={pickupCoords}
            drop={dropCoords}
            selectingMode={selectingMode}
            onPickupChange={handleMapPickupChange}
            onDropChange={handleMapDropChange}
          />
          
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
            {!selectingMode ? (
              <div className="bg-white px-4 py-2.5 rounded-2xl shadow-2xl border border-gray-100 pointer-events-auto flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-800 uppercase tracking-tighter">Live Nagpur Map</span>
              </div>
            ) : (
              <div className="bg-black text-white px-6 py-3 rounded-full shadow-2xl pointer-events-auto flex items-center gap-3 animate-bounce mx-auto">
                <MapPin size={18} className="text-red-500" />
                <span className="text-sm font-bold uppercase tracking-widest">Tap on map to set {selectingMode}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
