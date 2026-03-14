UniClubs
ft_transcendence — Final Technical Architecture, Roles & Module Strategy (Team of 5)

1. Project Definition
UniClubs is a Social & Collaborative multi-user web application that enables:
	•	Users to register and manage profiles
	•	Users to discover events and book seats (capacity-controlled)
	•	Organizations to be created via approval workflow
	•	Organization admins to publish/manage events
	•	Event-scoped real-time chat for attendees
	•	Organization dashboard to track events & attendance
The system enforces:
	•	Strict server-side RBAC (roles + permissions)
	•	Concurrency-safe booking logic (no overbooking)
	•	Event-based chat isolation (only attendees)
	•	Secure authentication & validation
	•	Dockerized deployment with HTTPS

2. Real-Time Chat Model (Event-Based)
Each event has a dedicated WebSocket room:
event:<eventId>
Only users with a CONFIRMED booking may:
	•	Join the event room
	•	Send/receive messages
	•	Read paginated chat history
If:
	•	Booking cancelled → access revoked
	•	Event cancelled → room closed/read-only
Messages are stored in DB with cursor pagination.
✅ Satisfies Real-Time Features (Major).

3. Organization Dashboard
Each organization includes a dashboard for admins:
	•	Events list (draft/published/cancelled)
	•	Attendees count per event
	•	Capacity remaining per event
	•	Booking status breakdown (confirmed/pending/cancelled)
	•	Basic trend (bookings over time)
✅ Strengthens Organization System (Major) and improves product credibility.

4. File Upload System (Minor Module)
Uploads supported:
	•	User avatars
	•	Organization logos
	•	Event cover images
Rules:
	•	Type validation (png/jpg/webp)
	•	Size limits
	•	Secure storage + URL stored in DB
	•	Optional: delete/replace support
✅ Counts as File Upload (Minor).

5. Public API (Major Module)
Expose a documented REST API with:
	•	API key secured access for public endpoints
	•	Rate limiting
	•	Swagger/OpenAPI documentation
	•	At least 5 endpoints (events, bookings, orgs, users, chat history)
✅ Counts as Public API (Major).

6. Technical Stack (Locked)
Frontend
	•	Next.js (React + TypeScript)
	•	Tailwind CSS + shadcn/ui
	•	next-intl (EN/FR/AR)
	•	RTL support
Backend
	•	NestJS (TypeScript)
	•	JWT auth
	•	bcrypt/argon2
	•	class-validator
	•	WebSocket gateway (socket.io)
	•	Swagger docs
	•	Rate limiting (throttler)
Database
	•	PostgreSQL
	•	Prisma ORM + migrations
	•	Transaction-safe booking logic
Infrastructure / DevOps
	•	Docker Compose (one command startup)
	•	Caddy reverse proxy (HTTPS)
	•	Healthchecks for services
	•	.env ignored + .env.example
	•	Backup + restore procedure (script + docs)

7. Module Strategy & Points (High Safety)
Web
	•	Major (2) Frameworks (FE+BE)
	•	Major (2) Real-time (WebSockets)
	•	Major (2) User interaction (Chat + Profiles + Friends)
	•	Major (2) Public API (API key + rate limiting + docs)
	•	Minor (1) ORM
	•	Minor (1) File upload
	•	Minor (1) NotificationsSubtotal: 11
User Management
	•	Major (2) Standard user management
	•	Major (2) Advanced permissions
	•	Major (2) Organization systemSubtotal: 6
AI
	•	Minor (1) Content moderation AI (chat flagging)Subtotal: 1
Accessibility
	•	Minor (1) Multi-language
	•	Minor (1) RTLSubtotal: 2
DevOps
	•	Minor (1) Healthchecks + backup/restoreSubtotal: 1
✅ Total target: 21 pointsEven if one module is not accepted, you remain safely above the minimum.

8. System Architecture Overview
Frontend Pages
	•	Login / Register
	•	Profile + avatar upload
	•	Interests onboarding
	•	Events feed (filters + pagination)
	•	Event details + booking
	•	My bookings
	•	Event chat (attendees only)
	•	Organization area (request + management)
	•	Organization dashboard (tracking)
	•	Admin approval panel
Backend Modules
	•	Auth
	•	Users (profile, interests, friends)
	•	Organizations + Requests
	•	Events
	•	Bookings
	•	Event Chat (WS + history)
	•	Uploads
	•	Notifications
	•	Public API key + rate limiting
Database Core Tables
	•	users
	•	interests + user_interests
	•	organizations
	•	organization_requests
	•	organization_members
	•	events + event_tags
	•	bookings
	•	event_chat_messages
	•	notifications
	•	friends / friend_requests
	•	uploads (or urls on entities)
	•	api_keys
Critical constraints:
	•	Unique booking per (userId, eventId)
	•	Capacity enforced with DB transaction / atomic update
	•	FK integrity + indexes for feed + chat pagination

