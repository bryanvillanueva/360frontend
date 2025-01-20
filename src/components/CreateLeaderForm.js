import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import axios from "axios";

const CreateLeaderForm = () => {
  const [formData, setFormData] = useState({
    identificacion: "",
    nombre: "",
    apellido: "",
    celular: "",
    email: "",
    recomendado_identificacion: "",
  });
  const [loading, setLoading] = useState(false);
  const [recomendadoData, setRecomendadoData] = useState(null);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Buscar datos del recomendado
  const handleBuscarRecomendado = async () => {
    if (!formData.recomendado_identificacion) {
      alert("Por favor, ingresa la identificación del recomendado.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/recomendados/${formData.recomendado_identificacion}`
      );
      setRecomendadoData(response.data);
    } catch (error) {
      console.error("Error al buscar recomendado:", error);
      alert("Recomendado no existe en el sistema.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:5000/lideres", formData);
      alert("Líder creado con éxito");
      setFormData({
        identificacion: "",
        nombre: "",
        apellido: "",
        celular: "",
        email: "",
        recomendado_identificacion: "",
      });
      setRecomendadoData(null);
    } catch (error) {
      console.error("Error al crear líder:", error);
      alert(error.response?.data?.error || "Error al crear líder");
    } finally {
      setLoading(false);
    }
  };

  return (
     <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: { xs: 1, sm: 2 } }}>
      {/* Campo para ingresar recomendado */}
      <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
        <TextField
          label="Identificación del Recomendado"
          name="recomendado_identificacion"
          value={formData.recomendado_identificacion}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleBuscarRecomendado}
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : "Buscar Recomendado"}
        </Button>
      </Box>

      {/* Mostrar información del recomendado */}
      {recomendadoData && (
        <Box sx={{ mb: 3, p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Recomendado Encontrado
          </Typography>
          <Typography>
            Nombre: {`${recomendadoData.nombre} ${recomendadoData.apellido}`}
          </Typography>
          <Typography>Identificación: {recomendadoData.identificacion}</Typography>
        </Box>
      )}

      {/* Formulario para crear líder */}
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Crear Líder
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !recomendadoData}
            sx={{ width: "100%" }}
          >
            {loading ? <CircularProgress size={24} /> : "Crear"}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default CreateLeaderForm;
