import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";

const VotantesFiltro = () => {
  const [recomendadoCedula, setRecomendadoCedula] = useState("");
  const [lideres, setLideres] = useState([]);
  const [liderSeleccionado, setLiderSeleccionado] = useState("");
  const [votantes, setVotantes] = useState([]);
  const [liderData, setLiderData] = useState(null);
  const [loadingLideres, setLoadingLideres] = useState(false);
  const [loadingVotantes, setLoadingVotantes] = useState(false);

  const buscarLideres = async () => {
    if (!/^\d+$/.test(recomendadoCedula)) {
      alert("Por favor ingresa una cédula válida (solo números)");
      return;
    }
    setLoadingLideres(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/lideres/por-recomendado?recomendado=${recomendadoCedula}`
      );
      setLideres(response.data || []);
      setLiderSeleccionado("");
      setVotantes([]);
    } catch (error) {
      console.error("Error al buscar líderes:", error);
      alert(error.response?.data?.error || "Error al buscar líderes");
    } finally {
      setLoadingLideres(false);
    }
  };

  const buscarVotantes = async () => {
    if (!liderSeleccionado) {
      alert("Por favor selecciona un líder");
      return;
    }
    setLoadingVotantes(true);
    try {
      // Cambiar al nuevo endpoint
      const response = await axios.get(
        `http://127.0.0.1:5000/votantes/por-lider-detalle?lider=${liderSeleccionado}`
      );

      if (response.data.lider) {
        setLiderData(response.data.lider); // Información del líder
        setVotantes(response.data.votantes || []); // Lista de votantes (vacía si no hay votantes)
      } else {
        alert("No se encontró un líder con esa identificación.");
        setLiderData(null);
        setVotantes([]);
      }
    } catch (error) {
      console.error("Error al buscar votantes:", error);
      alert(error.response?.data?.error || "Error al buscar votantes");
    } finally {
      setLoadingVotantes(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: "100%",
        mx: "auto",
        mt: { xs: 4, sm: 3 },
        padding: { xs: 2, sm: 3 },
      }}
    >
      <Typography variant="h4" gutterBottom>
        Filtro de Votantes
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Selecciona un Recomendado
          </Typography>
          <TextField
            label="Cédula del Recomendado"
            value={recomendadoCedula}
            onChange={(e) => setRecomendadoCedula(e.target.value)}
            fullWidth
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={buscarLideres}
            disabled={loadingLideres}
            sx={{ width: "100%" }}
          >
            {loadingLideres ? <CircularProgress size={24} /> : "Buscar Líderes"}
          </Button>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Selecciona un Líder
          </Typography>
          <Select
            fullWidth
            value={liderSeleccionado}
            onChange={(e) => setLiderSeleccionado(e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              -- Selecciona un líder --
            </MenuItem>
            {lideres.map((lider) => (
              <MenuItem key={lider.lider_identificacion} value={lider.lider_identificacion}>
                {`${lider.lider_nombre || "Nombre no disponible"} ${lider.lider_apellido || "Apellido no disponible"} (Cédula: ${lider.lider_identificacion || "Sin identificación"})`}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="primary"
            onClick={buscarVotantes}
            disabled={loadingVotantes || !liderSeleccionado}
            sx={{ mt: 1, width: "100%" }}
          >
            {loadingVotantes ? <CircularProgress size={24} /> : "Ver Votantes"}
          </Button>
        </Box>
      </Box>

      {liderData && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">
            Líder: {`${liderData.nombre} ${liderData.apellido} (Cédula: ${liderData.identificacion})`}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            Cantidad de votantes: {votantes.length}
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{fontWeight: '800', backgroundColor: '#1976d2'}}>
                <TableCell sx={{color: '#ffffff'}}>Cédula</TableCell>
                  <TableCell sx={{color: '#ffffff'}}>Nombre</TableCell>
                  <TableCell sx={{color: '#ffffff'}}>Apellido</TableCell>
                  <TableCell sx={{color: '#ffffff'}}>Dirección</TableCell>
                  <TableCell sx={{color: '#ffffff'}}>Celular</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {votantes.length > 0 ? (
                  votantes.map((votante) => (
                    <TableRow key={votante.identificacion}>
                      <TableCell>{votante.identificacion}</TableCell>
                      <TableCell>{votante.nombre}</TableCell>
                      <TableCell>{votante.apellido}</TableCell>
                      <TableCell>{votante.direccion}</TableCell>
                      <TableCell>{votante.celular}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No hay votantes asignados a este líder.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default VotantesFiltro;
