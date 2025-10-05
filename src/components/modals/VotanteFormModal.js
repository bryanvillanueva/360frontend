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

  // Estados para datos de ubicación - API Colombia
  const [departamentos, setDepartamentos] = useState([]);
  const [todosMunicipios, setTodosMunicipios] = useState([]);
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);

  // Cargar departamentos y municipios usando API Colombia
  useEffect(() => {
    const fetchDepartamentosYMunicipios = async () => {
      setLoadingDepartamentos(true);
      try {
        // Cargar departamentos
        const deptosResponse = await axios.get("https://api-colombia.com/api/v1/Department");
        console.log("Departamentos obtenidos:", deptosResponse.data);
        
        // FILTRAR BOGOTÁ DE LOS DEPARTAMENTOS (porque debe aparecer como ciudad en Cundinamarca)
        const departamentosFiltrados = deptosResponse.data.filter(depto => 
          depto.name !== "Bogotá D.C." && 
          depto.name !== "Bogota" && 
          depto.name !== "Bogotá"
        );
        
        // ORDENAR DEPARTAMENTOS ALFABÉTICAMENTE
        const departamentosOrdenados = departamentosFiltrados.sort((a, b) => 
          a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        );
        setDepartamentos(departamentosOrdenados);

        // Cargar todos los municipios
        const municipiosResponse = await axios.get("https://api-colombia.com/api/v1/City");
        console.log("Municipios obtenidos:", municipiosResponse.data);
        
        let municipiosProcesados = [...municipiosResponse.data];
        
        // BUSCAR EL ID DE CUNDINAMARCA
        const cundinamarca = departamentosOrdenados.find(dept => 
          dept.name === "Cundinamarca"
        );
        
        if (cundinamarca) {
          // VERIFICAR SI BOGOTÁ YA EXISTE EN LOS MUNICIPIOS DE CUNDINAMARCA
          const bogotaExiste = municipiosProcesados.some(municipio => 
            (municipio.name === "Bogotá" || 
             municipio.name === "Bogotá D.C." || 
             municipio.name === "Bogota") && 
            municipio.departmentId === cundinamarca.id
          );
          
          // SI BOGOTÁ NO EXISTE COMO MUNICIPIO DE CUNDINAMARCA, AGREGARLA
          if (!bogotaExiste) {
            const bogotaMunicipio = {
              id: 999999, // ID temporal único
              name: "Bogotá D.C.",
              description: "Capital de Colombia",
              departmentId: cundinamarca.id,
              department: cundinamarca
            };
            municipiosProcesados.push(bogotaMunicipio);
            console.log("Bogotá agregada como municipio de Cundinamarca");
          }
        }
        
        // ORDENAR MUNICIPIOS ALFABÉTICAMENTE
        const municipiosOrdenados = municipiosProcesados.sort((a, b) => 
          a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        );
        setTodosMunicipios(municipiosOrdenados);
        
      } catch (error) {
        console.error("Error al cargar datos de ubicación:", error);
        alert("Error al cargar la información de ubicación. Verifica tu conexión a internet.");
      } finally {
        setLoadingDepartamentos(false);
      }
    };

    if (open) {
      fetchDepartamentosYMunicipios();
    }
  }, [open]);

  // Filtrar municipios cuando se selecciona un departamento
  useEffect(() => {
    if (!formData.departamento) {
      setMunicipiosFiltrados([]);
      return;
    }

    // Buscar el ID del departamento seleccionado
    const departamentoSeleccionado = departamentos.find(
      dept => dept.name === formData.departamento
    );
    
    if (!departamentoSeleccionado) {
      console.error("Departamento no encontrado:", formData.departamento);
      setMunicipiosFiltrados([]);
      return;
    }

    console.log("Departamento seleccionado:", departamentoSeleccionado);
    console.log("ID del departamento:", departamentoSeleccionado.id);

    // Filtrar municipios por departamento Y ORDENAR ALFABÉTICAMENTE
    const municipiosDelDepartamento = todosMunicipios
      .filter(municipio => municipio.departmentId === departamentoSeleccionado.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

    console.log("Municipios filtrados para", formData.departamento, ":", municipiosDelDepartamento);
    setMunicipiosFiltrados(municipiosDelDepartamento);
  }, [formData.departamento, departamentos, todosMunicipios]);

  // FUNCIÓN AUXILIAR PARA NORMALIZAR NOMBRES DE DEPARTAMENTOS
  const normalizarNombreDepartamento = (nombre) => {
    const normalizaciones = {
      "Bogotá D.C.": "Cundinamarca",
      "Bogotá": "Cundinamarca",
      "Bogota": "Cundinamarca"
    };
    return normalizaciones[nombre] || nombre;
  };

  // Construir dirección completa
  const construirDireccionCompleta = () => {
    const { departamento, ciudad, barrio, direccion } = formData;
    let direccionCompleta = "";
    
    // Normalizar el departamento antes de construir la dirección
    const departamentoNormalizado = normalizarNombreDepartamento(departamento);
    
    if (departamentoNormalizado) direccionCompleta += `Departamento: ${departamentoNormalizado}, `;
    if (ciudad) direccionCompleta += `Ciudad: ${ciudad}, `;
    if (barrio) direccionCompleta += `Barrio: ${barrio}, `;
    if (direccion) direccionCompleta += `Dirección: ${direccion}`;
    
    return direccionCompleta;
  };

  // Manejar cambios de formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia el departamento, limpiar ciudad, barrio y dirección
    if (name === "departamento") {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        ciudad: "",
        barrio: "",
        direccion: ""
      }));
    } else if (name === "ciudad") {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        barrio: "",
        direccion: ""
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
      // Construir la dirección completa estructurada
      const direccionCompleta = construirDireccionCompleta();
      const datosEnvio = {
        ...formData,
        direccion: direccionCompleta
      };

      await axios.post(
        "https://backend-node-soft360-production.up.railway.app/votantes",
        datosEnvio
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al crear votante:", error);
      alert(error.response?.data?.error || "Error al crear votante");
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

              {/* Campos de ubicación con API Colombia */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, color: "#018da5" }}>
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