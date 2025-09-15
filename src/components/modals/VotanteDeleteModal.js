import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

const VotanteDeleteModal = ({ open, onClose, votante, onDelete, loading }) => {
  if (!votante) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent>
        <Typography>
          ¿Estás seguro de que deseas eliminar al votante{" "}
          <strong>{votante.nombre} {votante.apellido}</strong> con ID{" "}
          <strong>{votante.identificacion}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="error"
          onClick={onDelete}
          disabled={loading}
        >
          {loading ? <CircularProgress size={22} /> : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VotanteDeleteModal;
