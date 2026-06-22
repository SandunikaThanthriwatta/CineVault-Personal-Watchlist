import axios from "axios";
import type { TMDBMovie, TMDBMovieDetail, MediaType } from "./types";

const BASE_URL = "https://api.themoviedb.org/3";
export const IMG_BASE = "https://image.tmdb.org/t/p";

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: { api_key: process.env.TMDB_API_KEY },
});

export const GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News",
  10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap",
  10767: "Talk", 10768: "War & Politics",
};

// Reverse map: genre name → id (used to pass genre IDs to TMDB discover)
export const GENRE_NAME_TO_ID: Record<string, number> = Object.fromEntries(
  Object.entries(GENRES).map(([id, name]) => [name, Number(id)])
);

export interface PagedResult {
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
  page: number;
}

// Trending — no genre filtering available on this endpoint
export async function getTrending(type: MediaType | "all" = "all", page = 1): Promise<PagedResult> {
  const { data } = await tmdb.get(`/trending/${type}/week`, { params: { page } });
  return {
    results: data.results,
    total_pages: Math.min(data.total_pages, 500),
    total_results: data.total_results,
    page: data.page,
  };
}

// Discover with optional genre — returns paginated results
export async function discover(
  type: "movie" | "tv",
  genreId: number | null,
  page = 1
): Promise<PagedResult> {
  const params: Record<string, unknown> = {
    sort_by: "popularity.desc",
    include_adult: false,
    page,
  };
  if (genreId) params.with_genres = genreId;

  const { data } = await tmdb.get(`/discover/${type}`, { params });

  // Tag each result with media_type so the card renders correctly
  const results = (data.results as TMDBMovie[]).map((m) => ({ ...m, media_type: type }));
  return {
    results,
    total_pages: Math.min(data.total_pages, 500),
    total_results: data.total_results,
    page: data.page,
  };
}

// Search — type determines which TMDB endpoint to call
export async function search(
  query: string,
  type: MediaType | "all" = "all",
  page = 1
): Promise<PagedResult> {
  if (type === "all") {
    const { data } = await tmdb.get("/search/multi", {
      params: { query, include_adult: false, page },
    });
    return {
      results: (data.results as TMDBMovie[]).filter(
        (r) => r.media_type === "movie" || r.media_type === "tv"
      ),
      total_pages: Math.min(data.total_pages, 500),
      total_results: data.total_results,
      page: data.page,
    };
  }

  const { data } = await tmdb.get(`/search/${type}`, {
    params: { query, include_adult: false, page },
  });
  const results = (data.results as TMDBMovie[]).map((m) => ({ ...m, media_type: type }));
  return {
    results,
    total_pages: Math.min(data.total_pages, 500),
    total_results: data.total_results,
    page: data.page,
  };
}

export async function getMovieDetail(id: number, type: MediaType): Promise<TMDBMovieDetail> {
  const { data } = await tmdb.get(`/${type}/${id}`, {
    params: { append_to_response: "credits,videos,similar" },
  });
  return data;
}
