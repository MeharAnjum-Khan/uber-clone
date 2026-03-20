"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ridesApi } from "@/src/api/ridesApi";
import { MapPin, LocateFixed, ArrowRight, Loader2, Map as MapIcon, X } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import for Leaflet (can't be SSR'd)
const MapView = dynamic(() => import("@/src/components/MapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading map...</div>
});

export default function RequestRidePage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropCoords, setDropCoords] = useState<[number, number] | null>(null);
  const [selectingMode, setSelectingMode] = useState<"pickup" | "drop" | null>(null);

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
      if (!pickupCoords || !dropCoords) {
        setError("Please select pickup and dropoff locations on the map.");
        return;
      }

      setError(null);
      setLoadingEstimate(true);
      setEstimated(null);
      setSelectedType(null);

      const token = await getToken();
      if (!token) {
        throw new Error("You must be logged in to request a ride.");
      }

      const coordinates = {
        pickupLat: pickupCoords[0],
        pickupLng: pickupCoords[1],
        dropLat: dropCoords[0],
        dropLng: dropCoords[1],
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
    if (!selectedType || !pickupCoords || !dropCoords) return;

    try {
      setError(null);
      setRequesting(true);

      const token = await getToken();
      if (!token) {
        throw new Error("You must be logged in to request a ride.");
      }

      const rideData = {
        pickup: {
          lat: pickupCoords[0],
          lng: pickupCoords[1],
          address: pickupAddress || "Selected point",
        },
        drop: {
          lat: dropCoords[0],
          lng: dropCoords[1],
          address: dropAddress || "Selected destination",
        },
        rideType: selectedType,
      };

      const res = await ridesApi.requestRide(token, rideData);

      if (res && res.rideId) {
        router.push("/rides/active?rideId=" + encodeURIComponent(res.rideId));
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

  const useCurrentLocation = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPickupCoords([pos.coords.latitude, pos.coords.longitude]);
        setPickupAddress("Current location (" + pos.coords.latitude.toFixed(4) + ", " + pos.coords.longitude.toFixed(4) + ")");
      }, (err) => {
        console.error("Geolocation error", err);
        setError("Could not get your current location.");
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center px-4 py-8 md:py-12">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
        
        {/* Input Panel */}
        <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
                Request a ride
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                Click on the map to set pickup and dropoff.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div 
              className={"flex items-center gap-3 rounded-xl border px-4 py-3 transition-all cursor-pointer " + (selectingMode === "pickup" ? "border-black bg-gray-50 ring-2 ring-black/5" : "border-gray-200 bg-gray-50")}
              onClick={() => setSelectingMode("pickup")}
            >
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white">
                <MapPin size={16} />
              </div>
              <div className="flex-1 flex flex-col">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Pickup</p>
                <input
                  readOnly
                  value={pickupAddress || (pickupCoords ? "Custom point selected" : "")}
                  placeholder="Set pickup on map..."
                  className="bg-transparent outline-none text-sm md:text-base placeholder:text-gray-400 cursor-pointer"
                />
              </div>
              {pickupCoords && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setPickupCoords(null); setPickupAddress(""); }} 
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div 
              className={"flex items-center gap-3 rounded-xl border px-4 py-3 transition-all cursor-pointer " + (selectingMode === "drop" ? "border-black bg-gray-50 ring-2 ring-black/5" : "border-gray-200 bg-gray-50")}
              onClick={() => setSelectingMode("drop")}
            >
              <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white opacity-80">
                <ArrowRight size={16} />
              </div>
              <div className="flex-1 flex flex-col">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Dropoff</p>
                <input
                  readOnly
                  value={dropAddress || (dropCoords ? "Custom destination selected" : "")}
                  placeholder="Set dropoff on map..."
                  className="bg-transparent outline-none text-sm md:text-base placeholder:text-gray-400 cursor-pointer"
                />
              </div>
              {dropCoords && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setDropCoords(null); setDropAddress(""); }} 
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <button
              type="button"
              onClick={useCurrentLocation}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LocateFixed size={16} />
              Use current location
            </button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <button
              type="button"
              onClick={handleEstimate}
              disabled={loadingEstimate || !pickupCoords || !dropCoords}
              className="w-full inline-flex items-center justify-center rounded-xl bg-black px-6 py-4 text-sm font-bold text-white hover:bg-gray-900 disabled:opacity-40 transition-opacity"
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
            <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
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
                  className={"w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all " + (selectedType === option.type ? "border-black bg-black text-white shadow-lg scale-[1.02]" : "border-gray-200 bg-white hover:bg-gray-50")}
                >
                  <div>
                    <p className="text-sm font-bold">
                      {option.type || "GoRide"}
                    </p>
                    <p
                      className={"text-xs " + (selectedType === option.type ? "text-gray-200" : "text-gray-500")}
                    >
                      {option.eta} min away • {option.distance} km
                    </p>
                  </div>
                  <p className="text-sm font-bold">{"?" + (option.price?.toFixed(2) || "0.00")}</p>
                </button>
              ))}

              <button
                type="button"
                onClick={handleRequestRide}
                disabled={!selectedType || requesting}
                className="w-full mt-4 flex items-center justify-center rounded-xl bg-black px-6 py-4 text-sm font-bold text-white hover:bg-gray-900 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {requesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding driver...
                  </>
                ) : (
                  "Confirm Ride"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Map Panel */}
        <div className="w-full md:w-1/2 h-[500px] md:h-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[500px]">
          <MapView 
            pickup={pickupCoords}
            drop={dropCoords}
            selectingMode={selectingMode}
            onPickupChange={(lat, lng) => {
              setPickupCoords([lat, lng]);
              setPickupAddress("Map point (" + lat.toFixed(4) + ", " + lng.toFixed(4) + ")");
              setSelectingMode(null);
            }}
            onDropChange={(lat, lng) => {
              setDropCoords([lat, lng]);
              setDropAddress("Map point (" + lat.toFixed(4) + ", " + lng.toFixed(4) + ")");
              setSelectingMode(null);
            }}
          />
          {!selectingMode && (
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200 flex items-center gap-2">
                <MapIcon size={16} className="text-gray-600" />
                <span className="text-xs font-semibold text-gray-700">Map view</span>
              </div>
            </div>
          )}
          {selectingMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-black text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-pulse">
                <span className="text-sm font-bold">
                  {"Click on map to set " + selectingMode}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
