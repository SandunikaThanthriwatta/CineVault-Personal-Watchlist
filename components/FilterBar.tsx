"use client";

import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import type { FilterStatus, MediaType } from "@/lib/types";

interface FilterBarProps {
  genres: string[];
  selectedGenre: string;
  onGenreChange: (g: string) => void;
  totalCount: number;
  // optional — watchlist only
  status?: FilterStatus;
  onStatusChange?: (v: FilterStatus) => void;
  // optional — watchlist only (discover puts this next to the search bar)
  mediaType?: MediaType | "all";
  onMediaTypeChange?: (v: MediaType | "all") => void;
}

export default function FilterBar({
  status,
  onStatusChange,
  mediaType,
  onMediaTypeChange,
  genres,
  selectedGenre,
  onGenreChange,
  totalCount,
}: FilterBarProps) {
  const showTopRow = status !== undefined || mediaType !== undefined;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
      {showTopRow && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {status !== undefined && onStatusChange && (
              <ToggleButtonGroup
                value={status}
                exclusive
                size="small"
                onChange={(_, v) => v && onStatusChange(v)}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="unwatched">Unwatched</ToggleButton>
                <ToggleButton value="watched">Watched</ToggleButton>
              </ToggleButtonGroup>
            )}

            {mediaType !== undefined && onMediaTypeChange && (
              <ToggleButtonGroup
                value={mediaType}
                exclusive
                size="small"
                onChange={(_, v) => v && onMediaTypeChange(v)}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="movie">Movies</ToggleButton>
                <ToggleButton value="tv">TV</ToggleButton>
              </ToggleButtonGroup>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary">
            {totalCount} {totalCount === 1 ? "title" : "titles"}
          </Typography>
        </Box>
      )}

      {/* Genre chips row */}
      {genres.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              label="All genres"
              size="small"
              variant={selectedGenre === "" ? "filled" : "outlined"}
              color={selectedGenre === "" ? "primary" : "default"}
              onClick={() => onGenreChange("")}
            />
            {genres.map((g) => (
              <Chip
                key={g}
                label={g}
                size="small"
                variant={selectedGenre === g ? "filled" : "outlined"}
                color={selectedGenre === g ? "primary" : "default"}
                onClick={() => onGenreChange(g === selectedGenre ? "" : g)}
              />
            ))}
          </Box>

          {/* Count shown here when there's no top row (discover page) */}
          {!showTopRow && (
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
              {totalCount} {totalCount === 1 ? "title" : "titles"}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
