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
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
} from "@mui/material";
import {
  Close,
  Person,
  Email,
  Phone,
  LocationOn,
  HowToReg,
  Group,
  Star,
  ManageAccounts,
  Warning,
  History,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import axios from "axios";
import VotanteLeaderesModal from "./VotanteLeaderesModal";
import { incidenciasAPI, variantesAPI } from "../api";

const ViewVotanteModal = ({ open, onClose, votante }) => {
  const [votanteDetails, setVotanteDetails] = useState(null);
  const [lideres, setLideres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leaderesModalOpen, setLeaderesModalOpen] = useState(false);

  // Nuevos estados para arquitectura de staging
  const [tabValue, setTabValue] = useState(0);
  const [incidencias, setIncidencias] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [loadingIncidencias, setLoadingIncidencias] = useState(false);
  const [loadingVariantes, setLoadingVariantes] = useState(false);
  const [expandedIncidencia, setExpandedIncidencia] = useState(null);

  useEffect(() => {
    if (open && votante) {
      fetchVotanteDetails();
      fetchIncidencias();
      fetchVariantes();
    }
  }, [open, votante]);

  const fetchVotanteDetails = async () => {
    if (!votante) return;

    setLoading(true);
    setError(null);

    try {
      // Establecer los detalles básicos del votante
      setVotanteDetails(votante);

      // Obtener todos los líderes asignados usando el nuevo endpoint
      try {
        const lideresResponse = await axios.get(
          `https://backend-node-soft360-production.up.railway.app/votantes/${votante.identificacion}/lideres`
        );
        setLideres(lideresResponse.data);
      } catch (lideresError) {
        console.warn("No se pudo obtener información de líderes:", lideresError);
        setLideres([]);
      }
    } catch (error) {
      console.error("Error al obtener detalles del votante:", error);
      setError("Error al cargar la información del votante");
    } finally {
      setLoading(false);
    }
  };

  // Obtener incidencias del votante
  const fetchIncidencias = async () => {
    if (!votante) return;
    setLoadingIncidencias(true);
    try {
      const response = await incidenciasAPI.getByVotante(votante.identificacion);
      setIncidencias(response || []);
    } catch (error) {
      console.warn("No se pudieron obtener incidencias:", error);
      setIncidencias([]);
    } finally {
      setLoadingIncidencias(false);
    }
  };

  // Obtener variantes del votante
  const fetchVariantes = async () => {
    if (!votante) return;
    setLoadingVariantes(true);
    try {
      const response = await variantesAPI.getByVotante(votante.identificacion);
      setVariantes(response || []);
    } catch (error) {
      console.warn("No se pudieron obtener variantes:", error);
      setVariantes([]);
    } finally {
      setLoadingVariantes(false);
    }
  };

  // Mapeo de tipos de incidencia a colores y textos
  const getIncidenciaTipo = (tipo) => {
    const tipos = {
      'DUPLICIDAD_CON_SI_MISMO': { color: 'warning', label: 'Duplicado Exacto', icon: <Warning /> },
      'DUPLICIDAD_LIDER': { color: 'warning', label: 'Duplicado con Mismo Líder', icon: <Warning /> },
      'DUPLICIDAD_ENTRE_LIDERES': { color: 'error', label: 'Duplicado entre Líderes', icon: <ErrorIcon /> },
      'CONFLICTO_DATOS': { color: 'info', label: 'Conflicto de Datos', icon: <History /> },
      'RESUELTO': { color: 'success', label: 'Resuelto', icon: <CheckCircle /> },
    };
    return tipos[tipo] || { color: 'default', label: tipo, icon: <Warning /> };
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Person />
          Información Detallada del Votante
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 3 }}>
            {error}
          </Alert>
        ) : votanteDetails ? (
          <Box>
            {/* Tabs para navegación */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Información General" />
                <Tab
                  label={
                    <Badge badgeContent={incidencias.length} color="error">
                      Incidencias
                    </Badge>
                  }
                />
                <Tab
                  label={
                    <Badge badgeContent={variantes.length} color="info">
                      Variantes
                    </Badge>
                  }
                />
              </Tabs>
            </Box>

            {/* Tab 0: Información General */}
            {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Información Personal */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 600 })}>
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
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 600 })}>
                      <HowToReg sx={{ mr: 1, verticalAlign: "middle" }} />
                      Líderes Asignados ({lideres.length})
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setLeaderesModalOpen(true)}
                      sx={(theme) => ({ color: theme.palette.primary.main })}
                      title="Gestionar líderes"
                    >
                      <ManageAccounts />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {lideres.length === 0 ? (
                    <Box>
                      <Chip
                        label="Sin líder asignado"
                        color="default"
                        variant="outlined"
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Haz clic en el ícono de gestión para asignar un líder
                      </Typography>
                    </Box>
                  ) : (
                    <List dense disablePadding>
                      {lideres.slice(0, 3).map((lider, index) => (
                        <ListItem key={lider.identificacion} disablePadding sx={{ mb: 1 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Typography variant="body2" fontWeight={500}>
                                  {lider.nombre} {lider.apellido}
                                </Typography>
                                {lider.es_primer_lider === 1 && (
                                  <Star fontSize="small" sx={{ color: "#FFC107" }} />
                                )}
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                ID: {lider.identificacion} • Asignado: {new Date(lider.assigned_at).toLocaleDateString("es-CO")}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                      {lideres.length > 3 && (
                        <Typography variant="caption" color="primary" sx={{ cursor: "pointer", mt: 1, display: "block" }}
                          onClick={() => setLeaderesModalOpen(true)}>
                          Ver todos ({lideres.length})...
                        </Typography>
                      )}
                    </List>
                  )}

                  {lideres.length > 1 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="caption">
                        Este votante tiene múltiples líderes asignados
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Dirección */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 600 })}>
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
                  <Typography variant="h6" gutterBottom sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 600 })}>
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
          </Box>
            )}

            {/* Tab 1: Incidencias */}
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                {loadingIncidencias ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : incidencias.length === 0 ? (
                  <Alert severity="success">
                    <Typography variant="body1">
                      No hay incidencias registradas para este votante
                    </Typography>
                  </Alert>
                ) : (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={(theme) => ({ color: theme.palette.primary.main, mb: 2 })}>
                      Historial de Incidencias ({incidencias.length})
                    </Typography>
                    {incidencias.map((inc, index) => {
                      const tipoInfo = getIncidenciaTipo(inc.tipo);
                      const isExpanded = expandedIncidencia === inc.id;

                      return (
                        <Card key={inc.id} sx={{ mb: 2, borderLeft: `4px solid ${
                          tipoInfo.color === 'error' ? '#d32f2f' :
                          tipoInfo.color === 'warning' ? '#ed6c02' :
                          tipoInfo.color === 'info' ? '#0288d1' : '#2e7d32'
                        }` }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {tipoInfo.icon}
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {tipoInfo.label}
                                </Typography>
                                <Chip
                                  label={inc.estado || 'Pendiente'}
                                  size="small"
                                  color={inc.estado === 'RESUELTO' ? 'success' : 'warning'}
                                />
                              </Box>
                              <IconButton size="small" onClick={() => setExpandedIncidencia(isExpanded ? null : inc.id)}>
                                {isExpanded ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                            </Box>

                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                              Detectada: {new Date(inc.fecha_incidencia).toLocaleString('es-CO')}
                              {inc.lider_identificacion && ` • Líder: ${inc.lider_identificacion}`}
                            </Typography>

                            <Collapse in={isExpanded}>
                              <Divider sx={{ my: 2 }} />
                              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>Detalles:</Typography>
                                <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                                  {JSON.stringify(inc.detalles, null, 2)}
                                </pre>
                              </Box>
                              {inc.resolucion && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                                  <Typography variant="subtitle2" gutterBottom>Resolución:</Typography>
                                  <Typography variant="body2">{inc.resolucion}</Typography>
                                  {inc.fecha_resolucion && (
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                      Resuelta: {new Date(inc.fecha_resolucion).toLocaleString('es-CO')}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </Collapse>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                )}
              </Box>
            )}

            {/* Tab 2: Variantes */}
            {tabValue === 2 && (
              <Box sx={{ p: 3 }}>
                {loadingVariantes ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : variantes.length === 0 ? (
                  <Alert severity="info">
                    <Typography variant="body1">
                      No hay variantes registradas para este votante
                    </Typography>
                  </Alert>
                ) : (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={(theme) => ({ color: theme.palette.primary.main, mb: 2 })}>
                      Historial de Variantes de Datos ({variantes.length})
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: 'grey.100' }}>
                          <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Líder Reportó</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Apellido</TableCell>
                            <TableCell>Celular</TableCell>
                            <TableCell>Dirección</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {variantes.map((variante, index) => (
                            <TableRow key={variante.id || index} hover>
                              <TableCell>
                                <Typography variant="caption">
                                  {new Date(variante.fecha_captura).toLocaleString('es-CO')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {variante.lider_identificacion || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{
                                  color: variante.nombre_variante !== votante.nombre ? 'warning.main' : 'inherit'
                                }}>
                                  {variante.nombre_variante || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{
                                  color: variante.apellido_variante !== votante.apellido ? 'warning.main' : 'inherit'
                                }}>
                                  {variante.apellido_variante || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{
                                  color: variante.celular_variante !== votante.celular ? 'warning.main' : 'inherit'
                                }}>
                                  {variante.celular_variante || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" sx={{
                                  color: variante.direccion_variante !== votante.direccion ? 'warning.main' : 'inherit'
                                }}>
                                  {variante.direccion_variante ?
                                    (variante.direccion_variante.length > 30 ?
                                      variante.direccion_variante.substring(0, 30) + '...' :
                                      variante.direccion_variante) : '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="caption">
                        Los campos en amarillo indican diferencias con los datos actuales del votante
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>

      {/* Modal de gestión de líderes */}
      <VotanteLeaderesModal
        open={leaderesModalOpen}
        onClose={() => setLeaderesModalOpen(false)}
        votante={votante}
        onSuccess={fetchVotanteDetails}
      />
    </>
  );
};

export default ViewVotanteModal;