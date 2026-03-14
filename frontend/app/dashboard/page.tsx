'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, useUser, UserButton } from '@clerk/nextjs';
import { LayoutDashboard, Plus, History, CreditCard, Settings, Bell, Car, ChevronRight } from 'lucide-react';
import { ridesApi } from '@/src/api/ridesApi';
import { authApi } from '@/src/api/authApi';

export default function DashboardPage() {
  const { getToken, userId } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentRides, setRecentRides] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        // Sync user with backend (safe, idempotent)
        if (user) {
          await authApi.syncUser(token, {
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName || user.username,
            clerk_id: userId,
            role: 'rider',
          });
        }

        // Fetch recent rides via existing API service
        const res = await ridesApi.getHistory(token);
        if (mounted) {
          if (res && Array.isArray(res)) setRecentRides(res.slice(0, 5));
          else setRecentRides([]);
        }
      } catch (err: any) {
        console.error('Dashboard error', err);
        if (mounted) setError('Failed to load dashboard.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => { mounted = false; };
  }, [getToken, user, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-black flex-col fixed inset-y-0 left-0 p-6">
        <div className="text-white text-2xl font-bold tracking-tighter mb-10">GoRide</div>
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 bg-white/10 text-white px-4 py-3 rounded-lg font-medium">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link href="/rides/request" className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-medium">
            <Plus size={18} />
            Request Ride
          </Link>
          <Link href="/rides/history" className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-medium">
            <History size={18} />
            Ride History
          </Link>
          <Link href="/payments/history" className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-medium">
            <CreditCard size={18} />
            Payments
          </Link>
          <Link href="/profile" className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-medium">
            <Settings size={18} />
            Profile
          </Link>
        </nav>

        <div className="pt-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-4">
            <UserButton />
            <div className="text-white">
              <p className="text-sm font-bold leading-none">{user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'User'}</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Rider</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">Welcome back, {user?.firstName || 'Rider'}</h1>
            <p className="text-gray-500">Where do you want to go today?</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-50">
              <Bell size={18} />
            </button>
            <div className="hidden lg:block"><UserButton /></div>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/rides/request" className="col-span-1 md:col-span-1 bg-black text-white p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-xl bg-white/10 mb-4 flex items-center justify-center">
              <Plus size={20} />
            </div>
            <h3 className="text-lg font-bold">Request Ride</h3>
            <p className="text-gray-300 text-sm">Quickly request a ride near you.</p>
          </Link>

          <Link href="/rides/history" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gray-100 mb-4 flex items-center justify-center">
              <History size={20} />
            </div>
            <h3 className="text-lg font-bold text-black">Ride History</h3>
            <p className="text-gray-500 text-sm">View your past trips and receipts.</p>
          </Link>

          <Link href="/payments/history" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gray-100 mb-4 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <h3 className="text-lg font-bold text-black">Payments</h3>
            <p className="text-gray-500 text-sm">Manage payment methods and receipts.</p>
          </Link>
        </div>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-black">Recent Rides</h2>
            <Link href="/rides/history" className="text-sm font-bold text-black flex items-center gap-1">View All <ChevronRight size={14} /></Link>
          </div>

          <div className="p-6">
            {recentRides.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <Car size={24} className="text-gray-300" />
                </div>
                <h3 className="font-bold text-black mb-1">No rides yet</h3>
                <p className="text-gray-500">Request your first ride to see it here.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {recentRides.map((r) => (
                  <li key={r.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-bold text-black">{r.drop_address || 'Trip'}</p>
                      <p className="text-xs text-gray-500">{r.ride_type || 'GoRide Economy'} • {r.requested_at ? new Date(r.requested_at).toLocaleString() : 'Just now'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-black">${(r.estimated_fare || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500 capitalize">{r.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
