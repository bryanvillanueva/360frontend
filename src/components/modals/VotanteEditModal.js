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
import axios from "axios";

const VotanteEditModal = ({ open, onClose, votante, onChange, onSave, loading }) => {
  // Estados para datos de ubicación - API Colombia
  const [departamentos, setDepartamentos] = useState([]);
  const [todosMunicipios, setTodosMunicipios] = useState([]);
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);

  // Estados para manejo de dirección estructurada
  const [direccionParseada, setDireccionParseada] = useState({
    departamento: "",
    municipio: "",
    barrio: "",
    direccion: ""
  });

  // Cargar departamentos y municipios usando API Colombia
  useEffect(() => {
    const fetchDepartamentosYMunicipios = async () => {
      setLoadingDepartamentos(true);
      try {
        // Cargar departamentos
        const deptosResponse = await axios.get("https://api-colombia.com/api/v1/Department");
        
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

  // Parsear dirección existente cuando se abre el modal
  useEffect(() => {
    if (open && votante?.direccion) {
      const parsed = parsearDireccionExistente(votante.direccion);
      setDireccionParseada(parsed);
    }
  }, [open, votante?.direccion]);

  // Filtrar municipios cuando se selecciona un departamento
  useEffect(() => {
    if (!direccionParseada.departamento) {
      setMunicipiosFiltrados([]);
      return;
    }

    // Buscar el ID del departamento seleccionado
    const departamentoSeleccionado = departamentos.find(
      dept => dept.name === direccionParseada.departamento
    );
    
    if (!departamentoSeleccionado) {
      setMunicipiosFiltrados([]);
      return;
    }

    // Filtrar municipios por departamento Y ORDENAR ALFABÉTICAMENTE
    const municipiosDelDepartamento = todosMunicipios
      .filter(municipio => municipio.departmentId === departamentoSeleccionado.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

    setMunicipiosFiltrados(municipiosDelDepartamento);
  }, [direccionParseada.departamento, departamentos, todosMunicipios]);

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
      
      // SI EL MUNICIPIO ES BOGOTÁ PERO EL DEPARTAMENTO NO ES CUNDINAMARCA, CORREGIRLO
      if ((resultado.municipio === "Bogotá" || 
           resultado.municipio === "Bogotá D.C." || 
           resultado.municipio === "Bogota") && 
          resultado.departamento !== "Cundinamarca") {
        resultado.departamento = "Cundinamarca";
      }
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
    
    if (name === "departamento") {
      setDireccionParseada(prev => ({
        ...prev,
        [name]: value,
        municipio: "",
        barrio: ""
      }));
    } else if (name === "municipio") {
      setDireccionParseada(prev => ({
        ...prev,
        [name]: value,
        barrio: ""
      }));
    } else {
      setDireccionParseada(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Manejar guardado con dirección estructurada
  const handleSave = () => {
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
        sx={{
          background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
          color: "#fff",
        }}
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
              onChange={onChange}
              fullWidth
              required
              disabled
            />
            <TextField
              label="Email"
              name="email"
              value={votante.email || ""}
              onChange={onChange}
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="Nombre"
              name="nombre"
              value={votante.nombre}
              onChange={onChange}
              fullWidth
              required
            />
            <TextField
              label="Apellido"
              name="apellido"
              value={votante.apellido}
              onChange={onChange}
              fullWidth
              required
            />
          </Box>

          <TextField
            label="Celular"
            name="celular"
            value={votante.celular || ""}
            onChange={onChange}
            fullWidth
            sx={{ mb: 2 }}
          />

          {/* Información de ubicación con API Colombia */}
          <Typography variant="h6" sx={{ mt: 2, mb: 2, color: "#018da5" }}>
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
          sx={{
            background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
          }}
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VotanteEditModal;