import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPDF from "./components/UploadPDF";
import CreateRecommendedForm from "./components/CreateRecommendedForm";
import CreateLeaderForm from "./components/CreateLeaderForm";
import CreateVotanteForm from "./components/CreateVotanteForm";
import VotantesFiltro from "./components/VotantesFiltro";
import DrawerMenu from "./components/DrawerMenu";
import Dashboard from "./components/Dashboard";
import Grupos from "./components/Grupos";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import "@fontsource/montserrat"; // Estilo regular
import "@fontsource/montserrat/700.css"; // Estilo bold

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <DrawerMenu>
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard/>} />

            {/* Grupos */}
            <Route path="/grupos" element={<Grupos />} />

            {/* Grupo "Crear" */}
            <Route path="/crear/recomendados" element={<CreateRecommendedForm />} />
            <Route path="/crear/lideres" element={<CreateLeaderForm />} />
            <Route path="/crear/votantes" element={<CreateVotanteForm />} />

            {/* Grupo "Filtros y Reportes" */}
            <Route path="/filtros/votantes" element={<VotantesFiltro />} />
            <Route path="/filtros/pdf" element={<UploadPDF />} />
          </Routes>
        </DrawerMenu>
      </Router>
    </ThemeProvider>
  );
}

export default App;
