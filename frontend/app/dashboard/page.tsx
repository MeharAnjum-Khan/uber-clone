'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { 
  Car, 
  Clock, 
  MapPin, 
  Shield, 
  CreditCard, 
  Star, 
  HelpCircle, 
  ArrowRight,
  User,
  History,
  TrendingUp,
  Settings
} from 'lucide-react';
import Sidebar from '@/src/components/Sidebar';
import Navbar from '@/src/components/Navbar';
import MapView from '@/src/components/MapView';
import { ridesApi } from '@/src/api/ridesApi';
import Loader from '@/src/components/Loader';
import ErrorMessage from '@/src/components/ErrorMessage';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchDashboardData();
    }
  }, [isLoaded, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Get the clerk token
      const token = await (window as any).Clerk?.session?.getToken();
      
      // Fetch ride history (limited to 3 for summary)
      const data = await ridesApi.getHistory(token);
      setRecentRides(data.slice(0, 3));
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) return <Loader fullPage={true} />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={false} toggleSidebar={() => {}} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar toggleSidebar={() => {}} />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Welcome Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900">
                  Welcome back, {user?.firstName || 'User'}
                </h1>
                <p className="text-gray-500 font-medium mt-2">Ready to explore the city today?</p>
              </div>
              <Link href="/rides/request" className="bg-black text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-500/20 flex items-center gap-3 group">
                Request a Ride
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Total Trips" 
                value={recentRides.length > 0 ? "12" : "0"} 
                icon={History} 
                trend="+2 this week"
              />
              <StatCard 
                title="Spent this Month" 
                value="$142.50" 
                icon={CreditCard} 
                trend="-12% vs last mo"
                trendColor="text-green-500"
              />
              <StatCard 
                title="Driver Rating" 
                value="4.92" 
                icon={Star} 
                trend="Top 5% of users"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              
              {/* Main Content Area: Map & Recent Rides */}
              <div className="lg:col-span-2 space-y-10">
                
                {/* Visual Map Overview */}
                <section className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                   <div className="h-96 w-full rounded-2xl overflow-hidden relative group">
                      <MapView pickup={{ lat: 40.7128, lng: -74.0060, address: 'Current Location' }} destination={null} drivers={[]} />
                      <div className="absolute top-4 left-4 z-20">
                         <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[0.65rem] font-black uppercase tracking-widest">8 Drivers Nearby</span>
                         </div>
                      </div>
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all pointer-events-none"></div>
                   </div>
                </section>

                {/* Recent Activity */}
                <section className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black tracking-tight text-gray-900">Recent Rides</h3>
                    <Link href="/rides/history" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition uppercase tracking-tighter">View All History</Link>
                  </div>
                  
                  {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}
                  
                  <div className="space-y-4">
                    {recentRides.length > 0 ? (
                      recentRides.map(ride => (
                        <RideItem key={ride.id} ride={ride} />
                      ))
                    ) : (
                      <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center space-y-4">
                        <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
                          <Car className="w-8 h-8" />
                        </div>
                        <p className="text-gray-400 font-medium">No recent rides found. Start your first journey!</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Sidebar Content Area: Promotions & Profile Quick Links */}
              <div className="space-y-8">
                
                {/* Promo Banner */}
                <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group shadow-2xl shadow-blue-500/20">
                   <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                   <span className="inline-block py-1 px-3 rounded-lg bg-white/20 text-[0.6rem] font-black uppercase tracking-widest mb-4">Limited Offer</span>
                   <h4 className="text-3xl font-black tracking-tight mb-2">50% OFF</h4>
                   <p className="text-blue-100 font-medium text-sm leading-relaxed mb-6">Unlock half-price rides for your next 3 commutes in Brooklyn.</p>
                   <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition shadow-lg">Activate Promo</button>
                </div>

                {/* Settings Quick Links */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6 shadow-sm">
                   <h4 className="text-lg font-black uppercase tracking-tight text-gray-400">Quick Access</h4>
                   <nav className="space-y-2">
                      <QuickLink icon={Settings} label="Payment Methods" href="/payments" />
                      <QuickLink icon={HelpCircle} label="Help & Support" href="/profile" />
                      <QuickLink icon={Shield} label="Privacy Controls" href="/profile" />
                   </nav>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendColor = 'text-blue-500' }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 border border-blue-100">
          <Icon className="w-6 h-6" />
        </div>
        <span className={`${trendColor} text-[0.65rem] font-black uppercase tracking-widest`}>{trend}</span>
      </div>
      <div>
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</span>
        <h3 className="text-4xl font-black text-gray-900 mt-1">{value}</h3>
      </div>
    </div>
  );
}

function QuickLink({ icon: Icon, label, href }: any) {
  return (
    <Link href={href} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100 group">
      <div className="flex items-center gap-4">
        <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
        <span className="font-bold text-gray-600 group-hover:text-black">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

function RideItem({ ride }: any) {
  const statusColors: any = {
    requested: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    accepted: 'bg-blue-50 text-blue-600 border-blue-100',
    completed: 'bg-green-50 text-green-600 border-green-100',
    cancelled: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between hover:shadow-md transition group">
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 overflow-hidden border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50 transition">
          <Car className="w-7 h-7 group-hover:text-blue-600" />
        </div>
        <div>
           <div className="flex items-center gap-3">
              <h4 className="font-black text-gray-900">{ride.destinationAddress?.split(',')[0] || 'Unknown Destination'}</h4>
              <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${statusColors[ride.status] || 'bg-gray-50 text-gray-500'}`}>
                {ride.status}
              </span>
           </div>
           <p className="text-sm font-medium text-gray-400 flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3" />
              {new Date(ride.createdAt).toLocaleDateString()} • {ride.rideType || 'Standard'}
           </p>
        </div>
      </div>
      <div className="text-right">
        <span className="block text-lg font-black text-gray-900">${ride.fare || '0.00'}</span>
        <Link href={`/rides/${ride.id}`} className="text-[0.65rem] font-black uppercase tracking-widest text-blue-600 hover:text-black transition">Details</Link>
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  );
}
