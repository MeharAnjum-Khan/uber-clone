"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { driversApi } from "@/src/api/driversApi";
import { LayoutDashboard, MapPin, DollarSign, Power, Clock } from "lucide-react";

type DriverProfile = {
  status?: string | null;
};

export default function DriverAvailabilityPage() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      try {
        const profile = (await driversApi.getProfile(token)) as DriverProfile | null;
        if (profile && typeof profile.status === "string") {
          setOnline(profile.status === "online");
        }
      } catch (profileError) {
        // If driver profile does not exist yet, just treat as offline
        if (
          typeof profileError === "object" &&
          profileError !== null &&
          "status" in profileError &&
          (profileError as { status?: number }).status === 404
        ) {
          setOnline(false);
        } else {
          throw profileError;
        }
      }
    } catch (err: unknown) {
      console.warn("Load availability error", err);
      let message = "Failed to load availability.";
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
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleStatus = async () => {
    try {
      setToggling(true);
      setError(null);

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const newStatus = online ? "offline" : "online";
      await driversApi.updateStatus(token, newStatus);
      setOnline(!online);
    } catch (err: unknown) {
      console.warn("Toggle availability error", err);
      let message = "Failed to update availability.";
      if (typeof err === "object" && err !== null) {
        const maybeError = err as { error?: string; message?: string };
        message = maybeError.error || maybeError.message || message;
      } else if (typeof err === "string") {
        message = err;
      }
      setError(message);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading your availability...</p>
        </div>
      </div>
    );
  }

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
            className="flex items-center gap-3 bg-white/10 text-white px-4 py-3 rounded-lg font-medium"
          >
            <MapPin size={18} />
            Availability
          </Link>
          <Link
            href="/driver/earnings"
            className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-medium"
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
              Availability
            </h1>
            <p className="text-gray-500">
              Control when you&apos;re available to receive trip requests.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={toggling}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold border ${
              online
                ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600"
                : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
            }`}
          >
            {toggling ? (
              <Clock className="h-3 w-3 animate-spin" />
            ) : (
              <Power className="h-3 w-3" />
            )}
            {online ? "You are online" : "Go online"}
          </button>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-black mb-2">Current status</h2>
          <p className="text-sm text-gray-600 mb-3">
            You are currently
            <span
              className={`ml-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                online
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {online ? "Online" : "Offline"}
            </span>
            . When you&apos;re online, riders nearby can be matched to you for
            trips.
          </p>
          <p className="text-xs text-gray-500">
            You can change this status at any time from here or from your
            driver dashboard.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-black mb-2">Schedule (optional)</h2>
          <p className="text-sm text-gray-600 mb-3">
            In a full production app, you could set preferred hours or recurring
            schedules. For now, simply toggle your status above when you&apos;re
            ready to drive.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
            {[
              "Morning",
              "Afternoon",
              "Evening",
              "Late night",
            ].map((slot) => (
              <div
                key={slot}
                className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-2 flex items-center justify-between"
              >
                <span className="font-semibold text-gray-700">{slot}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400">
                  Manual
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
