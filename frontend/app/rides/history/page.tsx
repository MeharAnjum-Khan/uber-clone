"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ridesApi } from "@/src/api/ridesApi";
import { ArrowLeft, Car, Clock, MapPin, RefreshCcw } from "lucide-react";
import Link from "next/link";

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
      if (!token) {
        throw new Error("Not authenticated");
      }

      const res = await ridesApi.getHistory(token);
      if (Array.isArray(res)) {
        setRides(res);
      } else {
        setRides([]);
      }
    } catch (err: unknown) {
      console.warn("Ride history error", err);
      let message = "Failed to load ride history.";
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
    loadHistory();
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

  const formatStatus = (status?: string) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center px-4 py-8 md:py-10">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft size={14} />
              Dashboard
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
                Ride history
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                View all your past trips and receipts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadHistory}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-gray-500">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p>Loading your rides...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-1">
              <Car size={24} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-black">No rides yet</h2>
            <p className="text-sm text-gray-500 max-w-sm">
              When you start requesting rides, they will show up here
              along with their status and receipts.
            </p>
            <Link
              href="/rides/request"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-bold text-white hover:bg-gray-900"
            >
              Request a ride
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-widest">
              <span className="w-2/5">Trip</span>
              <span className="hidden md:inline-flex w-1/5">Date</span>
              <span className="w-1/5 text-center">Status</span>
              <span className="w-1/5 text-right">Amount</span>
            </div>
            <ul className="divide-y divide-gray-50">
              {rides.map((ride) => (
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
                        {ride.ride_type && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-semibold uppercase tracking-widest">
                            {ride.ride_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="md:w-1/5 flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} className="hidden md:inline" />
                    <span className="truncate max-w-45">
                      {formatDateTime(ride.requested_at)}
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
                      {formatStatus(ride.status)}
                    </span>
                  </div>

                  <div className="md:w-1/5 text-right text-sm font-semibold text-black">
                    {ride.estimated_fare != null
                      ? `??{ride.estimated_fare.toFixed(2)}`
                      : "—"}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
