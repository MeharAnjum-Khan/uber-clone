import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Ride {
  id: string;
  rider_id: string;
  driver_id: string | null;
  status: 'searching' | 'accepted' | 'arriving' | 'started' | 'completed' | 'cancelled';
  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;
  drop_lat: number;
  drop_lng: number;
  drop_address: string;
  distance: number;
  estimated_fare: number;
  actual_fare: number | null;
  requested_at: string;
  driver?: {
    name: string;
    email: string;
  };
  rider?: {
    name: string;
    email: string;
  };
}

/**
 * Fetch Ride History for the current user
 * @param token Clerk JWT token
 * @returns Array of rides
 */
export const getRideHistory = async (token: string): Promise<Ride[]> => {
  const response = await axios.get(`${API_URL}/rides/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
