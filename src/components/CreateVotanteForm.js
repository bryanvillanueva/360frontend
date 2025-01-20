import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, CircularProgress, List, ListItem, ListItemText } from "@mui/material";
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

  // Obtener la lista de votantes al cargar el componente
  useEffect(() => {
    const fetchVotantes = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/votantes");
        setVotantes(response.data);
      } catch (error) {
        console.error("Error al obtener votantes:", error);
      }
    };
    fetchVotantes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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
        lider_identificacion: "",
      });
      const response = await axios.get("http://127.0.0.1:5000/votantes");
      setVotantes(response.data);
    } catch (error) {
      console.error("Error al crear votante:", error);
      alert(error.response?.data?.error || "Error al crear votante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
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
          required
          sx={{ mb: 2 }}
        />
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
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ width: "100%" }}
        >
          {loading ? <CircularProgress size={24} /> : "Crear"}
        </Button>
      </form>

      <Typography variant="h6" gutterBottom sx={{ mt: 5 }}>
        Lista de Votantes
      </Typography>
      <List>
        {votantes.map((votante) => (
          <ListItem key={votante.votante_identificacion}>
            <ListItemText
              primary={`${votante.votante_nombre} ${votante.votante_apellido} (ID: ${votante.votante_identificacion})`}
              secondary={`Líder: ${votante.lider_nombre || "N/A"} ${votante.lider_apellido || ""}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CreateVotanteForm;
