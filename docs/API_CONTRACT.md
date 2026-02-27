API Contract Design - Uber Clone
This document serves as the Single Source of Truth for all API communication.

1. Auth & Profile
   Manage authentication (via Clerk) and user profiles.

# POST /auth/sync

Sync Clerk user data with backend database.

- Method: POST
- Body: { "email": string, "name": string, "clerk_id": string, "role": "rider" | "driver" }
- Response: { "success": boolean, "user": Object }
- Auth Required: Yes (Clerk Token)
- Role Access: All

# GET /profile

Fetch current user profile.

- Method: GET
- Response: { "id": string, "role": string, "profile": Object }
- Auth Required: Yes
- Role Access: All

# PATCH /profile

Update user/driver profile details.

- Method: PATCH
- Body: { "name"?: string, "phone"?: string, "vehicleDetails"?: Object }
- Response: { "success": boolean, "updatedProfile": Object }
- Auth Required: Yes
- Role Access: All

2. Ride Booking
   Core module for ride lifecycle.

# GET /rides/estimate

Get fare estimates and ETAs for different ride types.

- Method: GET
- Query: ?pickupLat=float&pickupLng=float&dropLat=float&dropLng=float
- Response: [{ "type": string, "price": number, "eta": number, "distance": number }]
- Auth Required: Yes
- Role Access: Rider

# POST /rides/request

Request a new ride.

- Method: POST
- Body: { "pickup": { "lat": float, "lng": float, "address": string }, "drop": { "lat": float, "lng": float, "address": string }, "rideType": string }
- Response: { "rideId": string, "status": "searching", "riderId": string }
- Auth Required: Yes
- Role Access: Rider

# GET /rides/:id

Fetch specific ride details and status.

- Method: GET
- Response: { "ride": Object, "driver": Object | null }
- Auth Required: Yes
- Role Access: Rider, Driver, Admin

# PATCH /rides/:id/status

Update ride status (Arriving, Started, Completed).

- Method: PATCH
- Body: { "status": "accepted" | "arriving" | "started" | "completed" | "cancelled" }
- Response: { "success": boolean, "newStatus": string }
- Auth Required: Yes
- Role Access: Driver, Rider (only for cancelling)

3. Driver Matching & Management

# GET /drivers/active-requests

Fetch nearby ride requests for an online driver.

- Method: GET
- Query: ?lat=float&lng=float
- Response: [{ "requestId": string, "distance": number, "fare": number, "pickup": Object }]
- Auth Required: Yes
- Role Access: Driver

# PATCH /drivers/status

Toggle driver online/offline status.

- Method: PATCH
- Body: { "status": "online" | "offline" }
- Response: { "success": boolean, "currentStatus": string }
- Auth Required: Yes
- Role Access: Driver

4. Payments
   Stripe integration endpoints.

# POST /payments/create-intent

Create a Stripe payment intent for a ride.

- Method: POST
- Body: { "rideId": string }
- Response: { "clientSecret": string, "amount": number }
- Auth Required: Yes
- Role Access: Rider

# GET /payments/history

Fetch transaction history for the user/driver.

- Method: GET
- Response: [{ "id": string, "amount": number, "date": string, "status": string }]
- Auth Required: Yes
- Role Access: All

5. Ratings, Promo & SOS

# POST /rides/:id/rate

Rate the driver/rider after a trip.

- Method: POST
- Body: { "rating": number, "comment": string }
- Response: { "success": boolean }
- Auth Required: Yes
- Role Access: Both

# GET /promo/validate/:code

Validate a promo code.

- Method: GET
- Response: { "valid": boolean, "discount": number, "type": string }
- Auth Required: Yes
- Role Access: Rider

# POST /sos/alert

Trigger an emergency SOS alert.

- Method: POST
- Body: { "rideId": string, "location": { "lat": float, "lng": float } }
- Response: { "alertId": string, "status": "notified" }
- Auth Required: Yes
- Role Access: Rider, Driver

6. Realtime WebSocket Events (Socket.io)
   Bi-directional events for live tracking.

## Realtime Socket Events

```markdown
| Event Name         | Direction        | Payload                                    | Description                               |
| :----------------- | :--------------- | :----------------------------------------- | :---------------------------------------- |
| join_ride          | Client -> Server | { rideId: string }                         | Join a specific ride room for updates     |
| update_location    | Driver -> Server | { lat: float, lng: float, rideId: string } | Driver broadcasts live location           |
| location_changed   | Server -> Rider  | { lat: float, lng: float }                 | Realtime driver location update on map    |
| ride_status_update | Server -> Both   | { status: string, driverId?: string }      | Notify when ride status changes           |
| new_ride_request   | Server -> Driver | { request: object }                        | Notify nearby drivers of new ride request |
| chat_message       | Both -> Both     | { text: string, timestamp: string }        | In-app messaging between rider and driver |
```

7. Configuration & Summary
   Base URL: https://api.uber-clone.com/v1
   Content-Type: application/json
   Auth Header: Authorization: Bearer <clerk_jwt_token>
