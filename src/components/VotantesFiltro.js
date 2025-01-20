import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";

const VotantesFiltro = () => {
  const [recomendadoCedula, setRecomendadoCedula] = useState("");
  const [lideres, setLideres] = useState([]);
  const [liderSeleccionado, setLiderSeleccionado] = useState("");
  const [votantes, setVotantes] = useState([]);
  const [loadingLideres, setLoadingLideres] = useState(false);
  const [loadingVotantes, setLoadingVotantes] = useState(false);

  const buscarLideres = async () => {
    if (!/^\d+$/.test(recomendadoCedula)) {
      alert("Por favor ingresa una cédula válida (solo números)");
      return;
    }
    setLoadingLideres(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/lideres/por-recomendado?recomendado=${recomendadoCedula}`);
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
      const response = await axios.get(`http://127.0.0.1:5000/votantes/por-lider?lider=${liderSeleccionado}`);
      setVotantes(response.data || []);
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
        marginLeft: { xs: "0", sm: "0" }, // Solo agregar marginLeft en pantallas medianas y más grandes
      }}
    >
      <Typography variant="h4" gutterBottom>
        Filtro de Votantes
      </Typography>
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6}>
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
        </Grid>

        <Grid item xs={12} sm={6}>
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
        </Grid>
      </Grid>

      {votantes.length > 0 ? (
        <Box> 
          <Typography variant="h6" gutterBottom>
            Lista de Votantes (Total: {votantes.length})
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Cédula</TableCell>
                  <TableCell>Dirección</TableCell>
                  <TableCell>Celular</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {votantes.map((votante) => (
                  <TableRow key={votante.identificacion}>
                    <TableCell>{votante.nombre}</TableCell>
                    <TableCell>{votante.apellido}</TableCell>
                    <TableCell>{votante.identificacion}</TableCell>
                    <TableCell>{votante.direccion}</TableCell>
                    <TableCell>{votante.celular}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Typography variant="body1" color="textSecondary">
          No hay votantes disponibles.
        </Typography>
      )}
    </Box>
  );
};

export default VotantesFiltro;