9. Technical Roles (Validated Final Distribution)
Each engineer owns a subsystem end-to-end:
	•	Architecture design
	•	Implementation
	•	Integration
	•	Testing
	•	Documentation
	•	Evaluation explanation
Subsystems interact only through clearly defined APIs.

ROLE 1 — Authentication & Identity Engineer (Rabi3)
Owns:
	•	Backend server bootstrap
	•	Signup / login / logout
	•	JWT access token + refresh token flow
	•	Password hashing (bcrypt / argon2)
	•	Authentication guards
	•	Role-based access control (RBAC utilities)
	•	Identity middleware
	•	User profile endpoints
	•	User interests storage
Delivers:
	•	/auth/*
	•	/users/*
	•	Token refresh system
	•	Secure identity layer used across all modules
Modules Covered:
	•	Standard User Management (Major)
	•	Advanced Permissions (Major)

ROLE 2 — Organization, Events & Booking Engineer (Mouad)
Owns:
	•	Organization request + Super Admin approval workflow
	•	Organization creation after approval
	•	Organization members (ADMIN / MEMBER)
	•	Event lifecycle:
	•	Create
	•	Edit
	•	Publish
	•	Cancel
	•	Event scheduling (date / time / location)
	•	Capacity configuration
	•	Booking flow + status transitions
	•	Booking cancellation logic
	•	Organization dashboard endpoints (tracking events & attendance)
Delivers:
	•	/orgs/*
	•	/events/*
	•	/bookings/*
	•	/admin/org-requests/*
	•	/org-dashboard/*
Modules Covered:
	•	Organization System (Major)
	•	Notifications (Minor)

ROLE 3 — Moderation & Recommendation Engineer (Prizmo)
Owns:
	•	Chat moderation pipeline:
	•	Message validation
	•	Flagging inappropriate content
	•	Hide / warn logic
	•	AI moderation logic (if implemented)
	•	Recommendation API:
	•	Fetch events based on user interests
	•	Match event tags with user interests
	•	Apply filters (availability, date, etc.)
Delivers:
	•	/moderation/*
	•	/events/recommended
Important Boundary:
	•	Does NOT manage event CRUD.
	•	Reads events and user interests only.
	•	Chat system calls moderation service before message persistence.
Modules Covered:
	•	AI Moderation (Minor)

ROLE 4 — Full Chat System Engineer (Safae)
Owns the Entire Event-Based Chat Subsystem

1️⃣ Real-Time Backend (WebSocket Layer)
	•	WebSocket gateway implementation
	•	Event-based rooms:
	•	event:<eventId>
	•	Join validation:
	•	User authenticated
	•	Booking status = CONFIRMED
	•	Message broadcasting
	•	Disconnect/reconnect handling
	•	Prevent unauthorized access
	•	Integration with moderation service

2️⃣ Chat Persistence Layer (Database)
	•	event_chat_messages table
	•	Indexing strategy for performance
	•	Cursor-based pagination
	•	Message moderation status fields (if needed)
	•	Query optimization for chat history

3️⃣ Chat REST API
	•	/chat/history?eventId=...
	•	Paginated retrieval
	•	Authorization validation

4️⃣ Chat Frontend (UI Only)
	•	Chat component
	•	WebSocket client integration
	•	Real-time message rendering
	•	Infinite scroll pagination
	•	Moderated message display rules
	•	Chat entry points:
	•	Event Details page
	•	My Bookings page

Chat Rules (Final)
	•	Chat is event-based, not organization-wide.
	•	Chat is available for upcoming events.
	•	Access granted only when booking is CONFIRMED.
	•	Only attendees can participate.

Modules Covered:
	•	Real-Time Features (Major)
	•	User Interaction (Major — chat part)
	•	AI Moderation Integration

ROLE 5 — Frontend Architecture Engineer (Mr. Bit)
Owns the Entire Application Frontend (Except Chat Backend Logic)

1️⃣ Application Structure
	•	Next.js architecture
	•	Routing & layout system
	•	State management
	•	Role-based UI rendering

2️⃣ Core Pages
	•	Login / Register
	•	Profile + avatar upload
	•	Interests onboarding
	•	Events feed
	•	Event details
	•	Booking interface
	•	Organization area
	•	Organization dashboard
	•	Admin approval panel

3️⃣ Upload UI
	•	Avatar upload
	•	Organization logo upload
	•	Event cover upload

4️⃣ Internationalization
	•	EN / FR / AR support
	•	RTL layout
	•	Accessibility compliance

5️⃣ Integration
	•	Connect to backend APIs
	•	Integrate chat UI provided by Safae
	•	Handle API errors
	•	Ensure zero console errors

Modules Covered:
	•	Frontend Framework (Major)
	•	Multi-language (Minor)
	•	RTL (Minor)
	•	File Upload (Minor — frontend integration)

10. Non-Negotiable Requirements
	•	Multi-user concurrent usage
	•	Server-side permission enforcement
	•	Front + back validation
	•	Zero console errors
	•	HTTPS everywhere
	•	Terms of Service + Privacy Policy pages
	•	One-command Docker startup

