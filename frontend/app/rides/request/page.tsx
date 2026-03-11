'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Search, 
  MapPin, 
  Clock, 
  Car, 
  CreditCard, 
  ArrowRight, 
  ChevronRight,
  Shield,
  Star,
  Zap,
  Navigation
} from 'lucide-react';
import Sidebar from '@/src/components/Sidebar';
import Navbar from '@/src/components/Navbar';
import MapView from '@/src/components/MapView';
import { ridesApi } from '@/src/api/ridesApi';
import Loader from '@/src/components/Loader';
import ErrorMessage from '@/src/components/ErrorMessage';
import { useRouter } from 'next/navigation';

export default function RideRequestPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [step, setStep] = useState(1); // 1: Pickup/Dest, 2: Vehicle Choice, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [rideDetails, setRideDetails] = useState({
    pickup: 'Current Location',
    destination: '',
    rideType: 'standard',
    fare: 0
  });

  const [availableVehicles] = useState([
    { id: 'standard', name: 'Uber Go', price: 12.50, time: '3 min', icon: Car, desc: 'Everyday affordable rides' },
    { id: 'premium', name: 'Uber Black', price: 28.90, time: '5 min', icon: Car, desc: 'Luxury rides with elite drivers' },
    { id: 'pool', name: 'Uber Pool', price: 8.25, time: '7 min', icon: Car, desc: 'Share your ride and save' },
    { id: 'xl', name: 'Uber XL', price: 18.75, time: '4 min', icon: Car, desc: 'Large groups and extra luggage' },
  ]);

  const handleNextStep = () => {
    if (step === 1 && !rideDetails.destination) {
      setError('Please enter a destination.');
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const calculateFare = (typeId: string) => {
    const base = availableVehicles.find(v => v.id === typeId)?.price || 0;
    setRideDetails({ ...rideDetails, rideType: typeId, fare: base });
  };

  const handleRequestRide = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get the clerk token
      const token = await (window as any).Clerk?.session?.getToken();
      
      const payload = {
        pickupLat: 40.7128,
        pickupLng: -74.0060,
        pickupAddress: rideDetails.pickup,
        destinationLat: 40.7306,
        destinationLng: -73.9352,
        destinationAddress: rideDetails.destination,
        rideType: rideDetails.rideType
      };

      const response = await ridesApi.requestRide(token, payload);
      
      if (response && response.rideId) {
        router.push(`/rides/${response.rideId}`);
      } else {
        throw new Error('Could not create ride request');
      }
    } catch (err) {
      console.error('Ride request error:', err);
      setError('System simulation: Connecting to backend drivers... (Backend simulated response failed)');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <Loader fullPage={true} />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={false} toggleSidebar={() => {}} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar toggleSidebar={() => {}} />
        
        <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Panel: Controls */}
          <div className="w-full lg:w-112.5 bg-white border-r border-gray-100 flex flex-col shadow-2xl z-10">
            
            {/* Step Progress */}
            <div className="p-8 border-b border-gray-50 bg-gray-50/50">
               <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black tracking-tight text-gray-900">
                    {step === 1 ? 'Find a Ride' : step === 2 ? 'Choose Vehicle' : 'Confirm Order'}
                  </h2>
                  <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Step {step} of 3</span>
               </div>
               <div className="flex gap-2">
                  <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
               </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              
              {error && <ErrorMessage message={error} onRetry={() => {}} />}

              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                     <label className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400">Pickup Location</label>
                     <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                        <input 
                           type="text" 
                           value={rideDetails.pickup}
                           readOnly
                           className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed outline-none"
                        />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400">Where to?</label>
                     <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black"></div>
                        <input 
                           type="text" 
                           placeholder="Search destination..."
                           value={rideDetails.destination}
                           onChange={(e) => setRideDetails({...rideDetails, destination: e.target.value})}
                           className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-100 group-hover:border-blue-100 focus:border-blue-600 rounded-2xl text-sm font-bold text-gray-900 transition-all outline-none"
                        />
                     </div>
                  </div>

                  <div className="pt-6 space-y-4">
                     <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400">Suggested Places</h4>
                     <div className="space-y-2">
                        <button onClick={() => setRideDetails({...rideDetails, destination: 'Central Park, NY'})} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition group border border-transparent hover:border-gray-100 text-left">
                           <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition"><MapPin className="w-5 h-5"/></div>
                           <div>
                              <p className="text-sm font-black text-gray-900">Central Park</p>
                              <p className="text-[0.65rem] text-gray-400 uppercase tracking-widest">New York, NY 10024</p>
                           </div>
                        </button>
                        <button onClick={() => setRideDetails({...rideDetails, destination: 'Times Square, Manhattan'})} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition group border border-transparent hover:border-gray-100 text-left">
                           <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition"><MapPin className="w-5 h-5"/></div>
                           <div>
                              <p className="text-sm font-black text-gray-900">Times Square</p>
                              <p className="text-[0.65rem] text-gray-400 uppercase tracking-widest">Manhattan, NY 10036</p>
                           </div>
                        </button>
                     </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4 mb-6">
                     <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white"><Zap className="w-5 h-5"/></div>
                     <p className="text-[0.7rem] font-bold text-blue-700 leading-snug">Prices are currently low in your area. Standard rates apply.</p>
                  </div>
                  {availableVehicles.map((v) => (
                    <button 
                      key={v.id}
                      onClick={() => calculateFare(v.id)}
                      className={`w-full flex items-center justify-between p-6 rounded-3xl transition-all border-2 ${rideDetails.rideType === v.id ? 'border-blue-600 bg-white shadow-xl shadow-blue-500/10' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}
                    >
                      <div className="flex items-center gap-6">
                         <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${rideDetails.rideType === v.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-100 text-gray-400'}`}>
                            <v.icon className="w-7 h-7" />
                         </div>
                         <div className="text-left">
                           <div className="flex items-center gap-2">
                              <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">{v.name}</h4>
                              <span className="text-[0.6rem] font-black uppercase tracking-widest text-blue-600">{v.time}</span>
                           </div>
                           <p className="text-[0.65rem] font-medium text-gray-400 uppercase tracking-widest mt-1">{v.desc}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className="text-xl font-black text-gray-900">${v.price.toFixed(2)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-8 rounded-4xl border border-gray-100 space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400">Route Summary</h4>
                      <div className="relative pl-6 space-y-8 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[2px] before:bg-blue-100">
                         <div className="relative">
                            <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
                            <p className="text-sm font-black text-gray-900">{rideDetails.pickup}</p>
                            <p className="text-[0.65rem] text-gray-400 uppercase tracking-widest">Your Current Position</p>
                         </div>
                         <div className="relative">
                            <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-black border-2 border-white shadow-sm"></div>
                            <p className="text-sm font-black text-gray-900">{rideDetails.destination}</p>
                            <p className="text-[0.65rem] text-gray-400 uppercase tracking-widest">Travel Destination</p>
                         </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-200">
                       <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-4">Payment & Safety</h4>
                       <div className="space-y-3">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-600">Visa •••• 4242</span>
                             </div>
                             <span className="text-[0.6rem] font-black uppercase tracking-widest text-blue-600">Change</span>
                          </div>
                          <div className="flex items-center gap-3">
                             <Shield className="w-4 h-4 text-green-500" />
                             <span className="text-xs font-bold text-gray-600">Trip insurance active</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white border-2 border-gray-100 rounded-3xl">
                     <div>
                        <span className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400">Total Fare</span>
                        <h3 className="text-3xl font-black text-gray-900">${rideDetails.fare.toFixed(2)}</h3>
                     </div>
                     <div className="text-right">
                        <span className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400">Estimated Duration</span>
                        <h3 className="text-lg font-black text-gray-900">~15-20 min</h3>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-8 border-t border-gray-50 space-y-4">
              {step < 3 ? (
                <button 
                  onClick={handleNextStep}
                  className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 group"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="flex gap-4">
                   <button 
                    onClick={() => setStep(2)}
                    className="flex-1 bg-white border-2 border-gray-100 text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all"
                   >
                     Back
                   </button>
                   <button 
                    disabled={loading}
                    onClick={handleRequestRide}
                    className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {loading ? 'Requesting...' : 'Request Uber'}
                   </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Map */}
          <div className="flex-1 relative bg-gray-100">
             <MapView pickup={{ lat: 40.7128, lng: -74.0060, address: rideDetails.pickup }} destination={{ lat: 40.7306, lng: -73.9352, address: rideDetails.destination }} drivers={[]} />
             <div className="absolute top-8 right-8 z-20 space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
                   <div className="h-10 w-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-900"><Navigation className="w-5 h-5"/></div>
                   <div>
                      <p className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400">Current View</p>
                      <p className="text-sm font-black text-gray-900">Lower Manhattan</p>
                   </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
                   <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                   <div>
                      <p className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400">Driver Status</p>
                      <p className="text-sm font-black text-gray-900">Connecting to Live Grid</p>
                   </div>
                </div>
             </div>
          </div>

        </main>
      </div>
    </div>
  );
}
