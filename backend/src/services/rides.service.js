const { Pool } = require('pg');

// Initialize Pool
const pool = new Pool();

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
      eta: Math.ceil(durationMins), 
      // API Contract: response: [{ "type": string, "price": number, "eta": number, "distance": number }]
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
    const promoQuery = 'SELECT * FROM promo_codes WHERE code = $1';
    const { rows: promoRows } = await pool.query(promoQuery, [promoCode]);

    if (promoRows.length === 0) {
      throw new Error('Invalid promo code');
    }
    const promo = promoRows[0];
    
    // Check expiration using DB timestamp comparison or JavaScript
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) throw new Error('Promo code expired');
    if (typeof promo.is_active !== 'undefined' && !promo.is_active) throw new Error('Promo code is inactive');

    if (promo.type === 'percentage') {
       estimatedFare = estimatedFare * (1 - promo.discount / 100);
    } else if (promo.type === 'fixed') {
       estimatedFare = Math.max(0, estimatedFare - promo.discount);
    }
    appliedPromoCode = promoCode;
  }

  // 3. Create Ride in DB
  const insertQuery = `
    INSERT INTO rides (
      rider_id, status, ride_type, 
      pickup_lat, pickup_lng, pickup_address,
      drop_lat, drop_lng, drop_address,
      distance, estimated_fare, promo_code, requested_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
    RETURNING id, status, rider_id;
  `;
  const values = [
    riderId, RIDE_STATUS.SEARCHING, rideType,
    pickup.lat, pickup.lng, pickup.address,
    drop.lat, drop.lng, drop.address,
    parseFloat(distance.toFixed(2)), parseFloat(estimatedFare.toFixed(2)), appliedPromoCode
  ];

  const { rows } = await pool.query(insertQuery, values);
  const ride = rows[0];

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
  const query = `
    SELECT 
      r.*,
      row_to_json(d.*) as driver,
      row_to_json(u.*) as rider
    FROM rides r
    LEFT JOIN users d ON r.driver_id = d.id
    LEFT JOIN users u ON r.rider_id = u.id
    WHERE r.id = $1
  `;
  const { rows } = await pool.query(query, [rideId]);

  if (rows.length === 0) {
    throw new Error('Ride not found');
  }

  // The simplified join returns null for driver if driver_id is null
  return rows[0];
};

/**
 * Service: Update Ride Status
 */
const updateRideStatus = async (rideId, userId, userRole, newStatus) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Fetch current ride
    const rideQuery = 'SELECT * FROM rides WHERE id = $1 FOR UPDATE';
    const { rows: rides } = await client.query(rideQuery, [rideId]);

    if (rides.length === 0) {
      throw new Error('Ride not found');
    }
    const ride = rides[0];
    const currentStatus = ride.status;

    // 2. Validate State Transitions & Permissions
    // Rider Cancellation
    if (newStatus === RIDE_STATUS.CANCELLED) {
      // Logic from before: rider can cancel only their own ride.
       if (userRole === 'rider' && ride.rider_id !== userId) {
         throw new Error('Unauthorized');
       }
       if (userRole === 'rider' && newStatus !== RIDE_STATUS.CANCELLED) {
         throw new Error('Riders can only cancel rides');
       }
    } else {
      // Driver updates
      if (userRole !== 'driver') {
        throw new Error('Only drivers can update status to ' + newStatus);
      }
      
      // Accepting a ride
      if (newStatus === RIDE_STATUS.ACCEPTED) {
         if (currentStatus !== RIDE_STATUS.SEARCHING) {
           throw new Error('Ride is not available for acceptance');
         }
         // Assign driver
         await client.query(
           'UPDATE rides SET status = $1, driver_id = $2, accepted_at = NOW() WHERE id = $3',
           [newStatus, userId, rideId]
         );
         await client.query('COMMIT');
         return { success: true, newStatus };
      }

      // Other updates (Arriving, Started, Completed)
      // Check if this user is the assigned driver
      if (ride.driver_id !== userId) {
        throw new Error('Not authorized for this ride');
      }
    }

    const validTransitions = {
      [RIDE_STATUS.SEARCHING]: [RIDE_STATUS.ACCEPTED, RIDE_STATUS.CANCELLED],
      [RIDE_STATUS.ACCEPTED]: [RIDE_STATUS.ARRIVING, RIDE_STATUS.CANCELLED],
      [RIDE_STATUS.ARRIVING]: [RIDE_STATUS.STARTED, RIDE_STATUS.CANCELLED],
      [RIDE_STATUS.STARTED]: [RIDE_STATUS.COMPLETED], 
      [RIDE_STATUS.COMPLETED]: [],
      [RIDE_STATUS.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    // Build update query
    let updateQuery = 'UPDATE rides SET status = $1';
    const updateValues = [newStatus];
    let valueIndex = 2;

    if (newStatus === RIDE_STATUS.STARTED) {
      updateQuery += `, started_at = NOW()`;
    }
    if (newStatus === RIDE_STATUS.COMPLETED) {
      updateQuery += `, completed_at = NOW()`;
    }

    updateQuery += ` WHERE id = $${valueIndex}`;
    updateValues.push(rideId);

    await client.query(updateQuery, updateValues);
    await client.query('COMMIT');

    return { success: true, newStatus };

  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = {
  getFareEstimate,
  requestRide,
  getRideById,
  updateRideStatus,
};
