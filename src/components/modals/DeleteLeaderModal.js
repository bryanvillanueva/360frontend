import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";

const DeleteLeaderModal = ({
  open,
  onClose,
  leaderData,
  votersAffected,
  onConfirmDelete,
  loading,
}) => {
  if (!leaderData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <WarningIcon />
        Confirmar Eliminación de Líder
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Esta acción no se puede deshacer
        </Alert>

        <Typography variant="body1" sx={{ mb: 2 }}>
          ¿Estás seguro de que deseas eliminar el líder?
        </Typography>

        <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1, mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Información del Líder:
          </Typography>
          <Typography>
            <strong>Identificación:</strong> {leaderData.lider_identificacion || leaderData.identificacion}
          </Typography>
          <Typography>
            <strong>Nombre:</strong> {leaderData.lider_nombre || leaderData.nombre} {leaderData.lider_apellido || leaderData.apellido}
          </Typography>
        </Box>

        {votersAffected && votersAffected.length > 0 && (
          <Box>
            <Alert severity="info" sx={{ mb: 1 }}>
              Los siguientes votantes están asociados a este líder y deberán ser reasignados:
            </Alert>
            <List dense sx={{ maxHeight: 200, overflow: "auto", bgcolor: "grey.50", borderRadius: 1 }}>
              {votersAffected.map((votante) => (
                <ListItem key={votante.votante_identificacion}>
                  <ListItemText
                    primary={`${votante.votante_nombre} ${votante.votante_apellido}`}
                    secondary={`ID: ${votante.votante_identificacion}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={onConfirmDelete}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Eliminando..." : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteLeaderModal;