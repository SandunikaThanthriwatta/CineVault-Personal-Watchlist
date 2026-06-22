import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { WatchlistStats } from "@/lib/types";

export async function GET() {
  const all = await prisma.watchlistItem.findMany({
    orderBy: { watchedAt: "desc" },
  });

  // Infer the row type directly from the query result
  type DBItem = (typeof all)[number];

  const watched = all.filter((i: DBItem) => i.watched);
  const movies = all.filter((i: DBItem) => i.mediaType === "movie");
  const tvShows = all.filter((i: DBItem) => i.mediaType === "tv");

  const genreTotal: Record<string, number> = {};
  const genreWatched: Record<string, number> = {};

  all.forEach((item: DBItem) => {
    try {
      const genres: string[] = JSON.parse(item.genres);
      genres.forEach((g: string) => {
        genreTotal[g] = (genreTotal[g] ?? 0) + 1;
        if (item.watched) genreWatched[g] = (genreWatched[g] ?? 0) + 1;
      });
    } catch { /* skip */ }
  });

  const topGenres = Object.entries(genreTotal)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([genre, total]) => ({
      genre,
      total,
      watched: genreWatched[genre] ?? 0,
      unwatched: total - (genreWatched[genre] ?? 0),
    }));

  const favoriteGenre =
    Object.entries(genreWatched).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const rated = all.filter((i: DBItem) => i.rating !== null);
  const averageRating =
    rated.length > 0
      ? Math.round(
          (rated.reduce((sum: number, i: DBItem) => sum + (i.rating ?? 0), 0) /
            rated.length) *
            10
        ) / 10
      : null;

  const recentlyWatched = watched.slice(0, 10).map((i: DBItem) => ({
    title: i.title,
    watchedAt: i.watchedAt!.toISOString(),
    rating: i.rating,
    posterPath: i.posterPath,
  }));

  const stats: WatchlistStats = {
    total: all.length,
    watched: watched.length,
    unwatched: all.length - watched.length,
    movies: movies.length,
    tvShows: tvShows.length,
    averageRating,
    favoriteGenre,
    topGenres,
    recentlyWatched,
  };

  return NextResponse.json(stats);
}
