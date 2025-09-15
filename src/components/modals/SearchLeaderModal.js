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
} from "@mui/material";
import { Search as SearchIcon, Close } from "@mui/icons-material";
import axios from "axios";

const SearchLeaderModal = ({ open, onClose, onSelectLeader }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://backend-node-soft360-production.up.railway.app/lideres/buscar?query=${searchQuery}`
      );
      setLeaders(response.data);
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
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{
        background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
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
                <Button onClick={handleSearch} disabled={loading}>
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

        {!loading && leaders.length > 0 && (
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {leaders.map((leader) => (
              <ListItem key={leader.identificacion} disablePadding>
                <ListItemButton onClick={() => handleSelectLeader(leader)}>
                  <ListItemText
                    primary={`${leader.nombre} ${leader.apellido}`}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          ID: {leader.identificacion} | Celular: {leader.celular}
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
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchLeaderModal;