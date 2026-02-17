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
  Chip,
  Avatar,
  alpha,
} from "@mui/material";
import { Search as SearchIcon, Close } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import axios from "axios";

const SearchRecommendedModal = ({ open, onClose, onSelectRecommended }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://backend-node-soft360-production.up.railway.app/recomendados/buscar?query=${searchQuery}`
      );
      setRecommended(response.data);
    } catch (error) {
      console.error("Error al buscar recomendados:", error);
      setRecommended([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectRecommended = (recommendedItem) => {
    onSelectRecommended(recommendedItem);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setRecommended([]);
    onClose();
  };

  const formatLocation = (departamento, ciudad, barrio) => {
    const location = [departamento, ciudad, barrio].filter(Boolean).join(", ");
    return location || "Ubicación no especificada";
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={(theme) => ({
          background: theme.palette.primary.main,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        })}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon />
          Buscar Recomendado
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por identificación, nombre, apellido, celular, email, departamento, ciudad o barrio"
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
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  sx={(theme) => ({
                    background: theme.palette.primary.main,
                    color: "#fff",
                    "&:hover": {
                      background: theme.palette.primary.dark,
                    }
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

        {!loading && recommended.length === 0 && searchQuery && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <PersonIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron recomendados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Intenta con otros términos de búsqueda
            </Typography>
          </Box>
        )}

        {!loading && !searchQuery && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <SearchIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Busca un recomendado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Escribe cualquier información que conozcas del recomendado
            </Typography>
          </Box>
        )}

        {!loading && recommended.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {recommended.length} recomendado{recommended.length !== 1 ? 's' : ''} encontrado{recommended.length !== 1 ? 's' : ''}
            </Typography>
            <List sx={{ maxHeight: 400, overflow: "auto" }}>
              {recommended.map((recommendedItem) => (
                <ListItem key={recommendedItem.identificacion} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => handleSelectRecommended(recommendedItem)}
                    sx={(theme) => ({
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                      transition: "all 0.3s",
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        transform: "translateY(-2px)",
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                      },
                    })}
                  >
                    <Avatar sx={(theme) => ({ mr: 2, bgcolor: theme.palette.primary.main })}>
                      <PersonIcon />
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {recommendedItem.nombre} {recommendedItem.apellido}
                          </Typography>
                          <Chip
                            label={recommendedItem.identificacion}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              📱 {recommendedItem.celular}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ✉️ {recommendedItem.email}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LocationOnIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatLocation(
                                recommendedItem.departamento,
                                recommendedItem.ciudad,
                                recommendedItem.barrio
                              )}
                            </Typography>
                          </Box>
                          {recommendedItem.direccion && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                              📍 {recommendedItem.direccion}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchRecommendedModal;