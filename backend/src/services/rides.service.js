const { createClient } = require('@supabase/supabase-js');

// Assuming these are loaded from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const RIDE_STATUS = {
  SEARCHING: 'searching',
  ACCEPTED: 'accepted',
  ARRIVING: 'arriving',
  STARTED: 'started',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const RIDE_TYPES = {
  UBER_X: 'uber_x',
  UBER_XL: 'uber_xl',
  PREMIER: 'premier',
};

const BASE_FARES = {
  [RIDE_TYPES.UBER_X]: { base: 5, perKm: 1.5, perMin: 0.5 },
  [RIDE_TYPES.UBER_XL]: { base: 8, perKm: 2.5, perMin: 0.8 },
  [RIDE_TYPES.PREMIER]: { base: 12, perKm: 3.5, perMin: 1.2 },
};

/**
 * Calculate distance between two points in km using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Service: Get Fare Estimate
 */
const getFareEstimate = async (pickupLat, pickupLng, dropLat, dropLng) => {
  const distance = calculateDistance(pickupLat, pickupLng, dropLat, dropLng);
  // Estimate duration assuming avg speed of 30km/h
  const durationMins = (distance / 30) * 60; 

  const estimates = Object.values(RIDE_TYPES).map((type) => {
    const pricing = BASE_FARES[type];
    const price = pricing.base + (pricing.perKm * distance) + (pricing.perMin * durationMins);
    
    return {
      type,
      price: parseFloat(price.toFixed(2)),
      eta: Math.ceil(durationMins), // Estimated time to arrival at destination or pickup? Contract says "eta" usually means pickup eta, but here it seems to be ride duration or pickup eta. Given context of "fare estimate", usually includes duration. Let's assume standard behavior. But "eta" in response usually implies "how long until driver arrives". Let's stick to a mock value for driver arrival ETA (e.g., 5-10 mins) or use the calculated travel time if that's what's meant. 
      // API Contract: response: [{ "type": string, "price": number, "eta": number, "distance": number }]
      // "eta" often means "time to pickup". I will simulate a random pickup ETA for now as we don't have driver locations.
      eta: Math.floor(Math.random() * 10) + 2, 
      distance: parseFloat(distance.toFixed(2)),
    };
  });

  return estimates;
};

/**
 * Service: Request a Ride
 */
