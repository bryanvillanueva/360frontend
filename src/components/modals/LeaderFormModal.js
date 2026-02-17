import React, { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import SearchRecommendedModal from "./SearchRecommendedModal";
import useColombiaLocation from "../../hooks/useColombiaLocation";

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

  // Usar el custom hook para manejar ubicaciones de Colombia
  const {
    departamentos,
    municipiosFiltrados,
    loading: loadingDepartamentos,
    error: errorDepartamentos
  } = useColombiaLocation(open, formData.departamento);

  // Mostrar error si hay problemas cargando ubicaciones
  useEffect(() => {
    if (errorDepartamentos) {
      alert(errorDepartamentos);
    }
  }, [errorDepartamentos]);

  // Construir dirección completa
  const construirDireccionCompleta = () => {
    const { departamento, ciudad, barrio, direccion } = formData;
    let direccionCompleta = "";

    if (departamento) direccionCompleta += `Departamento: ${departamento}, `;
    if (ciudad) direccionCompleta += `Municipio: ${ciudad}, `;
    if (barrio) direccionCompleta += `Barrio: ${barrio}, `;
    if (direccion) direccionCompleta += `Dirección: ${direccion}`;

    return direccionCompleta;
  };

  // Manejar cambios del formulario con lógica de ubicación
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convertir a mayúsculas todos los campos de texto excepto email, departamento y ciudad
    // (departamento y ciudad vienen de la API con formato específico)
    let processedValue = value;
    if (name !== "email" && name !== "departamento" && name !== "ciudad") {
      processedValue = value.toUpperCase();
    }

    // Validación de identificación
    if (name === "identificacion") {
      // Solo permitir números
      processedValue = processedValue.replace(/\D/g, "");
      // No permitir que inicie con cero
      if (processedValue.startsWith("0")) {
        return;
      }
      // Validar mínimo 4 dígitos al enviar (se valida en el submit)
    }

    // Validación de celular (solo números, máximo 10)
    if (name === "celular") {
      processedValue = processedValue.replace(/\D/g, "");
      if (processedValue.length > 10) {
        processedValue = processedValue.slice(0, 10);
      }
    }

    // Si cambia el departamento, limpiar ciudad y barrio
    if (name === "departamento") {
      onChange({
        target: {
          name,
          value: processedValue,
        }
      });
      // Limpiar ciudad y barrio cuando cambia el departamento
      setTimeout(() => {
        onChange({ target: { name: "ciudad", value: "" } });
        onChange({ target: { name: "barrio", value: "" } });
        onChange({ target: { name: "direccion", value: "" } });
      }, 0);
    } else if (name === "ciudad") {
      onChange({ target: { name, value: processedValue } });
      // Limpiar barrio cuando cambia la ciudad
      setTimeout(() => {
        onChange({ target: { name: "barrio", value: "" } });
        onChange({ target: { name: "direccion", value: "" } });
      }, 0);
    } else {
      onChange({ target: { name, value: processedValue } });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones antes de enviar
    if (formData.identificacion.length < 4) {
      alert("La identificación debe tener mínimo 4 dígitos");
      return;
    }

    if (formData.celular && formData.celular.length !== 10) {
      alert("El celular debe tener exactamente 10 dígitos");
      return;
    }

    onSubmit(e);
  };

  const handleSelectRecommended = (recommended) => {
    onRecommendedSelect(recommended);
    setSearchModalOpen(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={(theme) => ({
          background: theme.palette.primary.main,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        })}
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
                onChange={handleChange}
                fullWidth
                required
                disabled={isEditing && formData.original_identificacion}
                helperText="Mínimo 4 dígitos, no puede iniciar con 0"
                error={formData.identificacion && formData.identificacion.length > 0 && formData.identificacion.length < 4}
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
                          sx={(theme) => ({ color: theme.palette.primary.main })}
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
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                fullWidth
                required
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Celular"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                fullWidth
                helperText="Debe tener exactamente 10 dígitos (opcional)"
                error={formData.celular && formData.celular.length > 0 && formData.celular.length !== 10}
              />
              <TextField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                helperText="Opcional"
              />
            </Box>

            {/* Información de ubicación con API Colombia */}
            <Typography variant="h6" sx={(theme) => ({ mt: 2, mb: 1, color: theme.palette.primary.main })}>
              Información de Ubicación
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="departamento-label">Departamento</InputLabel>
                <Select
                  labelId="departamento-label"
                  name="departamento"
                  value={formData.departamento}
                  label="Departamento"
                  onChange={handleChange}
                  disabled={loadingDepartamentos}
                >
                  {departamentos.map((depto) => (
                    <MenuItem key={depto.id} value={depto.name}>
                      {depto.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {loadingDepartamentos ? "Cargando departamentos..." : "Seleccione el departamento"}
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth disabled={!formData.departamento}>
                <InputLabel id="ciudad-label">Ciudad/Municipio</InputLabel>
                <Select
                  labelId="ciudad-label"
                  name="ciudad"
                  value={formData.ciudad}
                  label="Ciudad/Municipio"
                  onChange={handleChange}
                >
                  {municipiosFiltrados.map((mun) => (
                    <MenuItem key={mun.id} value={mun.name}>
                      {mun.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {municipiosFiltrados.length === 0 && formData.departamento ? "No hay municipios disponibles" : "Seleccione la ciudad o municipio"}
                </FormHelperText>
              </FormControl>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Barrio/Localidad"
                name="barrio"
                value={formData.barrio}
                onChange={handleChange}
                fullWidth
                placeholder="Ingrese el nombre del barrio"
                helperText="Barrio o localidad (opcional)"
              />
              <TextField
                label="Dirección específica"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                fullWidth
                placeholder="Ej: Carrera 54 #68-21 - Apto 5"
                helperText="Dirección específica (calle, carrera, número)"
              />
            </Box>

            {/* Vista previa de dirección completa */}
            {(formData.departamento || formData.ciudad || formData.barrio || formData.direccion) && (
              <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Vista previa de dirección completa:
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {construirDireccionCompleta()}
                </Typography>
              </Box>
            )}

            <TextField
              label="Expectativa de Votantes"
              name="objetivo"
              type="number"
              value={formData.objetivo}
              onChange={handleChange}
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
            sx={(theme) => ({
              background: theme.palette.primary.main,
            })}
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