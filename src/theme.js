import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#f181e6",
      dark: "#d964ce",
      light: "#f9c4f4",
    },
    text: {
      primary: "#3f0539",
      secondary: "#7a3d72",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
      subtle: "#fdf5fc",
    },
    border: {
      main: "#f0e0ee",
    },
    error: {
      main: "#d32f2f",
    },
    success: {
      main: "#2e7d32",
    },
    warning: {
      main: "#ff9800",
    },
    grey: {
      300: "#e0e0e0",
      500: "#909090",
    },
  },
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
    h6: {
      fontWeight: "bold",
    },
  },
});

export default theme;
