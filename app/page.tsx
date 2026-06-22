"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useDebounce } from "@/lib/hooks";
import MovieCard from "@/components/MovieCard";
import MovieModal from "@/components/MovieModal";
import FilterBar from "@/components/FilterBar";
import type { TMDBMovie, WatchlistItem, MediaType } from "@/lib/types";
import type { PagedResult } from "@/lib/tmdb";
import { GENRES } from "@/lib/tmdb";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [mediaType, setMediaType] = useState<MediaType | "all">("all");
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 400);
  const qc = useQueryClient();

  const resetFilters = () => {
    setPage(1);
    setSelectedGenre("");
    setMediaType("all");
  };

  const handleQueryChange = (v: string) => {
    setQuery(v);
    resetFilters();
  };

  // All filters go into the query key so React Query refetches on any change
  const { data, isFetching } = useQuery<PagedResult>({
    queryKey: ["search", debouncedQuery, mediaType, selectedGenre, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (mediaType !== "all") params.set("type", mediaType);
      if (selectedGenre) params.set("genre", selectedGenre);
      params.set("page", String(page));
      return axios.get(`/api/search?${params}`).then((r) => r.data);
    },
  });

  const movies = data?.results ?? [];
  const totalPages = data?.total_pages ?? 1;

  // Genres available from the current result set for the filter chips
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) =>
      (m.genre_ids ?? []).forEach((id) => {
        const name = GENRES[id];
        if (name) set.add(name);
      })
    );
    return Array.from(set).sort();
  }, [movies]);

  const { data: watchlist = [] } = useQuery<WatchlistItem[]>({
    queryKey: ["watchlist"],
    queryFn: async () => axios.get("/api/watchlist").then((r) => r.data),
  });

  const watchlistMap = Object.fromEntries(watchlist.map((w) => [w.tmdbId, w]));

  const addMutation = useMutation({
    mutationFn: (movie: TMDBMovie) => {
      const genreNames = (movie.genre_ids ?? []).map((id) => GENRES[id]).filter(Boolean);
      return axios.post("/api/watchlist", {
        tmdbId: movie.id,
        title: movie.title ?? movie.name,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        mediaType: movie.media_type ?? "movie",
        overview: movie.overview,
        genres: genreNames,
        voteAverage: movie.vote_average,
        releaseDate: movie.release_date ?? movie.first_air_date,
      });
    },
    onSuccess: (_, movie) => {
      qc.invalidateQueries({ queryKey: ["watchlist"] });
      setToast(`"${movie.title ?? movie.name}" added to your watchlist`);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/watchlist/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const toggleWatchedMutation = useMutation({
    mutationFn: ({ id, watched }: { id: string; watched: boolean }) =>
      axios.patch(`/api/watchlist/${id}`, { watched }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const rateMutation = useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number | null }) =>
      axios.patch(`/api/watchlist/${id}`, { rating }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  // Listen for similar-movie clicks from inside the modal
  useEffect(() => {
    const handler = (e: Event) => {
      setSelectedMovie((e as CustomEvent<TMDBMovie>).detail);
    };
    window.addEventListener("open-movie", handler);
    return () => window.removeEventListener("open-movie", handler);
  }, []);

  const heading = debouncedQuery
    ? `Results for "${debouncedQuery}"`
    : selectedGenre
      ? `${selectedGenre} · ${mediaType === "all" ? "All" : mediaType === "movie" ? "Movies" : "TV"}`
      : mediaType === "movie"
        ? "Trending Movies"
        : mediaType === "tv"
          ? "Trending TV Shows"
          : "Trending This Week";

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Title */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {heading}
      </Typography>

      {/* Search + media type on the same row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search movies & TV shows…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  {isFetching ? <CircularProgress size={20} /> : <SearchIcon />}
                </InputAdornment>
              ),
            },
          }}
          sx={{
            flex: "1 1 300px",
            maxWidth: 520,
            "& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
          }}
        />
        <ToggleButtonGroup
          value={mediaType}
          exclusive
          size="small"
          onChange={(_, v) => {
            if (v) { setMediaType(v); setPage(1); setSelectedGenre(""); }
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="movie">Movies</ToggleButton>
          <ToggleButton value="tv">TV</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Genre filter — chips derived from API response */}
      <FilterBar
        genres={availableGenres}
        selectedGenre={selectedGenre}
        onGenreChange={(g) => { setSelectedGenre(g); setPage(1); }}
        totalCount={movies.length}
      />

      {/* Movie grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(4, 1fr)",
            md: "repeat(6, 1fr)",
            lg: "repeat(10, 1fr)",
          },
          gap: 1.5,
          alignItems: "start",
          minHeight: 400,
        }}
      >
        {movies.map((movie) => {
          const item = watchlistMap[movie.id];
          const genres = (movie.genre_ids ?? []).map((id) => GENRES[id]).filter(Boolean);
          return (
            <MovieCard
              key={movie.id}
              movie={movie}
              genres={genres}
              watchlistItem={item}
              onAdd={() => addMutation.mutate(movie)}
              onRemove={() => item && removeMutation.mutate(item.id)}
              onToggleWatched={() =>
                item && toggleWatchedMutation.mutate({ id: item.id, watched: !item.watched })
              }
              onRate={(r) => item && rateMutation.mutate({ id: item.id, rating: r })}
              onOpenDetail={() => setSelectedMovie(movie)}
            />
          );
        })}
      </Box>

      {movies.length === 0 && !isFetching && (
        <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
          <Typography>No results found.</Typography>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => {
              setPage(v);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            color="primary"
            shape="rounded"
            siblingCount={2}
          />
        </Box>
      )}

      <MovieModal
        movie={selectedMovie}
        open={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        watchlistItem={selectedMovie ? watchlistMap[selectedMovie.id] : undefined}
        onAdd={() => selectedMovie && addMutation.mutate(selectedMovie)}
        onRemove={() => {
          const item = selectedMovie ? watchlistMap[selectedMovie.id] : null;
          if (item) removeMutation.mutate(item.id);
        }}
        onToggleWatched={() => {
          const item = selectedMovie ? watchlistMap[selectedMovie.id] : null;
          if (item) toggleWatchedMutation.mutate({ id: item.id, watched: !item.watched });
        }}
        onRate={(r) => {
          const item = selectedMovie ? watchlistMap[selectedMovie.id] : null;
          if (item) rateMutation.mutate({ id: item.id, rating: r });
        }}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setToast(null)} variant="filled">
          {toast}
        </Alert>
      </Snackbar>
    </Container>
  );
}
