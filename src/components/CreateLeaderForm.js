import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, CircularProgress, Grid, Card, CardContent, Typography as CardTypography } from "@mui/material";
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
  const [lideres, setLideres] = useState([]);

  // Obtener la lista de líderes al cargar el componente
  useEffect(() => {
    const fetchLideres = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/lideres");
        setLideres(response.data);
      } catch (error) {
        console.error("Error al obtener líderes:", error);
      }
    };
    fetchLideres();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:5000/lideres", formData);
      alert("Líder creado con éxito");
      // Reiniciar el formulario
      setFormData({
        identificacion: "",
        nombre: "",
        apellido: "",
        celular: "",
        email: "",
        recomendado_identificacion: "",
      });
      // Actualizar la lista de líderes
      const response = await axios.get("http://127.0.0.1:5000/lideres");
      setLideres(response.data);
    } catch (error) {
      console.error("Error al crear líder:", error);
      alert(error.response?.data?.error || "Error al crear líder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", mt: 5 }}>
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 5 }}>
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

      <Typography variant="h6" gutterBottom sx={{ mt: 5 }}>
        Lista de Líderes
      </Typography>
      <Grid container spacing={2}>
        {lideres.map((lider) => (
          <Grid item xs={12} sm={6} md={3} key={lider.lider_identificacion}>
            <Card>
              <CardContent>
                <CardTypography variant="h6" component="div">
                  {`${lider.lider_nombre} ${lider.lider_apellido}`}
                </CardTypography>
                <Typography variant="body2" color="text.secondary">
                  Identificación: {lider.lider_identificacion}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recomendado: {lider.recomendado_nombre || "N/A"} {lider.recomendado_apellido || ""}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CreateLeaderForm;
