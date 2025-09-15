import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";

const RecommendedFormModal = ({
  open,
  onClose,
  isEditing,
  formData,
  onChange,
  onSubmit,
  loading,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {isEditing ? "Editar Recomendado" : "Crear Nuevo Recomendado"}
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Identificación"
                name="identificacion"
                value={formData.identificacion}
                onChange={onChange}
                fullWidth
                required
                disabled={isEditing && formData.original_identificacion}
              />
              <TextField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={onChange}
                fullWidth
                required
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={onChange}
                fullWidth
                required
              />
              <TextField
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={onChange}
                fullWidth
                required
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Celular"
                name="celular"
                value={formData.celular}
                onChange={onChange}
                fullWidth
                required
              />
              <TextField
                label="Departamento"
                name="departamento"
                value={formData.departamento}
                onChange={onChange}
                fullWidth
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={onChange}
                fullWidth
              />
              <TextField
                label="Barrio"
                name="barrio"
                value={formData.barrio}
                onChange={onChange}
                fullWidth
              />
            </Box>

            <TextField
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={onChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : isEditing ? (
              "Actualizar"
            ) : (
              "Crear"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RecommendedFormModal;