'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ pickup, destination, drivers = [] }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef({ pickup: null, destination: null, drivers: [] });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already done
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([40.7128, -74.0060], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Custom Icon helper
    const createIcon = (color) => L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    // Handle Pickup Marker
    if (pickup?.lat && pickup?.lng) {
      if (markersRef.current.pickup) map.removeLayer(markersRef.current.pickup);
      markersRef.current.pickup = L.marker([pickup.lat, pickup.lng], { icon: createIcon('green') })
        .addTo(map)
        .bindPopup('Pickup: ' + pickup.address);
    }

    // Handle Destination Marker
    if (destination?.lat && destination?.lng) {
      if (markersRef.current.destination) map.removeLayer(markersRef.current.destination);
      markersRef.current.destination = L.marker([destination.lat, destination.lng], { icon: createIcon('black') })
        .addTo(map)
        .bindPopup('Destination: ' + destination.address);
    }

    // Handle Driver Markers
    markersRef.current.drivers.forEach(m => map.removeLayer(m));
    markersRef.current.drivers = drivers.map(d => 
      L.marker([d.latitude, d.longitude], { icon: createIcon('blue') })
        .addTo(map)
        .bindPopup(`Driver: ${d.name || 'Nearby'}`)
    );

    // Fit bounds if both coordinates exist
    if (pickup?.lat && destination?.lat) {
      const bounds = L.latLngBounds([
        [pickup.lat, pickup.lng],
        [destination.lat, destination.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // Cleanup if needed
    };
  }, [pickup, destination, drivers]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xl border-4 border-white">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md space-y-2 text-xs font-bold uppercase tracking-widest text-gray-800">
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div>
            <span>Pickup</span>
        </div>
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-black border border-white"></div>
            <span>Destination</span>
        </div>
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white"></div>
            <span>Drivers</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
