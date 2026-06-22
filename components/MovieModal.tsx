"use client";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axios from "axios";
import { IMG_BASE } from "@/lib/tmdb";
import type { TMDBMovie, TMDBMovieDetail, WatchlistItem, MediaType } from "@/lib/types";
import StarRating from "./StarRating";

interface MovieModalProps {
  movie: TMDBMovie | null;
  open: boolean;
  onClose: () => void;
  watchlistItem?: WatchlistItem;
  onAdd?: () => void;
  onRemove?: () => void;
  onToggleWatched?: () => void;
  onRate?: (rating: number | null) => void;
}

export default function MovieModal({
  movie,
  open,
  onClose,
  watchlistItem,
  onAdd,
  onRemove,
  onToggleWatched,
  onRate,
}: MovieModalProps) {
  const mediaType = (movie?.media_type ?? "movie") as MediaType;

  const { data: detail, isLoading } = useQuery<TMDBMovieDetail>({
    queryKey: ["movie-detail", movie?.id, mediaType],
    queryFn: () =>
      axios
        .get(`/api/movie/${movie!.id}?type=${mediaType}`)
        .then((r) => r.data),
    enabled: open && !!movie,
  });

  // Hooks must all run before any early return (Rules of Hooks)
  const [isWatched, setIsWatched] = useState(watchlistItem?.watched ?? false);
  useEffect(() => {
    setIsWatched(watchlistItem?.watched ?? false);
  }, [watchlistItem?.watched]);

  if (!movie) return null;

  const title = movie.title ?? movie.name ?? "";
  const year = (movie.release_date ?? movie.first_air_date ?? "").slice(0, 4);
  const backdropUrl = movie.backdrop_path
    ? `${IMG_BASE}/w1280${movie.backdrop_path}`
    : null;
  const posterUrl = movie.poster_path
    ? `${IMG_BASE}/w342${movie.poster_path}`
    : null;
  const trailer = detail?.videos?.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );
  const cast = detail?.credits?.cast.slice(0, 6) ?? [];
  const similar = (detail?.similar?.results ?? [])
    .filter((m) => m.poster_path)
    .slice(0, 12)
    .map((m) => ({ ...m, media_type: mediaType }));
  const inWatchlist = !!watchlistItem;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { bgcolor: "background.paper", borderRadius: 2, overflow: "hidden" } } }}
    >
      {/* Backdrop hero */}
      <Box sx={{ position: "relative", height: 280 }}>
        {backdropUrl ? (
          <Image src={backdropUrl} alt={title} fill style={{ objectFit: "cover" }} />
        ) : (
          <Box sx={{ height: "100%", bgcolor: "#1a1a1a" }} />
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(28,28,28,0.95) 35%, transparent 100%), linear-gradient(to top, rgba(28,28,28,1) 0%, transparent 50%)",
          }}
        />
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(0,0,0,0.5)" }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0 }}>
        <Box sx={{ display: "flex", gap: 3, mt: -8, position: "relative" }}>
          {/* Poster */}
          {posterUrl && (
            <Box
              sx={{
                position: "relative",
                width: 120,
                height: 180,
                flexShrink: 0,
                borderRadius: 1,
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.8)",
              }}
            >
              <Image src={posterUrl} alt={title} fill style={{ objectFit: "cover" }} />
            </Box>
          )}

          {/* Info */}
          <Box sx={{ flex: 1, pt: 8 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {title}
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
              {year && <Chip label={year} size="small" variant="outlined" />}
              {movie.vote_average > 0 && (
                <Chip
                  label={`★ ${movie.vote_average.toFixed(1)}`}
                  size="small"
                  sx={{ bgcolor: "secondary.main", color: "#000", fontWeight: 700 }}
                />
              )}
              <Chip
                label={mediaType === "tv" ? "TV Show" : "Movie"}
                size="small"
                color="primary"
              />
            </Box>

            {isLoading ? (
              <CircularProgress size={20} />
            ) : (
              detail?.genres && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                  {detail.genres.map((g) => (
                    <Chip key={g.id} label={g.name} size="small" variant="outlined" />
                  ))}
                </Box>
              )
            )}

            {/* Watchlist actions */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              {!inWatchlist ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onAdd}
                  size="small"
                >
                  Add to Watchlist
                </Button>
              ) : (
                <>
                  <Button
                    variant={isWatched ? "contained" : "outlined"}
                    startIcon={<CheckCircleIcon />}
                    onClick={() => { setIsWatched((w) => !w); onToggleWatched?.(); }}
                    color={isWatched ? "success" : "inherit"}
                    size="small"
                  >
                    {isWatched ? "Watched" : "Mark Watched"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={onRemove}
                    size="small"
                  >
                    Remove
                  </Button>
                </>
              )}

              {trailer && (
                <Button
                  variant="outlined"
                  startIcon={<PlayArrowIcon />}
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  size="small"
                >
                  Trailer
                </Button>
              )}
            </Box>

            {inWatchlist && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Your rating
                </Typography>
                <StarRating value={watchlistItem.rating} onChange={onRate} showLabel />
              </Box>
            )}
          </Box>
        </Box>

        {/* Overview */}
        {movie.overview && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {movie.overview}
            </Typography>
          </>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Cast
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {cast.map((actor) => (
                <Box key={actor.id} sx={{ textAlign: "center", width: 72 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      overflow: "hidden",
                      mx: "auto",
                      mb: 0.5,
                      bgcolor: "#333",
                      position: "relative",
                    }}
                  >
                    {actor.profile_path && (
                      <Image
                        src={`${IMG_BASE}/w185${actor.profile_path}`}
                        alt={actor.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" display="block" noWrap>
                    {actor.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" noWrap>
                    {actor.character}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
        {/* Similar titles */}
        {similar.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              More Like This
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                overflowX: "auto",
                pb: 1,
                "&::-webkit-scrollbar": { height: 4 },
                "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.2)", borderRadius: 2 },
              }}
            >
              {similar.map((m) => {
                const t = m.title ?? m.name ?? "";
                const yr = (m.release_date ?? m.first_air_date ?? "").slice(0, 4);
                return (
                  <Box
                    key={m.id}
                    sx={{ flexShrink: 0, width: 90, cursor: "pointer" }}
                    onClick={() => {
                      onClose();
                      setTimeout(() => {
                        // bubble up so the parent can open the new movie
                        window.dispatchEvent(
                          new CustomEvent("open-movie", { detail: m })
                        );
                      }, 150);
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: 90,
                        aspectRatio: "2/3",
                        borderRadius: 1,
                        overflow: "hidden",
                        bgcolor: "#2a2a2a",
                        mb: 0.5,
                      }}
                    >
                      <Image
                        src={`${IMG_BASE}/w185${m.poster_path}`}
                        alt={t}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </Box>
                    <Typography variant="caption" display="block" noWrap title={t}>
                      {t}
                    </Typography>
                    {yr && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {yr}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
