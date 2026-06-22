import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#E50914" },       // Netflix red
    secondary: { main: "#F5C518" },     // IMDb gold
    background: {
      default: "#141414",
      paper: "#1c1c1c",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B3B3B3",
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "scale(1.04)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 4, textTransform: "none", fontWeight: 600 },
      },
    },
  },
});
