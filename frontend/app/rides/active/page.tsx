'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { ridesApi } from '@/src/api/ridesApi';
import { MapPin, ArrowRight, Phone, MessageSquare, ShieldCheck, Car, AlertTriangle, Star, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { sosApi } from '@/src/api/sosApi';
import { ratingsApi } from '@/src/api/ratingsApi';

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
  const [isSosActive, setIsSosActive] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ratingVal, setRatingVal] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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
        
        if (data.status === 'completed' && !showRating) {
          setShowRating(true);
        }
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

  const handleSos = async () => {
    try {
      const token = await getToken();
      if (!token || !rideId) return;
      await sosApi.triggerAlert(token, {
        rideId,
        lat: ride?.pickup_lat || 0,
        lng: ride?.pickup_lng || 0
      });
      setIsSosActive(true);
      alert('SOS Alert activated! Emergency contacts notified.');
    } catch (err) {
      console.error(err);
      alert('Failed to trigger SOS');
    }
  };

  const submitReview = async () => {
    try {
      if (ratingVal === 0) return alert('Please select a rating');
      const token = await getToken();
      if (!token || !rideId) return;
      await ratingsApi.submitRating(token, rideId, {
        rating: ratingVal,
        comment: ratingComment
      });
      setIsSubmitted(true);
      setTimeout(() => {
        router.push('/rides/history');
      }, 2500);
    } catch (err) {
      alert('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans'>
        <div className='w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4' />
        <p className='text-lg font-black uppercase tracking-widest text-gray-400'>Tracking Ride...</p>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className='min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans'>
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
    <div className='min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row font-sans'>
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
          <div className='flex gap-2 mb-3'>
            <button className='flex-1 bg-white border border-gray-200 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition-colors text-black'>
              <Phone size={18} /> Call
            </button>
            <button className='flex-1 bg-white border border-gray-200 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition-colors text-black'>
              <MessageSquare size={18} /> Chat
            </button>
          </div>
          <button 
            onClick={handleSos}
            disabled={isSosActive}
            className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-black transition-colors shadow-sm ${isSosActive ? 'bg-red-600 text-white shadow-red-200' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'}`}
          >
            <AlertTriangle size={18} /> {isSosActive ? 'SOS SIGNAL ACTIVE' : 'SOS EMERGENCY'}
          </button>
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

      {showRating && (
        <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 font-sans'>
          <div className='bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200'>
            {isSubmitted ? (
               <div className='flex flex-col items-center py-6 animate-in fade-in zoom-in duration-300'>
                 <div className='w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6'>
                   <CheckCircle size={40} className='stroke-[3]' />
                 </div>
                 <h2 className='text-3xl font-black mb-2 text-center text-gray-800'>Thank You!</h2>
                 <p className='text-gray-500 font-bold mb-2 text-center'>Your rating has been submitted.</p>
                 <p className='text-sm text-gray-400 text-center animate-pulse mt-4'>Redirecting to history...</p>
               </div>
            ) : (
               <>
                 <div className='w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6'>
                   <Star size={32} className='fill-current' />
                 </div>
                 <h2 className='text-3xl font-black mb-2 text-center'>Ride Completed</h2>
                 <p className='text-gray-500 font-bold mb-8 text-center'>How was your trip with {ride.driver?.name || 'your driver'}?</p>

                 <div className='flex gap-2 mb-8'>
                   {[1, 2, 3, 4, 5].map((star) => (
                     <button
                       key={star}
                       onClick={() => setRatingVal(star)}
                       className='p-2 hover:scale-110 transition-transform active:scale-95'
                     >
                       <Star
                         size={40}
                         className={`${ratingVal >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'} transition-colors`}
                       />
                     </button>
                   ))}
                 </div>

                 <textarea
                   placeholder='Leave a compliment or comment (optional)'
                   value={ratingComment}
                   onChange={(e) => setRatingComment(e.target.value)}
                   className='w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-medium text-gray-700 outline-none focus:border-black transition-colors mb-6 resize-none'
                   rows={3}
                 />

                 <button
                   onClick={submitReview}
                   className='w-full bg-black hover:bg-gray-900 active:scale-[0.98] transition-all text-white py-4 rounded-2xl font-black text-lg'
                 >
                   Submit Rating
                 </button>
               </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActiveRidePage() {
  return (
    <Suspense fallback={<div className='p-20 text-center font-black font-sans'>Loading components...</div>}>
      <ActiveRideContent />
    </Suspense>
  );
}
