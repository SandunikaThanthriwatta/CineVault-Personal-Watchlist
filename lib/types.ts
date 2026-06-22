export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string; // TV shows
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: "movie" | "tv";
}

export interface TMDBMovieDetail extends Omit<TMDBMovie, "genre_ids"> {
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  tagline?: string;
  status: string;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
  };
  videos?: {
    results: { key: string; site: string; type: string; name: string }[];
  };
  similar?: {
    results: TMDBMovie[];
  };
}

export interface WatchlistStats {
  total: number;
  watched: number;
  unwatched: number;
  movies: number;
  tvShows: number;
  averageRating: number | null;
  favoriteGenre: string | null;
  topGenres: { genre: string; total: number; watched: number; unwatched: number }[];
  recentlyWatched: { title: string; watchedAt: string; rating: number | null; posterPath: string | null }[];
}

export interface WatchlistItem {
  id: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  mediaType: string;
  overview: string | null;
  genres: string; // JSON
  voteAverage: number | null;
  releaseDate: string | null;
  watched: boolean;
  rating: number | null;
  addedAt: string;
  watchedAt: string | null;
}

export type MediaType = "movie" | "tv";
export type FilterStatus = "all" | "watched" | "unwatched";
