"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { ridesApi } from "@/src/api/ridesApi";
import { LayoutDashboard, MapPin, Car, DollarSign, Clock } from "lucide-react";

type DriverEarningsRide = {
  id: string;
  status?: string;
  pickup_address?: string | null;
  drop_address?: string | null;
  requested_at?: string | null;
  completed_at?: string | null;
  estimated_fare?: number | null;
};

export default function DriverEarningsPage() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rides, setRides] = useState<DriverEarningsRide[]>([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [completedTrips, setCompletedTrips] = useState(0);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await ridesApi.getHistory(token);
      const list: DriverEarningsRide[] = Array.isArray(res) ? res : [];

      setRides(list);

      const now = new Date();
      const todayString = now.toDateString();

      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diffToMonday = (day + 6) % 7; // 0=Sun -> 6, 1=Mon -> 0
      startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      let todayTotal = 0;
      let weekTotal = 0;
      let completedCount = 0;

      list.forEach((ride) => {
        if (ride.status !== "completed") return;
        if (!ride.completed_at || ride.estimated_fare == null) return;

        const completedDate = new Date(ride.completed_at);
        if (completedDate.toDateString() === todayString) {
          todayTotal += ride.estimated_fare;
        }
        if (completedDate >= startOfWeek) {
          weekTotal += ride.estimated_fare;
        }
        completedCount += 1;
      });

      setTodayEarnings(todayTotal);
      setWeekEarnings(weekTotal);
      setCompletedTrips(completedCount);
    } catch (err: unknown) {
      console.warn("Driver earnings error", err);
      let message = "Failed to load earnings.";
      if (typeof err === "object" && err !== null) {
        const maybeError = err as { error?: string; message?: string };
        message = maybeError.error || maybeError.message || message;
      } else if (typeof err === "string") {
        message = err;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDateTime = (value?: string | null) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const formatMoney = (amount: number) => {
    return `??{amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-black flex-col fixed inset-y-0 left-0 p-6">
        <div className="text-white text-2xl font-bold tracking-tighter mb-10">
          GoRide Driver
        </div>
        <nav className="flex-1 space-y-2">
          <Link
            href="/driver/dashboard"
            className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-medium"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            href="/driver/availability"
            className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-medium"
          >
            <MapPin size={18} />
            Availability
          </Link>
          <Link
            href="/driver/earnings"
            className="flex items-center gap-3 bg-white/10 text-white px-4 py-3 rounded-lg font-medium"
          >
            <DollarSign size={18} />
            Earnings
          </Link>
        </nav>

        <div className="pt-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-4">
            <UserButton />
            <div className="text-white">
              <p className="text-sm font-bold leading-none">
                {user?.fullName ||
                  user?.emailAddresses?.[0]?.emailAddress ||
                  "Driver"}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">
                Driver
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
              Earnings
            </h1>
            <p className="text-gray-500">
              Track what you&apos;ve earned from your recent trips.
            </p>
          </div>
          <button
            type="button"
            onClick={loadEarnings}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <Clock className="h-3 w-3" />
            Refresh
          </button>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-gray-500">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p>Loading your earnings...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-black text-white p-6 rounded-2xl shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-white/10 mb-4 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                <h3 className="text-lg font-bold">Today&apos;s earnings</h3>
                <p className="text-3xl font-bold mt-2">
                  {formatMoney(todayEarnings)}
                </p>
                <p className="text-gray-300 text-sm mt-1">Completed trips today</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gray-100 mb-4 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                <h3 className="text-lg font-bold text-black">This week</h3>
                <p className="text-3xl font-bold mt-2 text-black">
                  {formatMoney(weekEarnings)}
                </p>
                <p className="text-gray-500 text-sm mt-1">Since Monday</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gray-100 mb-4 flex items-center justify-center">
                  <Car size={20} />
                </div>
                <h3 className="text-lg font-bold text-black">Completed trips</h3>
                <p className="text-3xl font-bold mt-2 text-black">{completedTrips}</p>
                <p className="text-gray-500 text-sm mt-1">Lifetime completed trips</p>
              </div>
            </div>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-widest">
                <span className="w-2/5">Trip</span>
                <span className="hidden md:inline-flex w-1/5">Completed</span>
                <span className="w-1/5 text-center">Status</span>
                <span className="w-1/5 text-right">Amount</span>
              </div>
              {rides.filter((ride) => ride.status === "completed").length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-gray-500">
                  You don&apos;t have any trips yet. Once you complete trips as a
                  driver, they will appear here with their payouts.
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {rides
                    .filter((ride) => ride.status === "completed")
                    .map((ride) => (
                    <li
                      key={ride.id}
                      className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-gray-50"
                    >
                      <div className="flex-1 flex items-start gap-3 min-w-0">
                        <div className="mt-1 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          <Car size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-black truncate">
                            {ride.drop_address || ride.pickup_address || "Trip"}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            {ride.pickup_address && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={10} />
                                <span className="truncate max-w-50">
                                  {ride.pickup_address}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="md:w-1/5 flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} className="hidden md:inline" />
                        <span className="truncate max-w-45">
                          {formatDateTime(ride.completed_at || ride.requested_at)}
                        </span>
                      </div>

                      <div className="md:w-1/5 flex justify-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ?{
                            ride.status === "completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : ride.status === "cancelled"
                              ? "bg-red-50 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {ride.status ? ride.status[0].toUpperCase() + ride.status.slice(1) : ""}
                        </span>
                      </div>

                      <div className="md:w-1/5 text-right text-sm font-semibold text-black">
                        {ride.estimated_fare != null
                          ? formatMoney(ride.estimated_fare)
                          : "—"}
                      </div>
                    </li>
                    ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
