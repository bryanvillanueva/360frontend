import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPDF from "./components/UploadPDF";
import CreateRecommendedForm from "./components/CreateRecommendedForm";
import CreateLeaderForm from "./components/CreateLeaderForm";
import CreateVotanteForm from "./components/CreateVotanteForm";
import UploadVotantes from "./components/UploadVotantes";
import VotantesFiltro from "./components/VotantesFiltro";
import DrawerMenu from "./components/DrawerMenu";
import Dashboard from "./components/Dashboard";
import { CssBaseline, ThemeProvider, createTheme, Box } from "@mui/material";
import "@fontsource/montserrat"; // Estilo regular
import "@fontsource/montserrat/700.css"; // Estilo bold

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
        {/* DrawerMenu debe actualizarse para mostrar los grupos: Dashboard, Crear, Cargas y Filtros/Reportes */}
        <DrawerMenu />
        <Box
          sx={{
            padding: "20px",
            marginLeft: 30, // margen para desktop
            "@media (max-width: 600px)": {
              marginLeft: 0, // sin margen en mobile
            },
          }}
        >
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard/>} />

            {/* Grupo "Crear" */}
            <Route path="/crear/recomendados" element={<CreateRecommendedForm />} />
            <Route path="/crear/lideres" element={<CreateLeaderForm />} />
            <Route path="/crear/votantes" element={<CreateVotanteForm />} />

            {/* Grupo "Cargas" */}
            {/* Nota: Los módulos de "Cargar recomendados" y "Cargar líderes" se desarrollarán posteriormente */}
            <Route path="/cargas/recomendados" element={<div>Cargar Recomendados (Pendiente)</div>} />
            <Route path="/cargas/lideres" element={<div>Cargar Líderes (Pendiente)</div>} />
            <Route path="/cargas/votantes" element={<UploadVotantes />} />

            {/* Grupo "Filtros y Reportes" */}
            <Route path="/filtros/votantes" element={<VotantesFiltro />} />
            <Route path="/filtros/pdf" element={<UploadPDF />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
