import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Close, Delete, Add, Star } from "@mui/icons-material";
import axios from "../../services/axiosConfig";
import SearchLeaderModal from "./SearchLeaderModal";

const VotanteLeaderesModal = ({ open, onClose, votante, onSuccess }) => {
  const [lideres, setLideres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [incidencias, setIncidencias] = useState([]);

  useEffect(() => {
    if (open && votante) {
      fetchLideres();
      fetchIncidencias();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, votante]);

  const fetchLideres = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/votantes/${votante.identificacion}/lideres`);
      setLideres(response.data);
    } catch (error) {
      console.error("Error al obtener líderes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidencias = async () => {
    try {
      const response = await axios.get(`/votantes/${votante.identificacion}/incidencias`);
      setIncidencias(response.data);
    } catch (error) {
      console.error("Error al obtener incidencias:", error);
    }
  };

  const handleAsignarLider = async (lider) => {
    setLoading(true);
    try {
      await axios.post("/asignaciones", {
        votante_identificacion: votante.identificacion,
        lider_identificacion: lider.lider_identificacion,
      });

      // Mostrar alerta si es segundo líder o más
      if (lideres.length >= 1) {
        alert("Se ha asignado un líder adicional. Se ha creado una incidencia automáticamente.");
      }

      fetchLideres();
      fetchIncidencias();
      setSearchModalOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al asignar líder:", error);
      alert(error.userMessage || error.response?.data?.error || "Error al asignar líder");
    } finally {
      setLoading(false);
    }
  };

  const handleDesasignarLider = async (liderIdentificacion) => {
    // Verificar si es el primer líder
    const lider = lideres.find(l => l.identificacion === liderIdentificacion);
    if (lider && lider.es_primer_lider === 1) {
      if (!window.confirm("Este es el PRIMER LÍDER asignado. ¿Está seguro de desasignarlo?")) {
        return;
      }
    }

    setLoading(true);
    try {
      await axios.delete("/asignaciones", {
        data: {
          votante_identificacion: votante.identificacion,
          lider_identificacion: liderIdentificacion,
        },
      });
      fetchLideres();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al desasignar líder:", error);
      alert(error.userMessage || error.response?.data?.error || "Error al desasignar líder");
    } finally {
      setLoading(false);
    }
  };

  if (!votante) return null;

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
          <Typography variant="h6">
            Gestionar Líderes - {votante.nombre} {votante.apellido}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          {/* Información del votante */}
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Votante
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {votante.nombre} {votante.apellido}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {votante.identificacion}
            </Typography>
          </Box>

          {/* Incidencias activas */}
          {incidencias.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {incidencias.length} Incidencia(s) activa(s)
              </Typography>
              {incidencias.slice(0, 2).map((inc, index) => (
                <Typography key={index} variant="caption" display="block">
                  • {inc.tipo}: {inc.detalle}
                </Typography>
              ))}
            </Alert>
          )}

          {/* Lista de líderes asignados */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Líderes Asignados ({lideres.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                size="small"
                onClick={() => setSearchModalOpen(true)}
                disabled={loading}
                sx={(theme) => ({
                  background: theme.palette.primary.main,
                })}
              >
                Asignar Líder
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : lideres.length === 0 ? (
              <Alert severity="info">
                Este votante no tiene líderes asignados. Haz clic en "Asignar Líder" para agregar uno.
              </Alert>
            ) : (
              <List sx={(theme) => ({ bgcolor: "background.paper", borderRadius: 1, border: `1px solid ${theme.palette.grey[300]}` })}>
                {lideres.map((lider, index) => (
                  <React.Fragment key={lider.identificacion}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body1" fontWeight={600}>
                              {lider.nombre} {lider.apellido}
                            </Typography>
                            {lider.es_primer_lider === 1 && (
                              <Chip
                                icon={<Star />}
                                label="Primer Líder"
                                size="small"
                                color="primary"
                                sx={{ height: 24 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" display="block">
                              ID: {lider.identificacion}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Asignado: {new Date(lider.assigned_at).toLocaleDateString("es-CO")}
                            </Typography>
                            {lider.departamento && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {lider.ciudad}, {lider.departamento}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleDesasignarLider(lider.identificacion)}
                          disabled={loading}
                          sx={(theme) => ({ color: theme.palette.error.main })}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>

          {/* Información adicional */}
          {lideres.length > 1 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Este votante tiene múltiples líderes asignados. Se han generado incidencias automáticas para seguimiento.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de búsqueda de líderes */}
      <SearchLeaderModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectLeader={handleAsignarLider}
      />
    </>
  );
};

export default VotanteLeaderesModal;
