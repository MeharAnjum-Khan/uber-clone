You are now acting as a Senior Software Architect + Full Stack Engineer + DevOps Expert.

Your task is to build a production-ready full-stack Uber Clone based strictly on the PRD provided below.

⚠️ You must follow a professional AI-driven development workflow used by senior developers.

You must build the system in structured phases so that:

* Frontend
* Backend
* Database
* Realtime
* Payments
* Deployment

are fully synced and production-ready.

🚨 IMPORTANT RULES:

* Do NOT generate backend directly after frontend.
* FIRST create API CONTRACT (Single Source of Truth).
* Backend must be built ONLY from API contract.
* Then frontend integration must follow contract.
* Avoid assumption-based generation.
* GLOBAL UI DESIGN SYSTEM (Uber Inspired)
* Declare Font-Family Globally , use "Inter" font-family.
* The app should be responsive on all devices- mobile, tablet, desktop.

---

📦 MONO-REPO & GITHUB STRUCTURE (ADDED RULE)

The project must follow a mono-repo architecture.

Inside a single GitHub repository:

Root Folder → uber-clone-app

It must contain:

/uber-clone-frontend
/uber-clone-backend

Each must be independently deployable.

AI must generate:

✔ Proper folder structure
✔ Shared environment handling
✔ Clear separation of concerns

---

📄 README.md REQUIREMENTS (ADDED RULE)

AI must generate professional README.md files for:

1. Root README.md
2. Frontend README.md
3. Backend README.md

Root README.md must include:

✔ Project Overview
✔ Features
✔ Tech Stack
✔ Mono-repo Structure
✔ Setup Instructions
✔ Environment Variables
✔ Deployment Steps
✔ Architecture Summary

Frontend README.md must include:

✔ Setup
✔ Env Variables
✔ Map Integration
✔ Clerk Setup
✔ UI Notes

Backend README.md must include:

✔ API Overview
✔ Database Setup
✔ WebSocket Setup
✔ Stripe Setup
✔ Deployment Steps

README files must be generated during the final phase.

---

Frontend:
Next.js + React
Tailwind CSS

Auth:
Clerk

Backend:
Node.js + Express

Database:
PostgreSQL (via Supabase)

Realtime:
WebSockets (Socket.io)

Payments:
Stripe

Maps:
Leaflet + OpenStreetMap

Deployment:
Frontend → Vercel
Backend → Render

* Rider & Driver Authentication
* Ride Booking
* Driver Matching
* Live Ride Tracking
* Fare Estimation
* Stripe Payments
* Ride History
* Ratings & Reviews
* Multi-stop rides
* Promo Codes
* SOS
* Support System

Follow this exact sequence:

PHASE 1 → SYSTEM ARCHITECTURE

Break project into:

* Modules
* User Roles
* Pages
* Features
* Backend Services
* Database Entities
* External Integrations

Generate:
✔ App Architecture
✔ Role Flows (Rider / Driver / Admin)
✔ Feature Mapping

---

PHASE 2 → UI BLUEPRINT

Generate:

* Page List
* Component Structure
* Dashboard Layouts
* State Requirements per page

DO NOT build backend yet.

---

PHASE 3 → DATA REQUIREMENT EXTRACTION

From UI flows, define:

* What data each screen needs
* What actions each screen performs

---

PHASE 4 → 🔗 API CONTRACT DESIGN (CRITICAL STEP)

Create API Specification for:

Auth
Profile
Ride Booking
Driver Matching
Realtime Updates
Payments
Ratings
History
Promo
SOS
Support

For EACH endpoint define:

Route
Method
Request Body
Response Format
Auth Required
Role Access

Output must be structured like:

POST /rides/request
Body: { pickup, drop, rideType }
Response: { rideId, driver, eta }

This becomes SYSTEM SOURCE OF TRUTH.

---

PHASE 5 → DATABASE DESIGN

Design PostgreSQL schema:

Users
Drivers
Rides
Payments
Reviews
PromoCodes
SOS
SupportTickets

Include:

Relations
Indexes
Foreign Keys

---

PHASE 6 → BACKEND GENERATION

Build Express backend STRICTLY from API CONTRACT.

Generate:

Routes
Controllers
Services
Middlewares
WebSocket events

Include:

JWT auth via Clerk
Ride lifecycle logic
Driver matching
Fare calculation

---

PHASE 7 → REALTIME SYSTEM

Design ride status updates:

Requested
Accepted
Arriving
Started
Completed

Define WebSocket events.

---

PHASE 8 → STRIPE PAYMENT FLOW

Implement:

Ride payment
Driver payout logic
Webhook handling

---

PHASE 9 → FRONTEND INTEGRATION

Now connect UI with APIs.

Generate:

API service layer
State sync
Protected routes

---

PHASE 10 → GOOGLE MAPS / LEAFLET INTEGRATION

Add:

Pickup selection
Route display
Driver tracking

---

PHASE 11 → SECURITY

Secure:

Payments
Endpoints
Role Access

---

PHASE 12 → DEPLOYMENT SETUP

Prepare for:

Frontend → Vercel
Backend → Render

Generate:

ENV setup
Build steps
Deployment configs

---

PHASE 13 → FINAL TESTING + DOCUMENTATION

Test flows:

Signup
Ride Booking
Driver Accept
Live Tracking
Payment
Rating

Also generate:

✔ Root README.md
✔ Frontend README.md
✔ Backend README.md

---

Today: Feb 24
Deadline: March 9

Generate a daily build roadmap mapping:

Each day → features + backend + DB + UI

Ensure:

✔ Fully working system by deadline
✔ No incomplete integrations

Always complete one phase before moving to next.

Do NOT skip API CONTRACT phase.

Do NOT assume endpoints.

Everything must stay in sync.
