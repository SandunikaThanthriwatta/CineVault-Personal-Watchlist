# 🎬 CineVault — Personal Watchlist

A full-stack web app to discover, track, and rate movies and TV shows using the TMDB API.

## Features

- **Discover** trending movies and TV shows with pagination
- **Search** by title across movies and TV shows
- **Filter** by genre, media type, and watch status
- **Watchlist** — add titles, mark as watched, and give personal 1–5 star ratings
- **Movie Detail** — view cast, trailer, and similar title recommendations
- **Stats Dashboard** — charts showing watch progress, genre distribution, and recently watched

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | MUI v6 (Material UI) |
| Database | PostgreSQL + Prisma ORM |
| Data Fetching | TanStack Query v5 + Axios |
| Charts | Recharts |
| External API | TMDB (The Movie Database) |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL running locally

### Setup

1. Clone the repo
   ```bash
   git clone https://github.com/SandunikaThanthriwatta/CineVault--Personal-Watchlist.git
   cd CineVault--Personal-Watchlist
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create `.env.local` from the example
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your TMDB API key and PostgreSQL connection string.

4. Push the database schema
   ```bash
   npx prisma db push
   ```

5. Start the dev server
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
TMDB_API_KEY=your_tmdb_api_key
DATABASE_URL=postgresql://user@localhost:5432/watchlist
```

Get a free TMDB API key at [themoviedb.org](https://www.themoviedb.org/settings/api).
