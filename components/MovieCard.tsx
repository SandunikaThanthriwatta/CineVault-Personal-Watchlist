"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Image from "next/image";
import { IMG_BASE } from "@/lib/tmdb";
import type { TMDBMovie, WatchlistItem } from "@/lib/types";
import StarRating from "./StarRating";

interface MovieCardProps {
  movie: TMDBMovie;
  genres?: string[];
  watchlistItem?: WatchlistItem;
  onAdd?: () => void;
  onRemove?: () => void;
  onToggleWatched?: () => void;
  onRate?: (rating: number | null) => void;
  onOpenDetail?: () => void;
}

export default function MovieCard({
  movie,
  genres = [],
  watchlistItem,
  onAdd,
  onRemove,
  onToggleWatched,
  onRate,
  onOpenDetail,
}: MovieCardProps) {
  const title = movie.title ?? movie.name ?? "Unknown";
  const year = (movie.release_date ?? movie.first_air_date ?? "").slice(0, 4);
  const posterUrl = movie.poster_path
    ? `${IMG_BASE}/w342${movie.poster_path}`
    : null;
  const mediaType = movie.media_type ?? "movie";
  const inWatchlist = !!watchlistItem;
  const isWatched = watchlistItem?.watched ?? false;
  const visibleGenres = genres.slice(0, 2);

  return (
    <Card
      sx={{
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        cursor: "pointer",
        width: "100%",
      }}
    >
      {/* Poster — fixed 2:3 aspect ratio regardless of source image size */}
      <Box
        onClick={onOpenDetail}
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "2 / 3",
          overflow: "hidden",
          bgcolor: "#2a2a2a",
          flexShrink: 0,
        }}
      >
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            style={{ objectFit: "cover", objectPosition: "center top" }}
            sizes="(max-width: 600px) 50vw, (max-width: 900px) 20vw, 12vw"
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
            }}
          >
            <Typography variant="caption">No image</Typography>
          </Box>
        )}

        {/* Watched badge */}
        {isWatched && (
          <CheckCircleIcon
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              fontSize: 20,
              color: "primary.main",
              bgcolor: "rgba(0,0,0,0.7)",
              borderRadius: "50%",
            }}
          />
        )}

        {/* Media type badge */}
        <Chip
          label={mediaType === "tv" ? "TV" : "Film"}
          size="small"
          sx={{
            position: "absolute",
            top: 6,
            left: 6,
            fontSize: "0.6rem",
            height: 18,
            bgcolor: mediaType === "tv" ? "secondary.main" : "primary.main",
            color: "#fff",
            "& .MuiChip-label": { px: 0.75 },
          }}
        />
      </Box>

      {/* Content — fixed height so all cards are uniform */}
      <CardContent
        sx={{
          px: 1,
          pt: 0.75,
          pb: "0 !important",
          flexShrink: 0,
          minHeight: 72,
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          display="block"
          noWrap
          title={title}
          onClick={onOpenDetail}
          sx={{ cursor: "pointer", fontSize: "0.72rem", lineHeight: 1.3 }}
        >
          {title}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
          {year}
          {(movie.vote_average ?? 0) > 0 && ` · ★ ${movie.vote_average.toFixed(1)}`}
        </Typography>

        {/* Genre chips — always occupy the same space */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4, minHeight: 20, mt: 0.25 }}>
          {visibleGenres.map((g) => (
            <Chip
              key={g}
              label={g}
              size="small"
              variant="outlined"
              sx={{
                fontSize: "0.58rem",
                height: 16,
                borderColor: "rgba(255,255,255,0.2)",
                color: "text.secondary",
                "& .MuiChip-label": { px: 0.6 },
              }}
            />
          ))}
        </Box>

        {inWatchlist && (
          <Box sx={{ mt: 0.25 }}>
            <StarRating value={watchlistItem.rating} onChange={onRate} size="small" />
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ px: 0.5, pt: 0, pb: 0.5, justifyContent: "space-between", flexShrink: 0 }}>
        <Tooltip title="Details">
          <IconButton size="small" onClick={onOpenDetail}>
            <InfoOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        {inWatchlist ? (
          <Box sx={{ display: "flex" }}>
            <Tooltip title={isWatched ? "Mark unwatched" : "Mark watched"}>
              <IconButton size="small" onClick={onToggleWatched}>
                <CheckCircleIcon
                  sx={{ fontSize: 16, color: isWatched ? "primary.main" : "action.disabled" }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove">
              <IconButton size="small" onClick={onRemove}>
                <DeleteIcon sx={{ fontSize: 16, color: "error.main" }} />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Tooltip title="Add to Watchlist">
            <IconButton size="small" onClick={onAdd} color="primary">
              <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
}
