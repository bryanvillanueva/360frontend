import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import axios from "axios";

const CreateVotanteForm = () => {
  const [formData, setFormData] = useState({
    identificacion: "",
    nombre: "",
    apellido: "",
    direccion: "",
    celular: "",
    email: "",
    lider_identificacion: "",
  });
  const [loading, setLoading] = useState(false);
  const [votantes, setVotantes] = useState([]);
  const [liderData, setLiderData] = useState(null);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Buscar votantes asociados al líder
  const handleBuscarVotantes = async () => {
    if (!formData.lider_identificacion) {
      alert("Por favor, ingresa la identificación del líder.");
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/votantes/por-lider?lider=${formData.lider_identificacion}`
      );
  
      if (response.data.lider) {
        // El líder existe
        setLiderData(response.data.lider);
        setVotantes(response.data.votantes || []); // Actualiza con la lista de votantes
      } else {
        // Este caso no debería ocurrir, pero lo manejamos por seguridad
        alert("No se encontró información del líder.");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        alert("No se encontró un líder con esa identificación.");
      } else {
        console.error("Error al buscar votantes:", error);
        alert("Error al buscar votantes.");
      }
      setLiderData(null);
      setVotantes([]); // Vaciar lista de votantes
    } finally {
      setLoading(false);
    }
  };
  

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:5000/votantes", formData);
      alert("Votante creado con éxito");
      setFormData({
        identificacion: "",
        nombre: "",
        apellido: "",
        direccion: "",
        celular: "",
        email: "",
        lider_identificacion: formData.lider_identificacion,
      });
      handleBuscarVotantes(); // Actualizar la lista de votantes
    } catch (error) {
      console.error("Error al crear votante:", error);
      alert(error.response?.data?.error || "Error al crear votante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: { xs: 1, sm: 2 } }}>
      {/* Campo para ingresar líder */}
      <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
        <TextField
          label="Identificación del Líder"
          name="lider_identificacion"
          value={formData.lider_identificacion}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleBuscarVotantes}
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : "Buscar Votantes"}
        </Button>
      </Box>

      {/* Mostrar información del líder */}
      {liderData && (
        <Typography variant="h6" gutterBottom>
          Líder: {`${liderData.nombre} ${liderData.apellido} (Cédula: ${liderData.identificacion})`}
        </Typography>
      )}

      {/* Formulario para crear votante */}
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Crear Votante
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Identificación"
            name="identificacion"
            value={formData.identificacion}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Celular"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Correo Electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ width: "100%" }}
          >
            {loading ? <CircularProgress size={24} /> : "Crear"}
          </Button>
        </form>
      </Box>

      {/* Lista de votantes asociados */}
      {liderData && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cantidad de votantes: {votantes.length}
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                <TableCell>Identificación</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Dirección</TableCell>
                  <TableCell>Celular</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {votantes.length > 0 ? (
                  votantes.map((votante) => (
                    <TableRow key={votante.votante_identificacion}>
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

export default CreateVotanteForm;
