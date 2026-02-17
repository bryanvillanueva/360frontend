import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Alert,
} from "@mui/material";

const RecommendedDeleteModal = ({ open, onClose, recommended, onDelete, loading }) => {
  const [deleteReason, setDeleteReason] = useState("");

  if (!recommended) return null;

  const handleDelete = () => {
    onDelete(deleteReason);
  };

  const handleClose = () => {
    setDeleteReason("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={(theme) => ({ color: theme.palette.error.main, fontWeight: 600 })}>
        Confirmar Eliminación de Recomendado
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Esta acción moverá el registro a eliminados. Podrás consultarlo posteriormente.
        </Alert>

        <Typography sx={{ mb: 2 }}>
          ¿Estás seguro de que deseas eliminar al recomendado{" "}
          <strong>{recommended.nombre} {recommended.apellido}</strong> con ID{" "}
          <strong>{recommended.identificacion}</strong>?
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="caption">
            Nota: Los líderes asociados a este recomendado se mantendrán activos.
          </Typography>
        </Alert>

        <TextField
          label="Motivo de eliminación"
          multiline
          rows={3}
          fullWidth
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
          placeholder="Ej: Duplicado, Inactivo, Error de registro, etc."
          helperText="Especifica el motivo de la eliminación (opcional pero recomendado)"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecommendedDeleteModal;
