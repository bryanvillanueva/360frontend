import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Close,
  Person,
  Email,
  Phone,
  LocationOn,
  HowToReg,
  Group,
} from "@mui/icons-material";
import axios from "axios";

const ViewVotanteModal = ({ open, onClose, votante }) => {
  const [votanteDetails, setVotanteDetails] = useState(null);
  const [liderInfo, setLiderInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && votante) {
      fetchVotanteDetails();
    }
  }, [open, votante]);

  const fetchVotanteDetails = async () => {
    if (!votante) return;

    setLoading(true);
    setError(null);

    try {
      // Establecer los detalles básicos del votante
      setVotanteDetails(votante);

      // Si tiene líder, obtener información del líder
      if (votante.lider_identificacion) {
        try {
          // Intentar obtener información del líder desde el endpoint de líderes
          const liderResponse = await axios.get(
            `https://backend-node-soft360-production.up.railway.app/lideres/${votante.lider_identificacion}`
          );
          setLiderInfo(liderResponse.data);
        } catch (liderError) {
          console.warn("No se pudo obtener información del líder:", liderError);
          
          // Si falla, intentar buscar el líder en la lista de votantes
          try {
            const votanteResponse = await axios.get(
              `https://backend-node-soft360-production.up.railway.app/votantes/${votante.lider_identificacion}`
            );
            setLiderInfo({
              lider_identificacion: votanteResponse.data.identificacion,
              lider_nombre: votanteResponse.data.nombre,
              lider_apellido: votanteResponse.data.apellido,
              lider_celular: votanteResponse.data.celular,
              lider_email: votanteResponse.data.email
            });
          } catch (votanteError) {
            console.warn("El líder no se encuentra en la base de votantes:", votanteError);
            setLiderInfo(null);
          }
        }
      } else {
        setLiderInfo(null);
      }
    } catch (error) {
      console.error("Error al obtener detalles del votante:", error);
      setError("Error al cargar la información del votante");
    } finally {
      setLoading(false);
    }
  };

  // Función para parsear la dirección estructurada
  const parseDireccion = (direccionCompleta) => {
    if (!direccionCompleta) return {};
    
    try {
      const deptoMatch = direccionCompleta.match(/Depto: ([^,]+),/);
      const municipioMatch = direccionCompleta.match(/Municipio: ([^,]+),/);
      const barrioMatch = direccionCompleta.match(/Barrio: ([^,]+),/);
      const direccionMatch = direccionCompleta.match(/Dirección: (.+)$/);
      
      return {
        departamento: deptoMatch ? deptoMatch[1].trim() : "",
        municipio: municipioMatch ? municipioMatch[1].trim() : "",
        barrio: barrioMatch ? barrioMatch[1].trim() : "",
        direccion: direccionMatch ? direccionMatch[1].trim() : direccionCompleta
      };
    } catch (error) {
      console.error("Error al parsear dirección:", error);
      return { direccion: direccionCompleta };
    }
  };

  if (!votante) return null;

  const direccionParseada = parseDireccion(votante.direccion);

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Person />
          Información Detallada del Votante
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : votanteDetails ? (
          <Grid container spacing={3}>
            {/* Información Personal */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#018da5", fontWeight: 600 }}>
                    Información Personal
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Identificación
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {votanteDetails.identificacion}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nombre Completo
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {votanteDetails.nombre} {votanteDetails.apellido}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <Phone fontSize="small" color="action" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Celular
                      </Typography>
                      <Typography variant="body1">
                        {votanteDetails.celular || "No especificado"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Email fontSize="small" color="action" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {votanteDetails.email || "No especificado"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Información de Liderazgo */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#018da5", fontWeight: 600 }}>
                    <HowToReg sx={{ mr: 1, verticalAlign: "middle" }} />
                    Relación con Líder
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {votanteDetails.lider_identificacion ? (
                    liderInfo ? (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Líder Asignado:
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {liderInfo.lider_nombre || liderInfo.nombre} {liderInfo.lider_apellido || liderInfo.apellido}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>ID:</strong> {votanteDetails.lider_identificacion}
                        </Typography>
                        {liderInfo.lider_celular || liderInfo.celular ? (
                          <Typography variant="body2">
                            <strong>Celular:</strong> {liderInfo.lider_celular || liderInfo.celular}
                          </Typography>
                        ) : null}
                        {liderInfo.lider_email || liderInfo.email ? (
                          <Typography variant="body2">
                            <strong>Email:</strong> {liderInfo.lider_email || liderInfo.email}
                          </Typography>
                        ) : null}
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Líder Asignado:
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          ID: {votanteDetails.lider_identificacion}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          (Información detallada no disponible)
                        </Typography>
                      </Box>
                    )
                  ) : (
                    <Chip
                      label="Sin líder asignado"
                      color="default"
                      variant="outlined"
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Dirección */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#018da5", fontWeight: 600 }}>
                    <LocationOn sx={{ mr: 1, verticalAlign: "middle" }} />
                    Ubicación
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Departamento
                        </Typography>
                        <Typography variant="body1">
                          {direccionParseada.departamento || votanteDetails.departamento || "No especificado"}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ciudad/Municipio
                        </Typography>
                        <Typography variant="body1">
                          {direccionParseada.municipio || votanteDetails.ciudad || "No especificado"}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Barrio
                        </Typography>
                        <Typography variant="body1">
                          {direccionParseada.barrio || votanteDetails.barrio || "No especificado"}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Dirección
                        </Typography>
                        <Typography variant="body1">
                          {direccionParseada.direccion || "No especificado"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Información Adicional */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#018da5", fontWeight: 600 }}>
                    <Group sx={{ mr: 1, verticalAlign: "middle" }} />
                    Información Adicional
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Fecha de Registro
                        </Typography>
                        <Typography variant="body1">
                          {votanteDetails.fecha_registro ? 
                            new Date(votanteDetails.fecha_registro).toLocaleDateString() : 
                            "No especificado"}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Estado
                        </Typography>
                        <Chip 
                          label={votanteDetails.estado || "Activo"} 
                          color={votanteDetails.estado === "Inactivo" ? "error" : "success"} 
                          size="small" 
                        />
                      </Box>
                    </Grid>
                    
                    {votanteDetails.observaciones && (
                      <Grid item xs={12}>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Observaciones
                          </Typography>
                          <Typography variant="body1" sx={{ fontStyle: 'italic', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                            {votanteDetails.observaciones}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewVotanteModal;