import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
} from "@mui/material";
import useColombiaLocation from "../../hooks/useColombiaLocation";

const VotanteEditModal = ({ open, onClose, votante, onChange, onSave, loading }) => {
  // Estados para manejo de dirección estructurada
  const [direccionParseada, setDireccionParseada] = useState({
    departamento: "",
    municipio: "",
    barrio: "",
    direccion: ""
  });

  // Usar el custom hook para manejar ubicaciones de Colombia
  const {
    departamentos,
    municipiosFiltrados,
    loading: loadingDepartamentos,
    error: errorDepartamentos
  } = useColombiaLocation(open, direccionParseada.departamento);

  // Mostrar error si hay problemas cargando ubicaciones
  useEffect(() => {
    if (errorDepartamentos) {
      alert(errorDepartamentos);
    }
  }, [errorDepartamentos]);

  // Parsear dirección existente cuando se abre el modal
  useEffect(() => {
    if (open && votante?.direccion) {
      const parsed = parsearDireccionExistente(votante.direccion);
      setDireccionParseada(parsed);
    }
  }, [open, votante?.direccion]);

  // Parsear dirección existente
  const parsearDireccionExistente = (direccionCompleta) => {
    const resultado = {
      departamento: "",
      municipio: "",
      barrio: "",
      direccion: direccionCompleta
    };
    
    try {
      const deptoMatch = direccionCompleta.match(/Depto: ([^,]+),/);
      const municipioMatch = direccionCompleta.match(/Municipio: ([^,]+),/);
      const barrioMatch = direccionCompleta.match(/Barrio: ([^,]+),/);
      const direccionMatch = direccionCompleta.match(/Dirección: (.+)$/);
      
      if (deptoMatch) resultado.departamento = deptoMatch[1].trim();
      if (municipioMatch) resultado.municipio = municipioMatch[1].trim();
      if (barrioMatch) resultado.barrio = barrioMatch[1].trim();
      if (direccionMatch) resultado.direccion = direccionMatch[1].trim();
    } catch (error) {
      console.error("Error al parsear dirección:", error);
    }

    return resultado;
  };

  // Construir dirección completa
  const construirDireccionCompleta = () => {
    const { departamento, municipio, barrio, direccion } = direccionParseada;
    let direccionCompleta = "";
    
    if (departamento) direccionCompleta += `Departamento: ${departamento}, `;
    if (municipio) direccionCompleta += `Municipio: ${municipio}, `;
    if (barrio) direccionCompleta += `Barrio: ${barrio}, `;
    if (direccion) direccionCompleta += `Dirección: ${direccion}`;
    
    return direccionCompleta;
  };

  // Manejar cambios en los campos de ubicación
  const handleLocationChange = (e) => {
    const { name, value } = e.target;

    // NO convertir a mayúsculas departamento y ciudad (vienen de la API con formato específico)
    // Solo convertir barrio y dirección
    let processedValue = value;
    if (name !== "departamento" && name !== "municipio") {
      processedValue = value.toUpperCase();
    }

    if (name === "departamento") {
      setDireccionParseada(prev => ({
        ...prev,
        [name]: processedValue,
        municipio: "",
        barrio: ""
      }));
    } else if (name === "municipio") {
      setDireccionParseada(prev => ({
        ...prev,
        [name]: processedValue,
        barrio: ""
      }));
    } else {
      setDireccionParseada(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
  };

  // Manejar cambios en campos normales con validaciones
  const handleFieldChange = (e) => {
    const { name, value } = e.target;

    // Convertir a mayúsculas todos los campos excepto email
    let processedValue = value;
    if (name !== "email") {
      processedValue = value.toUpperCase();
    }

    // Validación de celular (solo números, máximo 10)
    if (name === "celular") {
      processedValue = processedValue.replace(/\D/g, "");
      if (processedValue.length > 10) {
        processedValue = processedValue.slice(0, 10);
      }
    }

    // Crear evento sintético con valor procesado
    const syntheticEvent = {
      target: {
        name,
        value: processedValue
      }
    };

    onChange(syntheticEvent);
  };

  // Manejar guardado con dirección estructurada
  const handleSave = () => {
    // Validaciones antes de guardar
    if (votante.celular && votante.celular.length !== 10) {
      alert("El celular debe tener exactamente 10 dígitos");
      return;
    }

    // Construir la dirección completa y actualizar el votante
    const direccionCompleta = construirDireccionCompleta();

    // Crear evento sintético para mantener compatibilidad
    const syntheticEvent = {
      target: {
        name: "direccion",
        value: direccionCompleta
      }
    };

    // Actualizar la dirección en el objeto votante
    onChange(syntheticEvent);

    // Llamar a onSave después de un breve delay para asegurar que el estado se actualice
    setTimeout(() => {
      onSave();
    }, 0);
  };

  if (!votante) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={(theme) => ({
          background: theme.palette.primary.main,
          color: "#fff",
        })}
      >
        Editar Votante
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="Identificación"
              name="identificacion"
              value={votante.identificacion}
              onChange={handleFieldChange}
              fullWidth
              required
              disabled
              helperText="No se puede modificar"
            />
            <TextField
              label="Email"
              name="email"
              value={votante.email || ""}
              onChange={handleFieldChange}
              fullWidth
              helperText="Opcional"
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="Nombre"
              name="nombre"
              value={votante.nombre}
              onChange={handleFieldChange}
              fullWidth
              required
            />
            <TextField
              label="Apellido"
              name="apellido"
              value={votante.apellido}
              onChange={handleFieldChange}
              fullWidth
              required
            />
          </Box>

          <TextField
            label="Celular"
            name="celular"
            value={votante.celular || ""}
            onChange={handleFieldChange}
            fullWidth
            sx={{ mb: 2 }}
            helperText="Debe tener exactamente 10 dígitos (opcional)"
            error={votante.celular && votante.celular.length > 0 && votante.celular.length !== 10}
          />

          {/* Información de ubicación con API Colombia */}
          <Typography variant="h6" sx={(theme) => ({ mt: 2, mb: 2, color: theme.palette.primary.main })}>
            Información de Ubicación
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="departamento-label">Departamento</InputLabel>
              <Select
                labelId="departamento-label"
                name="departamento"
                value={direccionParseada.departamento}
                label="Departamento"
                onChange={handleLocationChange}
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

            <FormControl fullWidth disabled={!direccionParseada.departamento}>
              <InputLabel id="municipio-label">Ciudad/Municipio</InputLabel>
              <Select
                labelId="municipio-label"
                name="municipio"
                value={direccionParseada.municipio}
                label="Ciudad/Municipio"
                onChange={handleLocationChange}
              >
                {municipiosFiltrados.map((mun) => (
                  <MenuItem key={mun.id} value={mun.name}>
                    {mun.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {municipiosFiltrados.length === 0 && direccionParseada.departamento ? "No hay municipios disponibles" : "Seleccione la ciudad o municipio"}
              </FormHelperText>
            </FormControl>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="Barrio/Localidad"
              name="barrio"
              value={direccionParseada.barrio}
              onChange={handleLocationChange}
              fullWidth
              placeholder="Ingrese el nombre del barrio"
              helperText="Barrio o localidad (opcional)"
            />
            <TextField
              label="Dirección específica"
              name="direccion"
              value={direccionParseada.direccion}
              onChange={handleLocationChange}
              fullWidth
              placeholder="Ej: Carrera 54 #68-21 - Apto 5"
              helperText="Dirección específica"
            />
          </Box>

          {/* Vista previa de dirección completa */}
          {(direccionParseada.departamento || direccionParseada.municipio || direccionParseada.barrio || direccionParseada.direccion) && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Vista previa de dirección completa:
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                {construirDireccionCompleta()}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          sx={(theme) => ({
            background: theme.palette.primary.main,
          })}
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VotanteEditModal;