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
} from "@mui/material";
import { Search as SearchIcon, Close, Group as GroupIcon } from "@mui/icons-material";
import axios from "axios";

const SearchGroupModal = ({ open, onClose, onSelectGroup }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      let url = "https://backend-node-soft360-production.up.railway.app/grupos";
      if (searchQuery.trim()) {
        url = `https://backend-node-soft360-production.up.railway.app/grupos/buscar?query=${searchQuery}`;
      }
      const response = await axios.get(url);
      setGroups(response.data);
    } catch (error) {
      console.error("Error al buscar grupos:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectGroup = (group) => {
    onSelectGroup(group);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setGroups([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Buscar Grupo
        <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nombre o descripción del grupo"
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
                  sx={{
                    background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
                    color: "#fff",
                    "&:hover": {
                      background: "linear-gradient(135deg, #016d7e 0%, #097d6b 100%)",
                    },
                  }}
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

        {!loading && groups.length === 0 && (
          <Typography variant="body1" align="center" sx={{ py: 3, color: "text.secondary" }}>
            No se encontraron grupos
          </Typography>
        )}

        {!loading && groups.length > 0 && (
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {groups.map((group) => (
              <ListItem key={group.id} disablePadding>
                <ListItemButton
                  onClick={() => handleSelectGroup(group)}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    mb: 1,
                    transition: "all 0.3s",
                    "&:hover": {
                      borderColor: "#018da5",
                      backgroundColor: "rgba(1, 141, 165, 0.04)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(1, 141, 165, 0.15)",
                    },
                  }}
                >
                  <GroupIcon sx={{ mr: 2, color: "#018da5" }} />
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {group.nombre}
                        </Typography>
                        <Chip label={`ID: ${group.id}`} size="small" />
                      </Box>
                    }
                    secondary={group.descripcion || "Sin descripción"}
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

export default SearchGroupModal;
