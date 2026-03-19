"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ridesApi } from "@/src/api/ridesApi";
import {
  ArrowLeft,
  Car,
  Clock,
  Navigation,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type ActiveRide = {
  id: string;
  status?: string;
  ride_type?: string;
  pickup_address?: string | null;
  drop_address?: string | null;
  requested_at?: string | null;
  estimated_fare?: number | null;
};

export default function ActiveRidePage() {
  const searchParams = useSearchParams();
  const rideId = searchParams.get("rideId");
  const { getToken } = useAuth();

  const [ride, setRide] = useState<ActiveRide | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRide = async () => {
    if (!rideId) return;

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await ridesApi.getRideDetails(token, rideId);
      setRide(res || null);
    } catch (err: unknown) {
      console.warn("Active ride error", err);
      let message = "Failed to load ride.";
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
    if (rideId) {
      loadRide();
    } else {
      setLoading(false);
      setError("No active ride found.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideId]);

  const handleCancelRide = async () => {
    if (!rideId) return;
    try {
      setActionLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      await ridesApi.updateStatus(token, rideId, "cancelled");
      await loadRide();
    } catch (err: unknown) {
      console.warn("Cancel ride error", err);
      let message = "Failed to cancel ride.";
      if (typeof err === "object" && err !== null) {
        const maybeError = err as { error?: string; message?: string };
        message = maybeError.error || maybeError.message || message;
      } else if (typeof err === "string") {
        message = err;
      }
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

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

  const isCancelable = ride?.status === "searching" || ride?.status === "accepted";

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center px-4 py-8 md:py-10">
      <div className="w-full max-w-3xl">
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
                Active ride
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                Track your current trip in real time.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-gray-500">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p>Loading your ride...</p>
          </div>
        ) : !ride ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-1">
              <Car size={24} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-black">No active ride</h2>
            <p className="text-sm text-gray-500 max-w-sm">
              You don&apos;t have an active ride right now. Request a new ride to
              see it here.
            </p>
            <Link
              href="/rides/request"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-bold text-white hover:bg-gray-900"
            >
              Request a ride
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center text-white">
                <Navigation size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                  {ride.ride_type || "GoRide"}
                </p>
                <h2 className="text-xl font-bold text-black mb-1">
                  {ride.drop_address || ride.pickup_address || "Your trip"}
                </h2>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} />
                  {formatDateTime(ride.requested_at)}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    ride.status === "completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : ride.status === "cancelled"
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {formatStatus(ride.status)}
                </span>
                <div className="mt-2 text-sm font-semibold text-black text-right">
                  {ride.estimated_fare != null
                    ? `$${ride.estimated_fare.toFixed(2)}`
                    : "—"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-start gap-3">
                <div className="mt-1 w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                  A
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                    Pickup
                  </p>
                  <p className="text-sm text-black">
                    {ride.pickup_address || "Pickup location"}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-start gap-3">
                <div className="mt-1 w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                  B
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                    Dropoff
                  </p>
                  <p className="text-sm text-black">
                    {ride.drop_address || "Dropoff location"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 flex flex-col items-center justify-center gap-3 text-center text-xs text-gray-500">
              <p className="font-semibold text-gray-600 flex items-center gap-2">
                <Navigation size={14} />
                Live map and driver location will appear here in a later phase.
              </p>
              <p>
                For now, you can track the status of your ride and cancel if
                needed.
              </p>
            </div>

            <div className="flex justify-between items-center gap-4">
              <Link
                href="/rides/history"
                className="text-xs font-semibold text-gray-600 hover:text-black"
              >
                View ride history
              </Link>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadRide}
                  disabled={loading || actionLoading}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={handleCancelRide}
                  disabled={!isCancelable || actionLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-900 disabled:opacity-60"
                >
                  {actionLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                  {isCancelable ? "Cancel ride" : "Ride not cancelable"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
