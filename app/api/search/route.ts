import { NextRequest, NextResponse } from "next/server";
import { getTrending, discover, search, GENRE_NAME_TO_ID } from "@/lib/tmdb";
import type { MediaType } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q") ?? "";
  const genre = searchParams.get("genre") ?? "";
  const type = (searchParams.get("type") ?? "all") as MediaType | "all";
  const page = Number(searchParams.get("page") ?? "1");

  try {
    // --- Search mode ---
    if (query) {
      const data = await search(query, type, page);
      return NextResponse.json(data);
    }

    // --- Browse mode: genre filter via discover ---
    if (genre) {
      const genreId = GENRE_NAME_TO_ID[genre] ?? null;
      // For "all", fetch movies and TV in parallel and interleave by popularity
      if (type === "all") {
        const [movies, tv] = await Promise.all([
          discover("movie", genreId, page),
          discover("tv", genreId, page),
        ]);
        const interleaved = interleave(movies.results, tv.results);
        return NextResponse.json({
          results: interleaved,
          total_pages: Math.max(movies.total_pages, tv.total_pages),
          total_results: movies.total_results + tv.total_results,
          page,
        });
      }
      const data = await discover(type as "movie" | "tv", genreId, page);
      return NextResponse.json(data);
    }

    // --- Default: trending ---
    const data = await getTrending(type, page);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}

// Interleave two arrays evenly: [m1, tv1, m2, tv2, ...]
function interleave<T>(a: T[], b: T[]): T[] {
  const result: T[] = [];
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (i < a.length) result.push(a[i]);
    if (i < b.length) result.push(b[i]);
  }
  return result;
}
