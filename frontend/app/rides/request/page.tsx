"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ridesApi } from "@/src/api/ridesApi";
import { MapPin, LocateFixed, ArrowRight, Loader2 } from "lucide-react";

export default function RequestRidePage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  type RideEstimateOption = {
    type?: string;
    price?: number;
    eta?: number;
    distance?: number;
  };

  const [estimated, setEstimated] = useState<RideEstimateOption[] | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async () => {
    try {
      setError(null);
      setLoadingEstimate(true);
      setEstimated(null);
      setSelectedType(null);

      const token = await getToken();
      if (!token) {
        throw new Error("You must be logged in to request a ride.");
      }

      // For now we don't have live geocoding; use placeholder coords
      const coordinates = {
        pickupLat: 37.7749,
        pickupLng: -122.4194,
        dropLat: 37.7849,
        dropLng: -122.4094,
      };

      const result = await ridesApi.getEstimate(token, coordinates);
      setEstimated(Array.isArray(result) ? result : []);
    } catch (err: unknown) {
      console.error("Estimate error", err);
      setError("Failed to fetch estimate. Please try again.");
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleRequestRide = async () => {
    if (!selectedType) return;

    try {
      setError(null);
      setRequesting(true);

      const token = await getToken();
      if (!token) {
        throw new Error("You must be logged in to request a ride.");
      }

      const rideData = {
        pickup: {
          lat: 37.7749,
          lng: -122.4194,
          address: pickupAddress || "Pickup location",
        },
        drop: {
          lat: 37.7849,
          lng: -122.4094,
          address: dropAddress || "Dropoff location",
        },
        rideType: selectedType,
      };

      const res = await ridesApi.requestRide(token, rideData);

      if (res && res.rideId) {
        router.push(`/rides/active?rideId=${encodeURIComponent(res.rideId)}`);
      } else {
        setError("Ride request created but response was unexpected.");
      }
    } catch (err: unknown) {
      console.error("Request ride error", err);
      setError("Failed to request ride. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center px-4 py-8 md:py-12">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
              Request a ride
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              Enter your pickup and dropoff, then choose a ride option.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white">
              <MapPin size={16} />
            </div>
            <div className="flex-1 flex items-center gap-3">
              <input
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Where should we pick you up?"
                className="flex-1 bg-transparent outline-none text-sm md:text-base placeholder:text-gray-400"
              />
              <button
                type="button"
                className="hidden md:inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                <LocateFixed size={14} />
                Use current location
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white opacity-80">
              <ArrowRight size={16} />
            </div>
            <input
              value={dropAddress}
              onChange={(e) => setDropAddress(e.target.value)}
              placeholder="Where are you going?"
              className="flex-1 bg-transparent outline-none text-sm md:text-base placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={handleEstimate}
            disabled={loadingEstimate}
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-900 disabled:opacity-60"
          >
            {loadingEstimate ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              "Get estimate"
            )}
          </button>
        </div>

        {estimated && (
          <div className="space-y-3 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">
              Ride options
            </h2>
            {estimated.length === 0 && (
              <p className="text-sm text-gray-500">
                No options available for this route yet.
              </p>
            )}
            {estimated.map((option) => (
              <button
                key={option.type}
                type="button"
                onClick={() => setSelectedType(option.type ?? null)}
                className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                  selectedType === option.type
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div>
                  <p className="text-sm font-bold">
                    {option.type || "GoRide"}
                  </p>
                  <p
                    className={`text-xs ${
                      selectedType === option.type
                        ? "text-gray-200"
                        : "text-gray-500"
                    }`}
                  >
                    {option.distance
                      ? `${option.distance.toFixed(1)} km • ETA ${
                          option.eta ?? "--"
                        } min`
                      : "Estimated fare and ETA"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {option.price != null
                      ? `$${option.price.toFixed(2)}`
                      : "—"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleRequestRide}
            disabled={!selectedType || requesting}
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-900 disabled:opacity-60"
          >
            {requesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : (
              <>
                Confirm {selectedType ? `(${selectedType})` : "ride"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
