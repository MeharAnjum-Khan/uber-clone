"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { driversApi } from "@/src/api/driversApi";
import { ridesApi } from "@/src/api/ridesApi";
import {
  LayoutDashboard,
  MapPin,
  Car,
  DollarSign,
  Power,
  Clock,
  RefreshCcw,
} from "lucide-react";

type DriverDashboardRide = {
  id: string;
  pickup_address?: string | null;
  drop_address?: string | null;
  estimated_fare?: number | null;
  distance?: number | null;
};

type DriverProfile = {
  status?: string | null;
};

export default function DriverDashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [online, setOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsDriverProfile, setNeedsDriverProfile] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [todayTrips, setTodayTrips] = useState<DriverDashboardRide[]>([]);
  const [todayEarnings, setTodayEarnings] = useState(0);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      // Fetch driver profile to infer status (if backend returns it)
      try {
        const profile = (await driversApi.getProfile(token)) as DriverProfile | null;
        if (profile && typeof profile.status === "string") {
          setOnline(profile.status === "online");
        }
        setNeedsDriverProfile(false);
      } catch (profileError) {
        if (
          typeof profileError === "object" &&
          profileError !== null &&
          "status" in profileError &&
          (profileError as { status?: number }).status === 404
        ) {
          // No driver profile yet – show onboarding instead of treating as an error
          setNeedsDriverProfile(true);
          setTodayTrips([]);
          setTodayEarnings(0);
          return;
        }
        throw profileError;
      }

      // For now, reuse rides history and assume current user acts as driver
      const history = await ridesApi.getHistory(token);
      const today = new Date().toDateString();

      const driverTrips: DriverDashboardRide[] = Array.isArray(history)
        ? history.filter((ride) => {
            if (!ride.completed_at) return false;
            const d = new Date(ride.completed_at).toDateString();
            return d === today;
          })
        : [];

      setTodayTrips(driverTrips);
      const total = driverTrips.reduce(
        (sum, r) => sum + (r.estimated_fare || 0),
        0
      );
      setTodayEarnings(total);
    } catch (err: unknown) {
      console.warn("Driver dashboard error", err);
      let message = "Failed to load driver dashboard.";
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
    loadDriverData();
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
      console.warn("Toggle status error", err);
      let message = "Failed to update status.";
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

  const handleRegisterDriver = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setRegistering(true);
      setError(null);

      const formData = new FormData(event.currentTarget as HTMLFormElement);
      const vehicleModel = (formData.get("vehicleModel") || "").toString().trim();
      const licensePlate = (formData.get("licensePlate") || "").toString().trim();

      if (!vehicleModel || !licensePlate) {
        setError("Please fill in your vehicle model and license plate.");
        setRegistering(false);
        return;
      }

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      await driversApi.register(token, {
        vehicle_details: {
          vehicleModel,
          licensePlate,
        },
      });

      // After successful registration, reload dashboard data
      await loadDriverData();
    } catch (err: unknown) {
      console.warn("Register driver error", err);
      let message = "Failed to register as a driver.";
      if (typeof err === "object" && err !== null) {
        const maybeError = err as { error?: string; message?: string };
        message = maybeError.error || maybeError.message || message;
      } else if (typeof err === "string") {
        message = err;
      }
      setError(message);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Preparing your driver dashboard...</p>
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
            className="flex items-center gap-3 bg-white/10 text-white px-4 py-3 rounded-lg font-medium"
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
              Welcome, {user?.firstName || "Driver"}
            </h1>
            <p className="text-gray-500">
              Manage your availability and keep track of your trips.
            </p>
          </div>
          <div className="flex items-center gap-4">
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
                <RefreshCcw className="h-3 w-3 animate-spin" />
              ) : (
                <Power className="h-3 w-3" />
              )}
              {online ? "You are online" : "Go online"}
            </button>
            <div className="hidden lg:block">
              <UserButton />
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {needsDriverProfile ? (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-black mb-2">Become a driver</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xl">
              You don&apos;t have a driver profile yet. Share a few details about
              your vehicle to start receiving trip requests.
            </p>
            <form onSubmit={handleRegisterDriver} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">
                  Vehicle model
                </label>
                <input
                  type="text"
                  name="vehicleModel"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g. Toyota Prius, Honda Civic"
                  disabled={registering}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">
                  License plate
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g. ABC-1234"
                  disabled={registering}
                />
              </div>
              <button
                type="submit"
                disabled={registering}
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-bold text-white hover:bg-gray-900 disabled:opacity-60"
              >
                {registering ? (
                  <RefreshCcw className="h-3 w-3 animate-spin" />
                ) : (
                  <Car className="h-4 w-4" />
                )}
                {registering ? "Creating driver profile..." : "Create driver profile"}
              </button>
            </form>
          </section>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-black text-white p-6 rounded-2xl shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-white/10 mb-4 flex items-center justify-center">
                  <Car size={20} />
                </div>
                <h3 className="text-lg font-bold">Today&apos;s trips</h3>
                <p className="text-3xl font-bold mt-2">{todayTrips.length}</p>
                <p className="text-gray-300 text-sm mt-1">Completed rides</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gray-100 mb-4 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                <h3 className="text-lg font-bold text-black">Today&apos;s earnings</h3>
                <p className="text-3xl font-bold mt-2 text-black">
                  ${todayEarnings.toFixed(2)}
                </p>
                <p className="text-gray-500 text-sm mt-1">Before fees and taxes</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gray-100 mb-4 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <h3 className="text-lg font-bold text-black">Status</h3>
                <p className="mt-2 text-sm font-semibold text-black">
                  {online ? "Online and available for trips" : "Offline"}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Toggle your availability at any time.
                </p>
              </div>
            </div>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-black">Today&apos;s trips</h2>
              </div>

              <div className="p-6">
                {todayTrips.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                      <Car size={24} className="text-gray-300" />
                    </div>
                    <h3 className="font-bold text-black mb-1">
                      No trips yet today
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Go online to start receiving ride requests.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {todayTrips.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-bold text-black">
                            {r.drop_address || r.pickup_address || "Trip"}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={10} />
                            <span className="truncate max-w-55">
                              {r.pickup_address || "Pickup"}
                              {r.drop_address ? ` 
                                → ${r.drop_address}
                              ` : ""}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-black">
                            {r.estimated_fare != null
                              ? `$${r.estimated_fare.toFixed(2)}`
                              : "—"}
                          </p>
                          {r.distance != null && (
                            <p className="text-xs text-gray-500">
                              {r.distance.toFixed(1)} km
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
