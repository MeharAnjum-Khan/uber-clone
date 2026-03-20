'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { ridesApi } from '@/src/api/ridesApi';
import { MapPin, ArrowRight, Phone, MessageSquare, ShieldCheck, Car } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/src/components/MapView'), {
  ssr: false,
  loading: () => <div className='h-full w-full bg-gray-50 flex items-center justify-center text-gray-400'>Loading Nagpur Map...</div>
});

function ActiveRideContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getToken } = useAuth();
  
  const rideId = searchParams.get('rideId');
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cleanAddress = (addr?: string | null) => {
    if (!addr) return 'Nagpur Location';
    if (addr.includes('(')) return addr;
    return addr.split(',').slice(0, 2).join(',').trim();
  };

  useEffect(() => {
    if (!rideId) return;

    const fetchRide = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        const data = await ridesApi.getRideDetails(token, rideId);
        setRide(data);
      } catch (err) {
        console.error('Active ride error', err);
        setError('Failed to fetch ride status.');
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
    const interval = setInterval(fetchRide, 10000);
    return () => clearInterval(interval);
  }, [rideId, getToken]);

  if (loading) {
    return (
      <div className='min-h-screen bg-white flex flex-col items-center justify-center p-6'>
        <div className='w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4' />
        <p className='text-lg font-black uppercase tracking-widest text-gray-400'>Tracking Ride...</p>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className='min-h-screen bg-white flex flex-col items-center justify-center p-6'>
        <div className='w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6'>
          <ShieldCheck size={40} />
        </div>
        <h1 className='text-2xl font-black mb-2'>Ride Not Found</h1>
        <p className='text-gray-500 font-medium mb-8 text-center max-w-xs'>{error || 'We couldn\'t find details for this ride request.'}</p>
        <button onClick={() => router.push('/dashboard')} className='bg-black text-white px-8 py-4 rounded-2xl font-black shadow-xl'>Go Home</button>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row'>
      <div className='w-full md:w-[450px] bg-white shadow-2xl z-10 p-6 md:p-8 flex flex-col'>
        <div className='mb-8'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
            <h1 className='text-2xl font-black uppercase tracking-tight'>Ride In Progress</h1>
          </div>
          <p className='text-gray-400 font-bold text-xs uppercase tracking-widest text-black'>ID: {rideId?.slice(-8)}</p>
        </div>

        <div className='space-y-6 mb-10'>
          <div className='flex items-start gap-4'>
            <div className='w-10 h-10 rounded-full bg-gray-50 text-black flex items-center justify-center shrink-0 border border-gray-100'>
              <MapPin size={20} />
            </div>
            <div>
              <p className='text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1'>Pickup</p>
              <p className='font-bold text-black leading-tight'>{cleanAddress(ride.pickup_address)}</p>
            </div>
          </div>
          <div className='flex items-start gap-4'>
            <div className='w-10 h-10 rounded-full bg-gray-50 text-blue-600 flex items-center justify-center shrink-0 border border-gray-100'>
              <ArrowRight size={20} />
            </div>
            <div>
              <p className='text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1'>Destination</p>
              <p className='font-bold text-black leading-tight'>{cleanAddress(ride.drop_address)}</p>
            </div>
          </div>
        </div>

        <div className='bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100'>
          <div className='flex items-center justify-between mb-4'>
            <div className='text-black'>
              <h3 className='text-lg font-black'>Driver Details</h3>
              <p className='text-sm font-bold text-gray-500'>Assigned from Nagpur Hub</p>
            </div>
            <div className='w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center text-white'>
              <Car size={28} />
            </div>
          </div>
          <div className='flex gap-3'>
            <button className='flex-1 bg-white border border-gray-200 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition-colors text-black'>
              <Phone size={18} /> Call
            </button>
            <button className='flex-1 bg-white border border-gray-200 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition-colors text-black'>
              <MessageSquare size={18} /> Chat
            </button>
          </div>
        </div>

        <button 
          onClick={() => router.push('/dashboard')}
          className='mt-auto w-full py-4 text-center font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest text-xs'
        >
          Cancel Ride Request
        </button>
      </div>

      <div className='flex-1 relative h-[400px] md:h-screen'>
         <MapView 
            pickup={[ride.pickup_lat || 21.1458, ride.pickup_lng || 79.0882]}
            drop={[ride.drop_lat || 21.1458, ride.drop_lng || 79.0882]}
            selectingMode={null}
            onPickupChange={() => {}}
            onDropChange={() => {}}
         />
      </div>
    </div>
  );
}

export default function ActiveRidePage() {
  return (
    <Suspense fallback={<div className='p-20 text-center font-black'>Loading components...</div>}>
      <ActiveRideContent />
    </Suspense>
  );
}