const requestRide = async (riderId, { pickup, drop, rideType, promoCode }) => {
  // 1. Calculate fare
  const distance = calculateDistance(pickup.lat, pickup.lng, drop.lat, drop.lng);
  const durationMins = (distance / 30) * 60;
  const pricing = BASE_FARES[rideType] || BASE_FARES[RIDE_TYPES.UBER_X];
  let estimatedFare = pricing.base + (pricing.perKm * distance) + (pricing.perMin * durationMins);

  // 2. Validate Promo Code if present
  let appliedPromoCode = null;
  if (promoCode) {
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode)
      .single();

    if (promoError || !promo) {
      throw new Error('Invalid promo code');
    }

    if (!promo.is_active) throw new Error('Promo code is inactive');
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) throw new Error('Promo code expired');

    if (promo.type === 'percentage') {
       estimatedFare = estimatedFare * (1 - promo.discount / 100);
    } else if (promo.type === 'fixed') {
       estimatedFare = Math.max(0, estimatedFare - promo.discount);
    }
    appliedPromoCode = promoCode;
  }

  // 3. Create Ride in DB
  const { data: ride, error } = await supabase
    .from('rides')
    .insert({
      rider_id: riderId,
      status: RIDE_STATUS.SEARCHING,
      ride_type: rideType,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      pickup_address: pickup.address,
      drop_lat: drop.lat,
      drop_lng: drop.lng,
      drop_address: drop.address,
      distance: parseFloat(distance.toFixed(2)),
      estimated_fare: parseFloat(estimatedFare.toFixed(2)),
      promo_code: appliedPromoCode,
      requested_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return {
    rideId: ride.id,
    status: ride.status,
    riderId: ride.rider_id,
  };
};

/**
 * Service: Get Ride by ID
 */
const getRideById = async (rideId) => {
  const { data: ride, error } = await supabase
    .from('rides')
    .select(`
      *,
      driver:driver_id (
        *,
        user:user_id (name, phone, role)
      ),
      rider:rider_id (name, phone)
    `)
    .eq('id', rideId)
    .single();

  if (error) {
    throw new Error('Ride not found');
  }

  return {
    ride,
    driver: ride.driver || null,
  };
};

/**
 * Service: Update Ride Status
 */
const updateRideStatus = async (rideId, userId, userRole, newStatus) => {
  // 1. Fetch current ride
  const { data: ride, error: fetchError } = await supabase
    .from('rides')
    .select('*')
    .eq('id', rideId)
    .single();

  if (fetchError || !ride) {
    throw new Error('Ride not found');
  }

  // 2. Validate State Transitions & Permissions
  const currentStatus = ride.status;

  // Rider Cancellation
  if (newStatus === RIDE_STATUS.CANCELLED) {
    if (userRole === 'rider' && ride.rider_id !== userId) {
      throw new Error('Unauthorized');
    }
    // Drivers can also cancel logic can be added here if needed, but requirements say "Rider can only cancel" for the PATCH logic 
    // Wait, prompt says "Rider can only cancel". This implies Rider can perform 'cancelled' status update.
    // Does it imply Driver CANNOT cancel?
    // Prompt: "Driver can update ride status. Rider can only cancel"
    // So if Rider calls this, newStatus MUST be 'cancelled'.
    if (userRole === 'rider' && newStatus !== RIDE_STATUS.CANCELLED) {
      throw new Error('Riders can only cancel rides');
    }
  } else {
    // For other statuses (accepted, arriving, started, completed), it must be a Driver
    if (userRole !== 'driver') {
      throw new Error('Only drivers can update status to ' + newStatus);
    }
    // Check if the driver is the assigned driver (unless accepting)
    if (newStatus === RIDE_STATUS.ACCEPTED) {
       // Driver accepting request
       if (currentStatus !== RIDE_STATUS.SEARCHING) {
         throw new Error('Ride is not available for acceptance');
       }
       // Assign driver
       const { error: updateError } = await supabase
         .from('rides')
         .update({ 
            status: newStatus,
            driver_id: userId,
            accepted_at: new Date().toISOString()
         })
         .eq('id', rideId);
        
       if (updateError) throw updateError;
       return { success: true, newStatus };
    }

    // For subsequent statuses, verify driver ownership
    if (ride.driver_id !== userId) {
      throw new Error('Not authorized for this ride');
    }
  }

  // Validate lifecycle flow
  // searching -> accepted
  // accepted -> arriving
  // arriving -> started
  // started -> completed
  // * -> cancelled
  
  const validTransitions = {
    [RIDE_STATUS.SEARCHING]: [RIDE_STATUS.ACCEPTED, RIDE_STATUS.CANCELLED],
    [RIDE_STATUS.ACCEPTED]: [RIDE_STATUS.ARRIVING, RIDE_STATUS.CANCELLED],
    [RIDE_STATUS.ARRIVING]: [RIDE_STATUS.STARTED, RIDE_STATUS.CANCELLED],
    [RIDE_STATUS.STARTED]: [RIDE_STATUS.COMPLETED], // Cancelled during ride? maybe.
    [RIDE_STATUS.COMPLETED]: [],
    [RIDE_STATUS.CANCELLED]: [],
  };

  if (!validTransitions[currentStatus].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }

  const updates = { status: newStatus };
  if (newStatus === RIDE_STATUS.STARTED) updates.started_at = new Date().toISOString();
  if (newStatus === RIDE_STATUS.COMPLETED) updates.completed_at = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('rides')
    .update(updates)
    .eq('id', rideId);

  if (updateError) {
    throw new Error(`Failed to update status: ${updateError.message}`);
  }

  return { success: true, newStatus };
};

module.exports = {
  getFareEstimate,
  requestRide,
  getRideById,
  updateRideStatus,
};
