import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  DialogActions,
  Button,
  alpha,
} from "@mui/material";
import { Search as SearchIcon, Close, Clear } from "@mui/icons-material";
import axios from "axios";

const SearchLeaderModal = ({ open, onClose, onSelectLeader }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);

  // Cargar los primeros 10 líderes al abrir el modal
  React.useEffect(() => {
    if (open && !initialLoad) {
      loadInitialLeaders();
    }
  }, [open]);

  // Función para normalizar la estructura de datos de líderes
  const normalizeLeader = (leader) => {
    // Si el líder viene con prefijo 'lider_', normalizar a sin prefijo
    return {
      identificacion: leader.identificacion || leader.lider_identificacion,
      nombre: leader.nombre || leader.lider_nombre,
      apellido: leader.apellido || leader.lider_apellido,
      celular: leader.celular || leader.lider_celular,
      email: leader.email || leader.lider_email,
      recomendado_nombre: leader.recomendado_nombre || leader.lider_recomendado_nombre,
      // Mantener todos los campos originales también
      ...leader
    };
  };

  const loadInitialLeaders = async () => {
    setLoading(true);
    try {
      // Obtener los primeros 10 líderes
      const response = await axios.get(
        `https://backend-node-soft360-production.up.railway.app/lideres?limit=10`
      );

      // Debug: Ver estructura de datos
      console.log("📊 Estructura de líderes desde /lideres?limit=10:", response.data);
      if (response.data && response.data.length > 0) {
        console.log("📋 Primer líder (ejemplo):", response.data[0]);
      }

      // Normalizar la estructura de datos
      const normalizedLeaders = (response.data || []).map(normalizeLeader);
      console.log("✅ Líderes normalizados:", normalizedLeaders);
      setLeaders(normalizedLeaders);
      setInitialLoad(true);
    } catch (error) {
      console.error("Error al cargar líderes:", error);
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Si no hay búsqueda, recargar los primeros 10
      loadInitialLeaders();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://backend-node-soft360-production.up.railway.app/lideres/buscar?query=${searchQuery}`
      );
      // Normalizar la estructura de datos
      const normalizedLeaders = (response.data || []).map(normalizeLeader);
      setLeaders(normalizedLeaders);
    } catch (error) {
      console.error("Error al buscar líderes:", error);
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectLeader = (leader) => {
    onSelectLeader(leader);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setLeaders([]);
    setInitialLoad(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={(theme) => ({
        background: theme.palette.primary.main,
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      })}>
        Buscar Líder
        <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por identificación, nombre, apellido, celular o email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchQuery("");
                      loadInitialLeaders();
                    }}
                    sx={{ mr: 1 }}
                    title="Limpiar búsqueda"
                  >
                    <Clear />
                  </IconButton>
                )}
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  variant="contained"
                  size="small"
                  sx={(theme) => ({
                    background: theme.palette.primary.main,
                    minWidth: "80px"
                  })}
                >
                  Buscar
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && leaders.length === 0 && searchQuery && (
          <Typography variant="body1" align="center" sx={{ py: 3, color: "text.secondary" }}>
            No se encontraron líderes con ese criterio de búsqueda
          </Typography>
        )}

        {!loading && leaders.length === 0 && !searchQuery && (
          <Typography variant="body1" align="center" sx={{ py: 3, color: "text.secondary" }}>
            No hay líderes disponibles
          </Typography>
        )}

        {!loading && leaders.length > 0 && (
          <Box>
            {!searchQuery && (
              <Typography variant="caption" sx={{ display: "block", mb: 1, color: "text.secondary", px: 2 }}>
                Mostrando los primeros {leaders.length} líderes. Usa el buscador para encontrar uno específico.
              </Typography>
            )}
            {searchQuery && (
              <Typography variant="caption" sx={{ display: "block", mb: 1, color: "primary.main", px: 2 }}>
                {leaders.length} resultado(s) encontrado(s) para "{searchQuery}"
              </Typography>
            )}
            <List sx={{ maxHeight: 400, overflow: "auto" }}>
              {leaders.map((leader) => (
                <ListItem key={leader.identificacion} disablePadding>
                  <ListItemButton onClick={() => handleSelectLeader(leader)} sx={(theme) => ({
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  })}>
                    <ListItemText
                      primary={`${leader.nombre} ${leader.apellido}`}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            ID: {leader.identificacion} | Celular: {leader.celular || "N/A"}
                          </Typography>
                          {leader.recomendado_nombre && (
                            <Typography variant="caption" display="block" sx={{ color: "primary.main" }}>
                              Recomendado por: {leader.recomendado_nombre}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchLeaderModal;