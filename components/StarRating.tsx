"use client";

import { useEffect, useState } from "react";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";

interface StarRatingProps {
  value: number | null;
  onChange?: (value: number | null) => void;
  readOnly?: boolean;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "medium",
  showLabel = false,
}: StarRatingProps) {
  // Local state so the stars update instantly on click (optimistic),
  // then sync back to the server value once the mutation settles.
  const [localValue, setLocalValue] = useState<number | null>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Rating
        value={localValue}
        onChange={(_, newValue) => {
          setLocalValue(newValue);
          onChange?.(newValue);
        }}
        readOnly={readOnly}
        size={size}
        max={5}
        emptyIcon={<StarIcon fontSize="inherit" sx={{ opacity: 0.3 }} />}
        sx={{
          "& .MuiRating-iconFilled": { color: "secondary.main" },
          "& .MuiRating-iconHover": { color: "secondary.light" },
        }}
      />
      {showLabel && localValue && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {localValue}/5
        </Typography>
      )}
    </Box>
  );
}
