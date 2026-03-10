# UniClubs - University Events & Clubs Platform

A modern web platform connecting university students with clubs and events through a comprehensive booking and social system.

## Features

### Core Functionality
- **User Management**: Registration, authentication, profiles with interests
- **Organization System**: Club creation, member management, admin approval workflow
- **Event Management**: Create, edit, publish events with capacity limits
- **Booking System**: Transaction-safe booking with status tracking
- **Real-time Chat**: Event-based chat rooms for confirmed attendees
- **File Uploads**: Avatars, organization logos, event covers
- **AI Moderation**: Content flagging for inappropriate chat messages
- **Public API**: REST API with API keys, rate limiting, and documentation

### Technical Features
- **Multi-language**: English, French, Arabic with RTL support
- **Advanced Permissions**: Role-based access control (RBAC)
- **Real-time Features**: WebSocket-based chat and notifications
- **Health Monitoring**: Service health checks and backup procedures
- **Docker Deployment**: One-command startup with reverse proxy

## Tech Stack

### Frontend
- **Next.js** (React + TypeScript)
- **Tailwind CSS** + shadcn/ui components
- **next-intl** for internationalization (EN/FR/AR)
- **RTL support** for Arabic

### Backend
- **NestJS** (TypeScript)
- **JWT authentication** with refresh tokens
- **WebSocket gateway** (socket.io)
- **Swagger/OpenAPI** documentation
- **Rate limiting** and security middleware

### Database
- **PostgreSQL** with connection pooling
- **Prisma ORM** with migrations
- **Transaction-safe operations**

### Infrastructure
- **Docker Compose** for local development
- **Caddy** reverse proxy with HTTPS
- **Automated backups** and restore procedures

## Project Structure

```
uniclubs/
├── frontend/          # Next.js application
├── backend/           # NestJS API server
├── database/          # Prisma schema & migrations
├── docs/             # Documentation
├── scripts/          # Deployment & utility scripts
├── docker-compose.yml
├── .env.example
└── README.md
```

## Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Setup
```bash
# Clone repository
git clone <repository-url>
cd uniclubs

# Start all services
docker-compose up -d

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Setup database
cd ../backend
npx prisma migrate dev
npx prisma generate

# Start development servers
npm run dev  # Backend
cd ../frontend
npm run dev  # Frontend
```

## API Documentation

Available at `http://localhost:3001/api` when running in development.

## Deployment

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Team Roles

- **Authentication Engineer**: User management, JWT, RBAC
- **Organization & Events Engineer**: Clubs, events, bookings
- **Moderation Engineer**: AI moderation, recommendations
- **Chat System Engineer**: Real-time chat, WebSocket integration
- **Frontend Engineer**: UI/UX, internationalization, integration

## License

MIT
