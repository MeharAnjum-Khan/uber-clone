"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  pickup: [number, number] | null;
  drop: [number, number] | null;
  onPickupChange?: (lat: number, lng: number) => void;
  onDropChange?: (lat: number, lng: number) => void;
  selectingMode: "pickup" | "drop" | null;
}

function MapClickHandler({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number) => void 
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function MapView({ pickup, drop, onPickupChange, onDropChange, selectingMode }: MapViewProps) {
  const [center, setCenter] = useState<[number, number]>([37.7749, -122.4194]);

  useEffect(() => {
    if (pickup) {
      setCenter(pickup);
    } else if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
    // Only update center on mount or when pickup explicitly changes from null to something
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup === null]);

  const handleMapClick = (lat: number, lng: number) => {
    if (selectingMode === "pickup" && onPickupChange) {
      onPickupChange(lat, lng);
    } else if (selectingMode === "drop" && onDropChange) {
      onDropChange(lat, lng);
    }
  };

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
