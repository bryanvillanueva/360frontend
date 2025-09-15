import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";

const VotanteEditModal = ({ open, onClose, votante, onChange, onSave, loading }) => {
  if (!votante) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Votante</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            label="Identificación"
            name="identificacion"
            value={votante.identificacion}
            onChange={onChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Nombre"
            name="nombre"
            value={votante.nombre}
            onChange={onChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Apellido"
            name="apellido"
            value={votante.apellido}
            onChange={onChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Dirección"
            name="direccion"
            value={votante.direccion || ""}
            onChange={onChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Celular"
            name="celular"
            value={votante.celular || ""}
            onChange={onChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            name="email"
            value={votante.email || ""}
            onChange={onChange}
            fullWidth
            sx={{ mb: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onSave}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VotanteEditModal;
