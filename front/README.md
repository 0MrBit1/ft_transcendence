# UniClubs Frontend

A Next.js 16 application for discovering and managing university club events.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix primitives)
- **Database**: Supabase
- **State Management**: React Query (TanStack Query)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun

## Getting Started

### 1. Install dependencies

```bash
cd front
npm install
# or
bun install
```

### 2. Set up environment variables

Create a `.env.local` file in the `front` directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run the development server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
front/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup pages (user & org)
│   │   ├── events/             # Events listing & details
│   │   └── dashboard/          # User & Org dashboards
│   ├── components/
│   │   ├── landing/            # Landing page components
│   │   └── ui/                 # shadcn/ui components
│   ├── contexts/               # React contexts (Auth)
│   ├── providers/              # App providers wrapper
│   └── lib/
│       └── supabase/           # Supabase client & types
├── public/                     # Static assets
└── package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, featured events, categories |
| `/login` | User login with test accounts |
| `/signup` | Choose signup type (user or organization) |
| `/signup/user` | User registration |
| `/signup/organization` | Organization registration |
| `/events` | Browse all public events |
| `/events/[id]` | Event details and RSVP |
| `/dashboard` | User dashboard (events, orgs) |
| `/dashboard/org` | Organization dashboard (manage events, members) |

## Contributing

1. Create a feature branch from `front`
2. Make your changes
3. Test locally with `npm run dev`
4. Submit a pull request

## License

MIT
