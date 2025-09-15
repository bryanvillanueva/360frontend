import React from "react";
import { Box, Button, FormControlLabel, Switch, Typography, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const BulkDeleteBar = ({
  open, selectedCount, onCancel, onDelete, sure, setSure, max = 50
}) => {
  if (!open) return null;

  return (
    <Paper elevation={3}
      sx={{
        position: "fixed",
        left: 24,
        bottom: 24,
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderRadius: 2,
        zIndex: 1300
      }}
    >
      <Box sx={{ mr: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          ¿Seguro que deseas eliminar?
        </Typography>
        <Typography variant="caption" color="error">
          La información que elimines no podrá ser recuperada
        </Typography>
        <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
          Pueden eliminarse máximo {max} ítems a la vez.
        </Typography>
      </Box>

      <FormControlLabel
        control={<Switch checked={sure} onChange={(e) => setSure(e.target.checked)} />}
        label="Estoy seguro"
      />

      <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
      <Button
        variant="contained"
        color="error"
        startIcon={<DeleteIcon />}
        disabled={!sure || selectedCount === 0}
        onClick={onDelete}
      >
        Eliminar ({selectedCount})
      </Button>
    </Paper>
  );
};

export default BulkDeleteBar;
