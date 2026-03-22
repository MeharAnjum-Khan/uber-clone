'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ridesApi } from '@/src/api/ridesApi';
import { ArrowLeft, Car, Clock, MapPin, RefreshCcw, Navigation2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

type RideHistoryItem = {
  id: string;
  status?: string;
  ride_type?: string;
  pickup_address?: string | null;
  drop_address?: string | null;
  requested_at?: string | null;
  completed_at?: string | null;
  estimated_fare?: number | null;
};

export default function RideHistoryPage() {
  const { getToken } = useAuth();
  const [rides, setRides] = useState<RideHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const res = await ridesApi.getHistory(token);
      if (Array.isArray(res)) setRides(res);
      else setRides([]);
    } catch (err: any) {
      console.warn('Ride history error', err);
      setError('Failed to load ride history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const formatDateTime = (value?: string | null) => {
    if (!value) return '';
    try {
      const date = new Date(value);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch { return value; }
  };

  const getStatusColor = (status?: string) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
      case 'cancelled': return 'bg-red-50 text-red-700 ring-1 ring-red-600/20';
      case 'active': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
      default: return 'bg-gray-50 text-gray-600 ring-1 ring-gray-600/20';
    }
  };

  const cleanAddress = (addr?: string | null) => {
    if (!addr) return 'Nagpur Location';
    return addr.split(',').slice(0, 2).join(',').trim();
  };

  return (
    <div className='min-h-screen bg-[#F9FAFB] flex flex-col items-center px-4 py-8 md:py-12 text-black'>
      <div className='w-full max-w-5xl'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <Link href='/dashboard' className='p-2 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow'>
                <ArrowLeft size={18} />
              </Link>
              <h1 className='text-3xl font-bold tracking-tight'>Your Trips</h1>
            </div>
            <p className='text-gray-500 font-medium ml-11'>Recent rides in Nagpur</p>
          </div>
          <button onClick={loadHistory} className='flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-bold text-white hover:bg-gray-900 transition-all'>
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className='mt-20 flex flex-col items-center gap-4 py-12'>
            <div className='w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin' />
            <p className='font-bold text-gray-400 uppercase tracking-widest text-xs'>Loading rides...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className='mt-20 flex flex-col items-center text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm'>
            <Car size={32} className='text-gray-200 mb-6' />
            <h2 className='text-2xl font-bold mb-2'>No trips found</h2>
            <Link href='/rides/request' className='inline-flex rounded-2xl bg-black px-8 py-4 text-base font-bold text-white hover:bg-gray-900 shadow-xl mt-8'>
              Request first ride
            </Link>
          </div>
        ) : (
          <div className='grid gap-4'>
            {rides.map((ride) => (
              <div key={ride.id} className='group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center gap-6'>
                <div className='w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-colors'>
                  <Car size={28} />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-3'>
                    <span className={'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ' + getStatusColor(ride.status)}>
                      {ride.status || 'Unknown'}
                    </span>
                    <span className='text-gray-300'>•</span>
                    <span className='text-xs font-bold text-gray-400 uppercase tracking-tighter'>{formatDateTime(ride.requested_at)}</span>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm font-bold text-black truncate'>
                      <div className='w-1.5 h-1.5 rounded-full bg-green-500 shrink-0' />
                      {cleanAddress(ride.pickup_address)}
                    </div>
                    <div className='flex items-center gap-2 text-sm font-bold text-black truncate'>
                      <div className='w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0' />
                      {cleanAddress(ride.drop_address)}
                    </div>
                  </div>
                </div>
                <div className='flex flex-col items-end gap-1'>
                  <p className='text-2xl font-bold'>₹{(ride.estimated_fare ?? 0).toFixed(0)}</p>
                  <p className='text-[10px] font-bold uppercase text-gray-400 tracking-widest'>{ride.ride_type || 'GoRide'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
