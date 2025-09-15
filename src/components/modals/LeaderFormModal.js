import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import SearchRecommendedModal from "./SearchRecommendedModal";

const LeaderFormModal = ({
  open,
  onClose,
  isEditing,
  formData,
  onChange,
  onSubmit,
  loading,
  recomendadoData,
  onRecommendedSelect,
}) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleSelectRecommended = (recommended) => {
    onRecommendedSelect(recommended);
    setSearchModalOpen(false);
  };

  return (
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
        {isEditing ? "Editar Líder" : "Crear Nuevo Líder"}
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Identificación"
                name="identificacion"
                value={formData.identificacion}
                onChange={onChange}
                fullWidth
                required
                disabled={isEditing && formData.original_identificacion}
              />
              <Box>
                <TextField
                  label="Buscar Recomendado"
                  value={
                    recomendadoData
                      ? `${recomendadoData.nombre} ${recomendadoData.apellido} (${recomendadoData.identificacion})`
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
                  placeholder="Haz clic en buscar para seleccionar un recomendado"
                  sx={{ cursor: "pointer" }}
                  onClick={() => setSearchModalOpen(true)}
                />
                {recomendadoData ? (
                  <Box sx={{ mt: 1, display: "flex", gap: 1, alignItems: "center" }}>
                    <Chip
                      label={`${recomendadoData.nombre} ${recomendadoData.apellido}`}
                      color="primary"
                      size="small"
                      onDelete={() => onRecommendedSelect(null)}
                    />
                    <Typography variant="caption" color="text.secondary">
                      ID: {recomendadoData.identificacion}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    Opcional - Si no seleccionas un recomendado, se creará como autorecomendado
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={onChange}
                fullWidth
                required
              />
              <TextField
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={onChange}
                fullWidth
                required
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Celular"
                name="celular"
                value={formData.celular}
                onChange={onChange}
                fullWidth
                required
              />
              <TextField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={onChange}
                fullWidth
                required
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Departamento"
                name="departamento"
                value={formData.departamento}
                onChange={onChange}
                fullWidth
              />
              <TextField
                label="Ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={onChange}
                fullWidth
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Barrio"
                name="barrio"
                value={formData.barrio}
                onChange={onChange}
                fullWidth
              />
              <TextField
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={onChange}
                fullWidth
              />
            </Box>

            <TextField
              label="Expectativa de Votantes"
              name="objetivo"
              type="number"
              value={formData.objetivo}
              onChange={onChange}
              fullWidth
              helperText="Opcional - Meta de votantes para este líder"
            />
          </Box>
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
              background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : isEditing ? (
              "Actualizar"
            ) : (
              "Crear"
            )}
          </Button>
        </DialogActions>
      </form>

      <SearchRecommendedModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectRecommended={handleSelectRecommended}
      />
    </Dialog>
  );
};

export default LeaderFormModal;