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
  LinearProgress,
  IconButton,
  CircularProgress,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import {
  Close,
  Person,
  Group,
  TrendingUp,
  Assessment,
  LocationOn,
  Email,
  Phone,
  HowToVote,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import axios from "axios";

const ViewLeaderModal = ({ open, onClose, leaderData }) => {
  const [leaderDetails, setLeaderDetails] = useState(null);
  const [votersCount, setVotersCount] = useState(0);
  const [votersList, setVotersList] = useState([]);
  const [votersExpanded, setVotersExpanded] = useState(false);
  const [recommendedBy, setRecommendedBy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && leaderData) {
      fetchLeaderDetails();
    }
    if (!open) {
      setVotersExpanded(false);
    }
  }, [open, leaderData]);

  const fetchLeaderDetails = async () => {
    if (!leaderData) return;

    setLoading(true);
    setError(null);

    try {
      // Obtener información del líder
      setLeaderDetails(leaderData);

      // Obtener votantes
      const votersResponse = await axios.get(
        `https://backend-node-soft360-production.up.railway.app/votantes/por-lider-detalle?lider=${leaderData.lider_identificacion}`
      );
      const voters = votersResponse.data.votantes || [];
      setVotersCount(voters.length);
      setVotersList(voters);

      // Obtener información del recomendado si existe
      if (leaderData.recomendado_identificacion) {
        try {
          const recommendedResponse = await axios.get(
            `https://backend-node-soft360-production.up.railway.app/recomendados/${leaderData.recomendado_identificacion}`
          );
          setRecommendedBy(recommendedResponse.data);
        } catch (err) {
          console.warn("No se pudo obtener información del recomendado:", err);
          setRecommendedBy(null);
        }
      } else {
        setRecommendedBy(null);
      }
    } catch (error) {
      console.error("Error al obtener detalles del líder:", error);
      setError("Error al cargar la información del líder");
    } finally {
      setLoading(false);
    }
  };

  const calculateComplianceRate = () => {
    const expectativa = leaderDetails?.lider_objetivo || 0;
    if (expectativa === 0) return 0;
    return Math.min((votersCount / expectativa) * 100, 100);
  };

  const getComplianceColor = (rate) => {
    if (rate >= 80) return "success";
    if (rate >= 60) return "warning";
    return "error";
  };

  const getComplianceLabel = (rate) => {
    if (rate >= 100) return "Superado";
    if (rate >= 80) return "Excelente";
    if (rate >= 60) return "Bueno";
    if (rate >= 40) return "Regular";
    return "Bajo";
  };

  if (!leaderData) return null;

  const complianceRate = calculateComplianceRate();

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Person />
          Información Detallada del Líder
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
        ) : leaderDetails ? (
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
                      {leaderDetails.lider_identificacion}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nombre Completo
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {leaderDetails.lider_nombre} {leaderDetails.lider_apellido}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <Phone fontSize="small" color="action" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Celular
                      </Typography>
                      <Typography variant="body1">{leaderDetails.lider_celular}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Email fontSize="small" color="action" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">{leaderDetails.lider_email}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Dirección */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 600 })}>
                    <LocationOn sx={{ mr: 1, verticalAlign: "middle" }} />
                    Dirección
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Departamento:</strong> {leaderDetails.lider_departamento || "No especificado"}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Ciudad:</strong> {leaderDetails.lider_ciudad || "No especificado"}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Barrio:</strong> {leaderDetails.lider_barrio || "No especificado"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1">
                      <strong>Dirección:</strong> {leaderDetails.lider_direccion || "No especificado"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Información de Recomendación */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 600 })}>
                    Recomendación
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {recommendedBy ? (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Recomendado por:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {recommendedBy.nombre} {recommendedBy.apellido}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {recommendedBy.identificacion}
                      </Typography>
                    </Box>
                  ) : leaderDetails.recomendado_identificacion ? (
                    <Chip
                      label={`Recomendado por: ${leaderDetails.recomendado_identificacion}`}
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <Chip
                      label="Autorecomendado"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Métricas de Rendimiento */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 600 })}>
                    <Assessment sx={{ mr: 1, verticalAlign: "middle" }} />
                    Rendimiento
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Expectativa de Votantes
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {leaderDetails.lider_objetivo || "No definida"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Votantes Actuales
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {votersCount}
                      </Typography>
                    </Box>

                    {leaderDetails.lider_objetivo && (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Tasa de Cumplimiento
                          </Typography>
                          <Chip
                            label={getComplianceLabel(complianceRate)}
                            color={getComplianceColor(complianceRate)}
                            size="small"
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={complianceRate}
                          color={getComplianceColor(complianceRate)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                          {complianceRate.toFixed(1)}% completado
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Lista de Votantes expandible */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Box
                    onClick={() => setVotersExpanded(!votersExpanded)}
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  >
                    <Typography variant="h6" sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 600 })}>
                      <HowToVote sx={{ mr: 1, verticalAlign: "middle" }} />
                      Votantes Asignados ({votersCount})
                    </Typography>
                    {votersExpanded ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                  <Collapse in={votersExpanded} timeout="auto" unmountOnExit>
                    <Divider sx={{ my: 2 }} />
                    {votersList.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                        Sin votantes asignados
                      </Typography>
                    ) : (
                      <List disablePadding>
                        {votersList.map((voter) => (
                          <ListItem key={voter.identificacion} sx={{ py: 0.5, borderLeft: "3px solid", borderLeftColor: "primary.light" }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: "grey.400", width: 28, height: 28 }}>
                                <HowToVote sx={{ fontSize: 14 }} />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body2" fontSize="0.85rem">
                                  {voter.nombre} {voter.apellido}
                                </Typography>
                              }
                              secondary={`ID: ${voter.identificacion} | ${voter.ciudad || "-"}, ${voter.barrio || "-"}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Collapse>
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

export default ViewLeaderModal;