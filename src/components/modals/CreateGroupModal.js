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
import AddIcon from "@mui/icons-material/Add";

const CreateGroupModal = ({
  open,
  onClose,
  createData,
  setCreateData,
  onCreateGroup,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Crear Nuevo Grupo</Typography>
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
          value={createData.nombre}
          onChange={(e) => setCreateData({ ...createData, nombre: e.target.value })}
          required
        />
        <TextField
          fullWidth
          label="Descripción"
          variant="outlined"
          margin="normal"
          multiline
          rows={3}
          value={createData.descripcion}
          onChange={(e) => setCreateData({ ...createData, descripcion: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          onClose();
          setCreateData({ nombre: "", descripcion: "" });
        }}>Cancelar</Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateGroup}
          disabled={!createData.nombre.trim()}
        >
          Crear Grupo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupModal;