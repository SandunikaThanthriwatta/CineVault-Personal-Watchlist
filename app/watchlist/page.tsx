"use client";

import { useMemo, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import FilterBar from "@/components/FilterBar";
import MovieCard from "@/components/MovieCard";
import MovieModal from "@/components/MovieModal";
import type { WatchlistItem, FilterStatus, MediaType, TMDBMovie } from "@/lib/types";

function watchlistToTMDB(item: WatchlistItem): TMDBMovie {
  return {
    id: item.tmdbId,
    title: item.mediaType === "movie" ? item.title : undefined,
    name: item.mediaType === "tv" ? item.title : undefined,
    overview: item.overview ?? "",
    poster_path: item.posterPath,
    backdrop_path: item.backdropPath,
    vote_average: item.voteAverage ?? 0,
    release_date: item.mediaType === "movie" ? (item.releaseDate ?? undefined) : undefined,
    first_air_date: item.mediaType === "tv" ? (item.releaseDate ?? undefined) : undefined,
    genre_ids: [],
    media_type: item.mediaType as "movie" | "tv",
  };
}

export default function WatchlistPage() {
  const [status, setStatus] = useState<FilterStatus>("all");
  const [mediaType, setMediaType] = useState<MediaType | "all">("all");
  const [genre, setGenre] = useState("");
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);
  const qc = useQueryClient();

  const { data: watchlist = [], isLoading } = useQuery<WatchlistItem[]>({
    queryKey: ["watchlist"],
    queryFn: () => axios.get("/api/watchlist").then((r) => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/watchlist/${id}`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["watchlist"] });
      if (selectedItem?.id === id) setSelectedItem(null);
    },
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

  // Collect all genres from watchlist
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    watchlist.forEach((item) => {
      try {
        const genres: string[] = JSON.parse(item.genres);
        genres.forEach((g) => set.add(g));
      } catch { /* skip */ }
    });
    return Array.from(set).sort();
  }, [watchlist]);

  const filtered = useMemo(() => {
    return watchlist.filter((item) => {
      if (status === "watched" && !item.watched) return false;
      if (status === "unwatched" && item.watched) return false;
      if (mediaType !== "all" && item.mediaType !== mediaType) return false;
      if (genre) {
        try {
          const genres: string[] = JSON.parse(item.genres);
          if (!genres.includes(genre)) return false;
        } catch { return false; }
      }
      return true;
    });
  }, [watchlist, status, mediaType, genre]);

  const watchedCount = watchlist.filter((i) => i.watched).length;
  const progress = watchlist.length > 0 ? (watchedCount / watchlist.length) * 100 : 0;

  if (isLoading) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <PlaylistAddCheckIcon sx={{ color: "primary.main", fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            My Watchlist
          </Typography>
        </Box>

        {watchlist.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {watchedCount} of {watchlist.length} watched
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
            <Tooltip title={`${watchedCount}/${watchlist.length} watched`}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(255,255,255,0.1)" }}
              />
            </Tooltip>
          </Box>
        )}

        {watchlist.length > 0 && (
          <FilterBar
            status={status}
            onStatusChange={setStatus}
            mediaType={mediaType}
            onMediaTypeChange={setMediaType}
            genres={allGenres}
            selectedGenre={genre}
            onGenreChange={setGenre}
            totalCount={filtered.length}
          />
        )}
      </Box>

      {watchlist.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 12, color: "text.secondary" }}>
          <PlaylistAddCheckIcon sx={{ fontSize: 64, opacity: 0.2, mb: 2 }} />
          <Typography variant="h6">Your watchlist is empty</Typography>
          <Typography variant="body2">
            Search for movies &amp; shows on the Discover page and add them here.
          </Typography>
        </Box>
      ) : (
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
          }}
        >
          {filtered.map((item) => {
            const genres: string[] = (() => {
              try { return JSON.parse(item.genres); } catch { return []; }
            })();
            return (
              <MovieCard
                key={item.id}
                movie={watchlistToTMDB(item)}
                genres={genres}
                watchlistItem={item}
                onRemove={() => removeMutation.mutate(item.id)}
                onToggleWatched={() =>
                  toggleWatchedMutation.mutate({ id: item.id, watched: !item.watched })
                }
                onRate={(r) => rateMutation.mutate({ id: item.id, rating: r })}
                onOpenDetail={() => setSelectedItem(item)}
              />
            );
          })}
        </Box>
      )}

      <MovieModal
        movie={selectedItem ? watchlistToTMDB(selectedItem) : null}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        watchlistItem={selectedItem ?? undefined}
        onRemove={() => selectedItem && removeMutation.mutate(selectedItem.id)}
        onToggleWatched={() =>
          selectedItem &&
          toggleWatchedMutation.mutate({
            id: selectedItem.id,
            watched: !selectedItem.watched,
          })
        }
        onRate={(r) =>
          selectedItem && rateMutation.mutate({ id: selectedItem.id, rating: r })
        }
      />
    </Container>
  );
}
