import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

const EditGroupModal = ({
  open,
  onClose,
  editData,
  setEditData,
  onEditGroup,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Editar Grupo</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Nombre del Grupo"
          variant="outlined"
          margin="normal"
          value={editData.nombre}
          onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
        />
        <TextField
          fullWidth
          label="Descripción"
          variant="outlined"
          margin="normal"
          multiline
          rows={3}
          value={editData.descripcion}
          onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" startIcon={<EditIcon />} onClick={onEditGroup}>
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditGroupModal;