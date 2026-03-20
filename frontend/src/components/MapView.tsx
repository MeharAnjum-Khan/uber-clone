"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// We import Leaflet components dynamically with SSR disabled to prevent 
// "window is not defined" and "appendChild" errors during hydration.
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const useMap = dynamic(() => import("react-leaflet").then(mod => mod.useMap), { ssr: false }) as any;
const useMapEvents = dynamic(() => import("react-leaflet").then(mod => mod.useMapEvents), { ssr: false }) as any;

// NAGPUR COORDINATES
const NAGPUR_CENTER: [number, number] = [21.1458, 79.0882];

interface MapViewProps {
  pickup: [number, number] | null;
  drop: [number, number] | null;
  onPickupChange?: (lat: number, lng: number) => void;
  onDropChange?: (lat: number, lng: number) => void;
  selectingMode: "pickup" | "drop" | null;
}

// Separate component for handling clicks
function MapClickHandler({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number) => void 
}) {
  const { useMapEvents: useEvents } = require("react-leaflet");
  useEvents({
    click(e: any) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Separate component for changing view
function ChangeView({ center }: { center: [number, number] }) {
  const { useMap: getMap } = require("react-leaflet");
  const map = getMap();
  useEffect(() => {
    if (map) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function MapView({ pickup, drop, onPickupChange, onDropChange, selectingMode }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    import("leaflet").then((leaflet) => {
      const DefaultIcon = leaflet.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      (leaflet.Marker.prototype as any).options.icon = DefaultIcon;
      setL(leaflet);
    });
  }, []);

  const [center, setCenter] = useState<[number, number]>(NAGPUR_CENTER);

  useEffect(() => {
    if (pickup) {
      setCenter(pickup);
    } else if (isClient && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          setCenter(NAGPUR_CENTER);
        }
      );
    }
  }, [pickup, isClient]);

  const handleMapClick = (lat: number, lng: number) => {
    if (selectingMode === "pickup" && onPickupChange) {
      onPickupChange(lat, lng);
    } else if (selectingMode === "drop" && onDropChange) {
      onDropChange(lat, lng);
    }
  };

  if (!isClient) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center text-gray-400 font-medium font-sans">
        Initializing Map...
      </div>
    );
  }

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {pickup && (
          <Marker position={pickup} />
        )}
        
        {drop && (
          <Marker position={drop} />
        )}

        {selectingMode && <MapClickHandler onLocationSelect={handleMapClick} />}
        <ChangeView center={center} />
      </MapContainer>
    </div>
  );
}
