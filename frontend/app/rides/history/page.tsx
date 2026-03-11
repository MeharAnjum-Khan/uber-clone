'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  History, 
  MapPin, 
  Clock, 
  Car, 
  CreditCard, 
  ChevronRight,
  Search,
  Calendar,
  Filter,
  ArrowUpRight,
  Download,
  AlertCircle
} from 'lucide-react';
import Sidebar from '@/src/components/Sidebar';
import Navbar from '@/src/components/Navbar';
import { ridesApi } from '@/src/api/ridesApi';
import Loader from '@/src/components/Loader';
import ErrorMessage from '@/src/components/ErrorMessage';
import Link from 'next/link';

export default function RideHistoryPage() {
  const { user, isLoaded } = useUser();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isLoaded && user) {
      fetchHistory();
    }
  }, [isLoaded, user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = await (window as any).Clerk?.session?.getToken();
      const data = await ridesApi.getHistory(token);
      setRides(data);
    } catch (err) {
      console.error('History error:', err);
      setError('Unable to load ride history.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRides = rides.filter(ride => {
    if (filter === 'all') return true;
    return ride.status === filter;
  });

  if (!isLoaded || loading) return <Loader fullPage={true} />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={false} toggleSidebar={() => {}} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar toggleSidebar={() => {}} />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Header Area */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-10 border-b border-gray-100">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg text-blue-600 border border-blue-100 uppercase tracking-[0.2em] font-black text-[0.6rem]">
                     <History className="w-4 h-4" /> Activity Log
                  </div>
                  <h1 className="text-5xl font-black tracking-tighter text-gray-900 leading-none">Your Journeys</h1>
                  <p className="text-gray-400 font-medium text-lg leading-relaxed">Review and manage your past trip records and receipts.</p>
               </div>
               
               <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80 group">
                     <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                     <input 
                        type="text" 
                        placeholder="Search by destination..."
                        className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:border-blue-600 focus:bg-white transition-all outline-none shadow-sm"
                     />
                  </div>
                  <button className="h-14 w-14 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition shadow-sm">
                     <Filter className="w-6 h-6" />
                  </button>
               </div>
            </header>

            {/* Filter Tabs */}
            <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
               <FilterTab active={filter === 'all'} label="All Trips" count={rides.length} onClick={() => setFilter('all')} />
               <FilterTab active={filter === 'completed'} label="Completed" count={rides.filter(r => r.status === 'completed').length} onClick={() => setFilter('completed')} />
               <FilterTab active={filter === 'cancelled'} label="Cancelled" count={rides.filter(r => r.status === 'cancelled').length} onClick={() => setFilter('cancelled')} />
            </div>

            {error && <ErrorMessage message={error} onRetry={fetchHistory} />}

            {/* History List */}
            <div className="grid grid-cols-1 gap-6">
               {filteredRides.length > 0 ? (
                  filteredRides.map((ride) => (
                    <HistoryItem key={ride.id} ride={ride} />
                  ))
               ) : (
                  <div className="bg-white p-24 rounded-[3rem] border border-dashed border-gray-200 text-center space-y-8 flex flex-col items-center justify-center">
                     <div className="h-24 w-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300">
                        <History className="w-12 h-12" />
                     </div>
                     <div className="space-y-4 max-w-sm">
                        <h3 className="text-2xl font-black text-gray-900 leading-none">No history found</h3>
                        <p className="text-gray-400 font-medium">Your trip history is empty. Time to hit the road and book your first ride!</p>
                     </div>
                     <Link href="/rides/request" className="bg-black text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition shadow-xl">Start Booking</Link>
                  </div>
               )}
            </div>
            
            {/* Help Callout */}
            {rides.length > 0 && (
               <div className="bg-indigo-600 rounded-[2.5rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl shadow-indigo-500/20 group">
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
                     <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0"><AlertCircle className="w-6 h-6"/></div>
                     <h3 className="text-3xl font-black tracking-tight leading-none">Need help with a trip?</h3>
                     <p className="text-indigo-100 font-medium text-lg">Our support team is available 24/7 for lost items, safety concerns, or billing disputes on any of your journeys.</p>
                  </div>
                  <Link href="/profile" className="bg-white text-indigo-600 px-10 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition shadow-xl shrink-0 group/link relative z-10">
                     Contact Support
                  </Link>
               </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function FilterTab({ label, count, active, onClick }: any) {
   return (
      <button 
         onClick={onClick}
         className={`px-8 py-4 rounded-2xl font-black text-[0.65rem] uppercase tracking-widest transition-all shrink-0 border-2 ${active ? 'bg-black text-white border-black shadow-xl shadow-black/10' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
      >
         {label} <span className={`ml-2 px-2 py-0.5 rounded-md ${active ? 'bg-white/20' : 'bg-gray-100'}`}>{count}</span>
      </button>
   );
}

function HistoryItem({ ride }: any) {
   const statusStyles: any = {
      completed: 'bg-green-50 text-green-600 border-green-100',
      cancelled: 'bg-red-50 text-red-600 border-red-100',
      requested: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      accepted: 'bg-blue-50 text-blue-600 border-blue-100',
   };

   return (
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 hover:shadow-2xl hover:border-blue-100 transition-all group relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8">
            <Link href={`/rides/${ride.id}`} className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition transform group-hover:translate-x-1 group-hover:-translate-y-1">
               <ArrowUpRight className="w-6 h-6" />
            </Link>
         </div>

         <div className="flex flex-col lg:flex-row gap-12 lg:items-center">
            
            {/* Trip Visual and Basic Info */}
            <div className="flex items-start gap-8">
               <div className="h-24 w-24 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600 transition">
                  <Car className="w-12 h-12" />
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <span className={`px-3 py-1 rounded-lg border text-[0.6rem] font-black uppercase tracking-widest ${statusStyles[ride.status] || 'bg-gray-50'}`}>
                        {ride.status}
                     </span>
                     <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4"/>
                        <span className="text-[0.65rem] font-black uppercase tracking-widest">{new Date(ride.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                     </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{ride.destinationAddress?.split(',')[0]}</h3>
                  <div className="flex items-center gap-6">
                     <div className="text-right flex flex-col items-start">
                        <span className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400">Fare</span>
                        <span className="text-lg font-black text-gray-900">${ride.fare}</span>
                     </div>
                     <div className="w-px h-8 bg-gray-100"></div>
                     <div className="text-right flex flex-col items-start">
                        <span className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400">Time</span>
                        <span className="text-lg font-black text-gray-900">18 Min</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Trip Breakdown Summary */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 lg:border-l lg:border-gray-100 lg:pl-12">
               <div className="space-y-6">
                  <div className="flex items-start gap-4">
                     <div className="h-2 w-2 rounded-full bg-blue-600 mt-2"></div>
                     <div>
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-1">Pickup Point</p>
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{ride.pickupAddress || 'User Location'}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="h-2 w-2 rounded-full bg-black mt-2"></div>
                     <div>
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-1">Destination Point</p>
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{ride.destinationAddress}</p>
                     </div>
                  </div>
               </div>
               
               <div className="flex items-end justify-between md:flex-col md:items-end md:justify-center gap-4">
                  <button className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition group/receipt">
                     <Download className="w-4 h-4 group-hover/receipt:scale-110 transition"/>
                     <span className="text-[0.65rem] font-black uppercase tracking-widest">Receipt</span>
                  </button>
                  <div className="flex items-center gap-4">
                     <div className="text-right">
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-0.5">Payment</p>
                        <div className="flex items-center gap-2">
                           <CreditCard className="w-4 h-4 text-gray-400"/>
                           <span className="text-xs font-black">Visa •••• 4242</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
