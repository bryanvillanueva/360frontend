import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

const VotanteDuplicateModal = ({
  open,
  onClose,
  votanteExistente,
  votanteNuevo,
  reassignOption,
  setReassignOption,
  onReassign,
}) => {
  if (!votanteExistente || !votanteNuevo) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Votante Duplicado</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          La identificación <strong>{votanteNuevo.identificacion}</strong> ya existe en el sistema.
        </Typography>

        {/* Info existente */}
        <Box sx={{ mb: 2, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
          <Typography variant="subtitle1">Votante Existente</Typography>
          <Typography><strong>Nombre:</strong> {votanteExistente.nombre} {votanteExistente.apellido}</Typography>
          <Typography><strong>Líder:</strong> {votanteExistente.lider_identificacion}</Typography>
        </Box>

        {/* Info ingresada */}
        <Box sx={{ mb: 2, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
          <Typography variant="subtitle1">Nuevo Intento</Typography>
          <Typography><strong>Nombre:</strong> {votanteNuevo.nombre} {votanteNuevo.apellido}</Typography>
          <Typography><strong>Líder:</strong> {votanteNuevo.lider_identificacion}</Typography>
        </Box>

        {/* Opción de reasignación */}
        {votanteExistente.lider_identificacion !== votanteNuevo.lider_identificacion && (
          <RadioGroup
            value={reassignOption}
            onChange={(e) => setReassignOption(e.target.value)}
          >
            <FormControlLabel
              value="current"
              control={<Radio />}
              label={`Mantener líder actual (${votanteExistente.lider_identificacion})`}
            />
            <FormControlLabel
              value="new"
              control={<Radio />}
              label={`Reasignar al nuevo líder (${votanteNuevo.lider_identificacion})`}
            />
          </RadioGroup>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        {votanteExistente.lider_identificacion !== votanteNuevo.lider_identificacion && (
          <Button variant="contained" onClick={onReassign}>
            Confirmar Reasignación
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VotanteDuplicateModal;
