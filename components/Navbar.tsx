"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MovieFilterIcon from "@mui/icons-material/MovieFilter";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import BarChartIcon from "@mui/icons-material/BarChart";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <AppBar
      position="fixed"
      sx={{
        background: "linear-gradient(180deg, #000000ee 0%, #000000aa 100%)",
        backdropFilter: "blur(8px)",
        boxShadow: "none",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <MovieFilterIcon sx={{ color: "primary.main", mr: 1 }} />
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "primary.main",
            fontWeight: 800,
            letterSpacing: "0.5px",
            fontStyle: "italic",
          }}
        >
          Cinevault
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            component={Link}
            href="/"
            startIcon={<MovieFilterIcon />}
            variant={pathname === "/" ? "contained" : "text"}
            color={pathname === "/" ? "primary" : "inherit"}
            size="small"
          >
            Discover
          </Button>
          <Button
            component={Link}
            href="/watchlist"
            startIcon={<PlaylistAddCheckIcon />}
            variant={pathname === "/watchlist" ? "contained" : "text"}
            color={pathname === "/watchlist" ? "primary" : "inherit"}
            size="small"
          >
            My List
          </Button>
          <Button
            component={Link}
            href="/stats"
            startIcon={<BarChartIcon />}
            variant={pathname === "/stats" ? "contained" : "text"}
            color={pathname === "/stats" ? "primary" : "inherit"}
            size="small"
          >
            Stats
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
