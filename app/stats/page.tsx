"use client";

import dynamic from "next/dynamic";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import BarChartIcon from "@mui/icons-material/BarChart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MovieIcon from "@mui/icons-material/Movie";
import TvIcon from "@mui/icons-material/Tv";
import StarIcon from "@mui/icons-material/Star";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { IMG_BASE } from "@/lib/tmdb";
import type { WatchlistStats } from "@/lib/types";

// Recharts v3: fill is set per data item — no Cell import needed.
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);

// Watched arc: vivid red; unwatched: subtle ghost ring
const WATCHED_COLOR = "#E50914";
const UNWATCHED_COLOR = "rgba(255,255,255,0.07)";

// Genre donut & bar: yellow → green spectrum (10 vivid tones for dark bg)
const GENRE_COLORS = [
  "#fdd835", // bright yellow
  "#f9a825", // golden amber
  "#c6d600", // vivid lime-yellow
  "#8bc34a", // light green
  "#66bb6a", // medium green
  "#2e7d32", // deep green
  "#afb42b", // olive
  "#cddc39", // lime
  "#aed581", // pale lime
  "#a5d6a7", // mint
];

function StatCard({
  icon,
  label,
  value,
  sub,
  color = "text.primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card sx={{ bgcolor: "background.paper", height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Box sx={{ color: "primary.main" }}>{icon}</Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight={700} sx={{ color }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary">
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function StatsPage() {
  const { data: stats, isLoading } = useQuery<WatchlistStats>({
    queryKey: ["stats"],
    queryFn: async () => axios.get("/api/stats").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={48} sx={{ mb: 3 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={120} />
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
          <Skeleton variant="rounded" height={320} />
          <Skeleton variant="rounded" height={320} />
        </Box>
      </Container>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <BarChartIcon sx={{ fontSize: 64, opacity: 0.2, mb: 2 }} />
        <Typography variant="h6">No stats yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Add movies and shows to your watchlist to see stats here.
        </Typography>
      </Container>
    );
  }

  const watchedPct = Math.round((stats.watched / stats.total) * 100);

  // Data for the donut (watched vs unwatched)
  // fill on each item is the recharts v3 way to colour segments (replaces Cell)
  const donutData = [
    { name: "Watched", value: stats.watched, fill: WATCHED_COLOR },
    { name: "Unwatched", value: stats.unwatched, fill: UNWATCHED_COLOR },
  ];

  const genreDonutData = stats.topGenres.slice(0, 10).map((g, i) => ({
    name: g.genre,
    value: g.total,
    fill: GENRE_COLORS[i % GENRE_COLORS.length],
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <BarChartIcon sx={{ color: "primary.main", fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700}>
          My Stats
        </Typography>
      </Box>

      {/* Top stat cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          icon={<MovieIcon />}
          label="Total in Watchlist"
          value={stats.total}
          sub={`${stats.movies} movies · ${stats.tvShows} TV shows`}
        />
        <StatCard
          icon={<CheckCircleIcon />}
          label="Watched"
          value={`${stats.watched} (${watchedPct}%)`}
          sub="of your watchlist"
          color="success.main"
        />
        <StatCard
          icon={<TvIcon />}
          label="Still to Watch"
          value={stats.unwatched}
          sub="on your list"
        />
        <StatCard
          icon={<StarIcon />}
          label="Avg Personal Rating"
          value={stats.averageRating !== null ? `${stats.averageRating} / 5` : "—"}
          sub={stats.averageRating !== null ? "from rated titles" : "rate some titles"}
          color="secondary.main"
        />
      </Box>

      {/* Charts row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Thin donut — watched vs unwatched */}
        <Card sx={{ bgcolor: "background.paper" }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Watched vs Unwatched
            </Typography>
            <Box sx={{ height: 280, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={106}
                    outerRadius={114}
                    paddingAngle={3}
                    cornerRadius={4}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  />

                  <Tooltip
                    contentStyle={{ background: "#1c1c1c", border: "1px solid #333" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              {/* Centre label */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  pb: 4,
                }}
              >
                <Typography variant="h4" fontWeight={700} color="primary">
                  {watchedPct}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  watched
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Multi-segment donut — genre distribution */}
        <Card sx={{ bgcolor: "background.paper" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Genre Distribution
              </Typography>
              {stats.favoriteGenre && (
                <Chip
                  icon={<EmojiEventsIcon sx={{ fontSize: 14 }} />}
                  label={stats.favoriteGenre}
                  size="small"
                  color="secondary"
                  sx={{ ml: "auto" }}
                />
              )}
            </Box>
            <Box sx={{ height: 280, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={108}
                    paddingAngle={3}
                    cornerRadius={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  />

                  <Tooltip
                    contentStyle={{ background: "#1c1c1c", border: "1px solid #333" }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value, name) => [`${value} titles`, name]}
                  />
                  <Legend
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Centre label — total titles */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  pb: 4,
                }}
              >
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  titles
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Bottom row: bar chart + recently watched side by side */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {/* Stacked bar — watched vs added per genre */}
        {stats.topGenres.length > 0 && (
          <Card sx={{ bgcolor: "background.paper" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Watched vs Added by Genre
              </Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.topGenres}
                    margin={{ top: 8, right: 16, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="genre"
                      tick={{ fill: "#B3B3B3", fontSize: 11 }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fill: "#B3B3B3", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "#1c1c1c", border: "1px solid #333" }}
                      itemStyle={{ color: "#fff" }}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Legend verticalAlign="top" />
                    <Bar dataKey="watched" name="Watched" stackId="a" fill={WATCHED_COLOR} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="unwatched" name="Unwatched" stackId="a" fill={UNWATCHED_COLOR} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Recently watched */}
        {stats.recentlyWatched.length > 0 && (
          <Card sx={{ bgcolor: "background.paper" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Recently Watched
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {stats.recentlyWatched.map((item, i) => (
                  <Box key={i}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
                      {item.posterPath ? (
                        <Box
                          sx={{
                            position: "relative",
                            width: 36,
                            height: 54,
                            flexShrink: 0,
                            borderRadius: 0.5,
                            overflow: "hidden",
                          }}
                        >
                          <Image
                            src={`${IMG_BASE}/w92${item.posterPath}`}
                            alt={item.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{ width: 36, height: 54, bgcolor: "#333", borderRadius: 0.5, flexShrink: 0 }}
                        />
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.watchedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Typography>
                      </Box>
                      {item.rating && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
                          <StarIcon sx={{ fontSize: 14, color: "secondary.main" }} />
                          <Typography variant="caption" color="secondary.main" fontWeight={700}>
                            {item.rating}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    {i < stats.recentlyWatched.length - 1 && <Divider sx={{ opacity: 0.1 }} />}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
}
