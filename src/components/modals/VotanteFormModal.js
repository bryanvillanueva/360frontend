import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, Grid, CircularProgress,
  IconButton, InputAdornment, Chip, FormControl, InputLabel,
  Select, MenuItem, FormHelperText
} from "@mui/material";
import { Close } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import SearchLeaderModal from "./SearchLeaderModal";
import axios from "../../services/axiosConfig";
import useColombiaLocation from "../../hooks/useColombiaLocation";

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
    if (ciudad) direccionCompleta += `Ciudad: ${ciudad}, `;
    if (barrio) direccionCompleta += `Barrio: ${barrio}, `;
    if (direccion) direccionCompleta += `Dirección: ${direccion}`;

    return direccionCompleta;
  };

  // Manejar cambios de formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convertir a mayúsculas todos los campos de texto excepto email, departamento y ciudad
    // (departamento y ciudad vienen de la API con formato específico)
    let processedValue = value || ""; // Proteger contra null/undefined
    if (name !== "email" && name !== "departamento" && name !== "ciudad") {
      processedValue = processedValue.toUpperCase();
    }

    // Validación de identificación
    if (name === "identificacion") {
      // Solo permitir números
      processedValue = processedValue.replace(/\D/g, "");
      // No permitir que inicie con cero
      if (processedValue.startsWith("0")) {
        return;
      }
    }

    // Validación de celular (solo números, máximo 10)
    if (name === "celular") {
      processedValue = processedValue.replace(/\D/g, "");
      if (processedValue.length > 10) {
        processedValue = processedValue.slice(0, 10);
      }
    }

    // Si cambia el departamento, limpiar ciudad, barrio y dirección
    if (name === "departamento") {
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
        ciudad: "",
        barrio: "",
        direccion: ""
      }));
    } else if (name === "ciudad") {
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
        barrio: "",
        direccion: ""
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: processedValue }));
    }
  };

  // Seleccionar líder desde modal
  const handleSelectLeader = (leader) => {
    setLeaderData(leader);
    setFormData((prev) => ({
      ...prev,
      lider_identificacion: leader.identificacion, // Correcto: usar 'identificacion' no 'lider_identificacion'
    }));
    setSearchModalOpen(false);
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
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

    if (!formData.lider_identificacion) {
      alert("Debes seleccionar un líder para reportar el votante");
      return;
    }

    setLoading(true);
    try {
      // Construir la dirección completa estructurada
      const direccionCompleta = construirDireccionCompleta();

      // ARQUITECTURA DE STAGING: Usar POST /capturas
      // El trigger del backend se encargará de:
      // 1. Crear votante canónico (si no existe)
      // 2. Crear asignación N:M
      // 3. Detectar duplicados/incidencias
      // 4. Crear variantes
      const datosCaptura = {
        identificacion_reportada: formData.identificacion, // Campo correcto según backend
        lider_identificacion: formData.lider_identificacion,
        nombre_reportado: formData.nombre,
        apellido_reportado: formData.apellido
      };

      // Solo añadir campos opcionales si tienen valor
      if (formData.celular) datosCaptura.celular_reportado = formData.celular;
      if (formData.email) datosCaptura.email_reportado = formData.email;
      if (formData.departamento) datosCaptura.departamento_reportado = formData.departamento;
      if (formData.ciudad) datosCaptura.ciudad_reportada = formData.ciudad;
      if (formData.barrio) datosCaptura.barrio_reportado = formData.barrio;
      if (direccionCompleta) datosCaptura.direccion_reportada = direccionCompleta;

      // Debug: Ver qué se está enviando
      console.log("📤 Enviando a POST /capturas:", datosCaptura);

      const response = await axios.post(
        "https://backend-node-soft360-production.up.railway.app/capturas",
        datosCaptura
      );

      console.log("📥 Respuesta del backend:", response.data);

      // Verificar si hay incidencias en la respuesta
      if (response.data.incidencias && response.data.incidencias.length > 0) {
        const incidencias = response.data.incidencias;
        const tipos = incidencias.map(i => i.tipo).join(', ');

        alert(`⚠️ Votante registrado pero se detectaron incidencias:\n\n${tipos}\n\nRevisa el historial del votante para más detalles.`);
      } else {
        alert("✅ Votante registrado exitosamente");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("❌ Error completo:", error);
      console.error("📋 Respuesta del servidor:", error.response?.data);

      const errorMsg = error.response?.data?.error ||
                       error.response?.data?.message ||
                       error.response?.data?.details ||
                       error.message ||
                       "Error al registrar votante";

      alert(`❌ Error del servidor:\n\n${errorMsg}\n\nRevisa la consola para más detalles.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
                  helperText="Mínimo 4 dígitos, no puede iniciar con 0"
                  error={formData.identificacion && formData.identificacion.length > 0 && formData.identificacion.length < 4}
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
                  helperText="Debe tener exactamente 10 dígitos (opcional)"
                  error={formData.celular && formData.celular.length > 0 && formData.celular.length !== 10}
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
                  helperText="Opcional"
                />
              </Grid>

              {/* Campos de ubicación con API Colombia */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={(theme) => ({ mb: 1, color: theme.palette.primary.main })}>
                  Información de Ubicación
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="departamento-label">Departamento</InputLabel>
                  <Select
                    labelId="departamento-label"
                    name="departamento"
                    value={formData.departamento}
                    label="Departamento"
                    onChange={handleChange}
                    required
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
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!formData.departamento}>
                  <InputLabel id="ciudad-label">Ciudad/Municipio</InputLabel>
                  <Select
                    labelId="ciudad-label"
                    name="ciudad"
                    value={formData.ciudad}
                    label="Ciudad/Municipio"
                    onChange={handleChange}
                    required
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
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Barrio/Localidad"
                  name="barrio"
                  value={formData.barrio}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Ingrese el nombre del barrio"
                  helperText="Barrio o localidad (opcional)"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Dirección específica"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Ej: Carrera 54 #68-21 - Apto 5"
                  helperText="Dirección específica (calle, carrera, número)"
                />
              </Grid>

              {/* Vista previa de dirección completa */}
              {(formData.departamento || formData.ciudad || formData.barrio || formData.direccion) && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Vista previa de dirección completa:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      {construirDireccionCompleta()}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {/* Campo de líder con buscador */}
              <Grid item xs={12}>
                <TextField
                  label="Buscar Líder *"
                  value={
                    leaderData
                      ? `${leaderData.nombre} ${leaderData.apellido} (${leaderData.identificacion})`
                      : ""
                  }
                  fullWidth
                  required
                  error={!formData.lider_identificacion}
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
                  placeholder="Haz clic en buscar para seleccionar un líder (REQUERIDO)"
                  sx={{ cursor: "pointer" }}
                  onClick={() => setSearchModalOpen(true)}
                  helperText="OBLIGATORIO - El líder que reporta este votante debe ser especificado"
                />
                {leaderData && (
                  <Box sx={{ mt: 1, display: "flex", gap: 1, alignItems: "center" }}>
                    <Chip
                      label={`${leaderData.nombre} ${leaderData.apellido}`}
                      color="primary"
                      size="small"
                      onDelete={() => {
                        setLeaderData(null);
                        setFormData((prev) => ({ ...prev, lider_identificacion: "" }));
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      ID: {leaderData.identificacion}
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
              sx={(theme) => ({
                background: theme.palette.primary.main,
              })}
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