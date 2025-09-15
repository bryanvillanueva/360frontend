import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, Grid, CircularProgress,
  IconButton, InputAdornment, Chip
} from "@mui/material";
import { Close } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import SearchLeaderModal from "./SearchLeaderModal";
import axios from "axios";

const VotanteFormModal = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    identificacion: "",
    nombre: "",
    apellido: "",
    celular: "",
    email: "",
    departamento: "",
    ciudad: "",
    barrio: "",
    direccion: "",
    lider_identificacion: "",
  });

  const [leaderData, setLeaderData] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Manejar cambios de formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Seleccionar líder desde modal
  const handleSelectLeader = (leader) => {
    setLeaderData(leader);
    setFormData((prev) => ({
      ...prev,
      lider_identificacion: leader.lider_identificacion,
    }));
    setSearchModalOpen(false);
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "https://backend-node-soft360-production.up.railway.app/votantes",
        formData
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al crear votante:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Nuevo Votante</Typography>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Identificación"
                  name="identificacion"
                  value={formData.identificacion}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Celular"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Barrio"
                  name="barrio"
                  value={formData.barrio}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Dirección"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              {/* Campo de líder con buscador */}
              <Grid item xs={12}>
                <TextField
                  label="Buscar Líder"
                  value={
                    leaderData
                      ? `${leaderData.lider_nombre} ${leaderData.lider_apellido} (${leaderData.lider_identificacion})`
                      : ""
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setSearchModalOpen(true)}
                          edge="end"
                          sx={{ color: "#018da5" }}
                        >
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Haz clic en buscar para seleccionar un líder"
                  sx={{ cursor: "pointer" }}
                  onClick={() => setSearchModalOpen(true)}
                />
                {leaderData && (
                  <Box sx={{ mt: 1, display: "flex", gap: 1, alignItems: "center" }}>
                    <Chip
                      label={`${leaderData.lider_nombre} ${leaderData.lider_apellido}`}
                      color="primary"
                      size="small"
                      onDelete={() => {
                        setLeaderData(null);
                        setFormData((prev) => ({ ...prev, lider_identificacion: "" }));
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      ID: {leaderData.lider_identificacion}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} variant="outlined">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: "linear-gradient(135deg, rgb(1, 141, 165) 0%, rgb(11, 155, 138) 100%)",
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal de búsqueda de líderes */}
      <SearchLeaderModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectLeader={handleSelectLeader}
      />
    </>
  );
};

export default VotanteFormModal;
