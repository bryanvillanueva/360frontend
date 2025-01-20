import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPDF from "./components/UploadPDF";
import CreateRecommendedForm from "./components/CreateRecommendedForm";
import CreateLeaderForm from "./components/CreateLeaderForm";
import CreateVotanteForm from "./components/CreateVotanteForm";
import UploadVotantes from "./components/UploadVotantes";
import VotantesFiltro from "./components/VotantesFiltro";
import DrawerMenu from "./components/DrawerMenu";
import "@fontsource/montserrat"; // Estilo regular
import "@fontsource/montserrat/700.css"; // Estilo bold
import { CssBaseline, ThemeProvider, createTheme, Box } from "@mui/material";

const theme = createTheme({
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <DrawerMenu />
        <Box
          sx={{
            padding: "20px",
            marginLeft: 30, // Default margin for desktop
            "@media (max-width: 600px)": {
              marginLeft: 0, // Remove margin for mobile screens
            },
          }}
        >
          <Routes>
            <Route path="/upload" element={<UploadPDF />} />
            <Route path="/recomendados" element={<CreateRecommendedForm />} />
            <Route path="/lideres" element={<CreateLeaderForm />} />
            <Route path="/votantes" element={<CreateVotanteForm />} />
            <Route path="/cargarVotantes" element={<UploadVotantes />} />
            <Route path="/votantesFiltro" element={<VotantesFiltro />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
