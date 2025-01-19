import React from "react";
import UploadPDF from "./components/UploadPDF";
import "@fontsource/montserrat"; // Estilo regular
import "@fontsource/montserrat/700.css"; // Estilo bold
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";


const theme = createTheme({
  typography: {
      fontFamily: "Montserrat, Arial, sans-serif",
  },
});

function App() {
  return (
      <ThemeProvider theme={theme}>
          <CssBaseline />
          <UploadPDF />
      </ThemeProvider>
  );
}

export default App;

