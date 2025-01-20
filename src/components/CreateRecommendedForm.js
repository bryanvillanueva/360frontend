import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, CircularProgress, List, ListItem, ListItemText } from "@mui/material";
import axios from "axios";

const CreateRecommendedForm = () => {
  const [formData, setFormData] = useState({
    identificacion: "",
    nombre: "",
    apellido: "",
    celular: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [recomendados, setRecomendados] = useState([]);

  // Obtener la lista de recomendados al cargar el componente
  useEffect(() => {
    const fetchRecomendados = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/recomendados");
        setRecomendados(response.data);
      } catch (error) {
        console.error("Error al obtener recomendados:", error);
      }
    };
    fetchRecomendados();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:5000/recomendados", formData);
      alert("Recomendado creado con éxito");
      // Reiniciar el formulario
      setFormData({
        identificacion: "",
        nombre: "",
        apellido: "",
        celular: "",
        email: "",
      });
      // Actualizar la lista de recomendados
      const response = await axios.get("http://127.0.0.1:5000/recomendados");
      setRecomendados(response.data);
    } catch (error) {
      console.error("Error al crear recomendado:", error);
      alert(error.response?.data?.error || "Error al crear recomendado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        Crear Recomendado
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
          disabled={loading}
          sx={{ width: "100%" }}
        >
          {loading ? <CircularProgress size={24} /> : "Crear"}
        </Button>
      </form>

      <Typography variant="h6" gutterBottom sx={{ mt: 5 }}>
        Lista de Recomendados
      </Typography>
      <List>
        {recomendados.map((recomendado) => (
          <ListItem key={recomendado.identificacion}>
            <ListItemText
              primary={`${recomendado.nombre} ${recomendado.apellido}`}
              secondary={`Identificación: ${recomendado.identificacion}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CreateRecommendedForm;
