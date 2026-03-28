# ft_transcendence - UniClubs

A full-stack application for discovering and managing university club events.

## Project Structure

```
ft_transcendence/
├── front/          # Next.js 16 frontend (App Router)
├── backend/        # Backend API
├── supabase/       # Supabase configuration & migrations
├── moderation/     # Content moderation service
└── docker-compose.yml
```

## Frontend

The frontend is a Next.js 16 application located in the `front/` directory.

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase
- **State Management**: React Query

### Running the Frontend

```bash
cd front
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

See `front/README.md` for detailed setup instructions.

## Backend

The backend API is located in the `backend/` directory.

## Development

### Prerequisites
- Node.js 18+
- Docker (for Supabase local development)

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values.

## License

MIT
