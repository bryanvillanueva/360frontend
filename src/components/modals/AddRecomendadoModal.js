import React, { useState, useEffect } from "react";
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Fade,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import axios from "axios";

const AddRecomendadoModal = ({ open, onClose, grupo, onRecomendadoAdded }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecomendados, setSelectedRecomendados] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchRecomendados();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchRecomendados = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://backend-node-soft360-production.up.railway.app/recomendados/buscar?query=${searchTerm}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error al buscar recomendados:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecomendado = (recomendado) => {
    if (selectedRecomendados.find(r => r.identificacion === recomendado.identificacion)) {
      setSelectedRecomendados(prev =>
        prev.filter(r => r.identificacion !== recomendado.identificacion)
      );
    } else {
      setSelectedRecomendados(prev => [...prev, recomendado]);
    }
  };

  const handleAddRecomendados = async () => {
    if (selectedRecomendados.length === 0) return;

    try {
      setAdding(true);

      for (const recomendado of selectedRecomendados) {
        await axios.post(
          `https://backend-node-soft360-production.up.railway.app/grupos/${grupo.id}/recomendados`,
          { recomendado_identificacion: recomendado.identificacion }
        );
      }

      onRecomendadoAdded();
      handleClose();
    } catch (error) {
      console.error("Error al agregar recomendados:", error);
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedRecomendados([]);
    onClose();
  };

  const isRecomendadoSelected = (recomendado) => {
    return selectedRecomendados.find(r => r.identificacion === recomendado.identificacion);
  };

  const isRecomendadoInGroup = (recomendado) => {
    return recomendado.grupo_id === grupo?.id;
  };

  const isRecomendadoInAnyGroup = (recomendado) => {
    return recomendado.grupo_id !== null;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">
            Agregar Recomendados a {grupo?.nombre}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar recomendados por nombre, apellido, identificación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
          sx={{ mb: 2 }}
        />

        {selectedRecomendados.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Recomendados seleccionados ({selectedRecomendados.length}):
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {selectedRecomendados.map((rec) => (
                <Chip
                  key={rec.identificacion}
                  label={`${rec.nombre} ${rec.apellido}`}
                  onDelete={() => handleSelectRecomendado(rec)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {searchTerm.length < 2 && (
          <Alert severity="info">
            Ingresa al menos 2 caracteres para buscar recomendados
          </Alert>
        )}

        {searchTerm.length >= 2 && !loading && searchResults.length === 0 && (
          <Alert severity="warning">
            No se encontraron recomendados con el término de búsqueda
          </Alert>
        )}

        {searchResults.length > 0 && (
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {searchResults.map((recomendado) => {
              const inCurrentGroup = isRecomendadoInGroup(recomendado);
              const inAnyGroup = isRecomendadoInAnyGroup(recomendado);
              const selected = isRecomendadoSelected(recomendado);

              return (
                <Fade in={true} timeout={300} key={recomendado.identificacion}>
                  <ListItem
                    sx={{
                      border: "1px solid",
                      borderColor: selected ? "primary.main" : "grey.300",
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: selected ? "primary.50" : "background.paper",
                      opacity: inCurrentGroup ? 0.5 : 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: selected ? "primary.main" : "#018da5" }}>
                        {selected ? <CheckIcon /> : <PersonIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${recomendado.nombre} ${recomendado.apellido}`}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            ID: {recomendado.identificacion} | Cel: {recomendado.celular}
                          </Typography>
                          {inCurrentGroup && (
                            <Chip
                              label="Ya está en este grupo"
                              size="small"
                              color="success"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                          {inAnyGroup && !inCurrentGroup && (
                            <Chip
                              label={`En grupo ${recomendado.grupo_id}`}
                              size="small"
                              color="warning"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant={selected ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleSelectRecomendado(recomendado)}
                        disabled={inCurrentGroup}
                        startIcon={selected ? <CheckIcon /> : <AddIcon />}
                      >
                        {inCurrentGroup ? "En grupo" : selected ? "Seleccionado" : "Seleccionar"}
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Fade>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          startIcon={adding ? <CircularProgress size={16} /> : <AddIcon />}
          onClick={handleAddRecomendados}
          disabled={selectedRecomendados.length === 0 || adding}
        >
          {adding ? "Agregando..." : `Agregar ${selectedRecomendados.length} Recomendado${selectedRecomendados.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRecomendadoModal;