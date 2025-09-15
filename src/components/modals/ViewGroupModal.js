import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Person,
  Add,
  SupervisorAccount,
  HowToVote,
  TrendingUp,
  Assessment,
  Star,
  Group,
} from "@mui/icons-material";
import axios from "axios";

const ViewGroupModal = ({
  open,
  onClose,
  selectedGrupo,
  grupoRecomendados,
  onAddRecomendados,
}) => {
  const [groupMetrics, setGroupMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && selectedGrupo && grupoRecomendados.length > 0) {
      fetchGroupMetrics();
    }
  }, [open, selectedGrupo, grupoRecomendados]);

  const fetchGroupMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener todos los líderes
      const leadersResponse = await axios.get(
        "https://backend-node-soft360-production.up.railway.app/lideres"
      );

      // Filtrar líderes que pertenecen a recomendados de este grupo
      const recomendadoIds = grupoRecomendados.map(r => r.identificacion);
      const groupLeaders = leadersResponse.data.filter(leader =>
        recomendadoIds.includes(leader.recomendado_identificacion)
      );

      // Enriquecer información de recomendados con sus líderes y métricas
      const enrichedRecomendados = [];
      let totalVoters = 0;
      let totalExpectedVoters = 0;
      let leadersInCompliance = 0;
      let totalLeaders = 0;

      for (const recomendado of grupoRecomendados) {
        const recomendadoLeaders = groupLeaders.filter(
          leader => leader.recomendado_identificacion === recomendado.identificacion
        );

        let recomendadoVoters = 0;
        let recomendadoExpected = 0;
        let recomendadoCompliantLeaders = 0;
        const enrichedLeaders = [];

        for (const leader of recomendadoLeaders) {
          try {
            // Obtener votantes del líder
            const votersResponse = await axios.get(
              `https://backend-node-soft360-production.up.railway.app/votantes/por-lider-detalle?lider=${leader.lider_identificacion}`
            );
            const votersCount = votersResponse.data.votantes?.length || 0;
            const expectedVoters = leader.lider_objetivo || 0;

            recomendadoVoters += votersCount;
            if (expectedVoters > 0) {
              recomendadoExpected += expectedVoters;
              const complianceRate = (votersCount / expectedVoters) * 100;
              if (complianceRate >= 80) {
                recomendadoCompliantLeaders++;
              }
            }

            enrichedLeaders.push({
              ...leader,
              votersCount,
              complianceRate: expectedVoters > 0 ? (votersCount / expectedVoters) * 100 : null
            });

          } catch (error) {
            console.warn(`Error al obtener votantes del líder ${leader.lider_identificacion}:`, error);
            enrichedLeaders.push({
              ...leader,
              votersCount: 0,
              complianceRate: null
            });
          }
        }

        totalVoters += recomendadoVoters;
        totalExpectedVoters += recomendadoExpected;
        leadersInCompliance += recomendadoCompliantLeaders;
        totalLeaders += recomendadoLeaders.length;

        enrichedRecomendados.push({
          ...recomendado,
          leaders: enrichedLeaders,
          leadersCount: recomendadoLeaders.length,
          votersCount: recomendadoVoters,
          expectedVoters: recomendadoExpected,
          complianceRate: recomendadoExpected > 0 ? (recomendadoVoters / recomendadoExpected) * 100 : null,
          leadershipEfficiency: recomendadoLeaders.length > 0 ? recomendadoVoters / recomendadoLeaders.length : 0
        });
      }

      // Calcular métricas generales del grupo
      const groupComplianceRate = totalExpectedVoters > 0 ? (totalVoters / totalExpectedVoters) * 100 : 0;
      const leaderComplianceRate = totalLeaders > 0 ? (leadersInCompliance / totalLeaders) * 100 : 0;

      // Encontrar el mejor recomendado (por tasa de cumplimiento)
      const bestRecomendado = enrichedRecomendados.reduce((best, current) => {
        if (!best) return current;
        const bestRate = best.complianceRate || 0;
        const currentRate = current.complianceRate || 0;
        return currentRate > bestRate ? current : best;
      }, null);

      // Encontrar el recomendado con mejor eficiencia de liderazgo
      const mostEfficientRecomendado = enrichedRecomendados.reduce((best, current) => {
        if (!best) return current;
        return current.leadershipEfficiency > best.leadershipEfficiency ? current : best;
      }, null);

      setGroupMetrics({
        totalRecomendados: grupoRecomendados.length,
        totalLeaders,
        totalVoters,
        totalExpectedVoters,
        groupComplianceRate,
        leaderComplianceRate,
        leadersInCompliance,
        bestRecomendado,
        mostEfficientRecomendado,
        enrichedRecomendados: enrichedRecomendados.sort((a, b) => (b.complianceRate || 0) - (a.complianceRate || 0))
      });

    } catch (error) {
      console.error("Error al obtener métricas del grupo:", error);
      setError("Error al cargar las métricas del grupo");
    } finally {
      setLoading(false);
    }
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
          <Group />
          {selectedGrupo?.nombre} - Análisis de Rendimiento
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
        ) : groupMetrics ? (
          <Grid container spacing={3}>
            {/* Métricas Generales */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#018da5", fontWeight: 600 }}>
                    <Assessment sx={{ mr: 1, verticalAlign: "middle" }} />
                    Métricas Generales del Grupo
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                        <Typography variant="h4" color="primary" fontWeight={700}>
                          {groupMetrics.totalRecomendados}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Recomendados
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                        <Typography variant="h4" color="primary" fontWeight={700}>
                          {groupMetrics.totalLeaders}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Líderes Totales
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                        <Typography variant="h4" color="primary" fontWeight={700}>
                          {groupMetrics.totalVoters}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Votantes Totales
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                        <Typography variant="h4" color="primary" fontWeight={700}>
                          {groupMetrics.totalExpectedVoters}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expectativa Total
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tasa de Cumplimiento del Grupo
                      </Typography>
                      <Chip
                        label={`${groupMetrics.groupComplianceRate.toFixed(1)}% - ${getComplianceLabel(groupMetrics.groupComplianceRate)}`}
                        color={getComplianceColor(groupMetrics.groupComplianceRate)}
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(groupMetrics.groupComplianceRate, 100)}
                      color={getComplianceColor(groupMetrics.groupComplianceRate)}
                      sx={{ height: 8, borderRadius: 4, mb: 2 }}
                    />

                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Líderes en Cumplimiento
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {groupMetrics.leadersInCompliance} de {groupMetrics.totalLeaders} ({groupMetrics.leaderComplianceRate.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={groupMetrics.leaderComplianceRate}
                      color={getComplianceColor(groupMetrics.leaderComplianceRate)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Mejores Recomendados */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#018da5", fontWeight: 600 }}>
                    <Star sx={{ mr: 1, verticalAlign: "middle" }} />
                    Mejor Rendimiento
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {groupMetrics.bestRecomendado && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: "success.light", borderRadius: 1, color: "success.contrastText" }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        🏆 {groupMetrics.bestRecomendado.nombre} {groupMetrics.bestRecomendado.apellido}
                      </Typography>
                      <Typography variant="body2">
                        Tasa de cumplimiento: {groupMetrics.bestRecomendado.complianceRate?.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption">
                        {groupMetrics.bestRecomendado.votersCount} votantes de {groupMetrics.bestRecomendado.expectedVoters} esperados
                      </Typography>
                    </Box>
                  )}

                  {groupMetrics.mostEfficientRecomendado && (
                    <Box sx={{ p: 2, bgcolor: "info.light", borderRadius: 1, color: "info.contrastText" }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        ⚡ {groupMetrics.mostEfficientRecomendado.nombre} {groupMetrics.mostEfficientRecomendado.apellido}
                      </Typography>
                      <Typography variant="body2">
                        Mayor eficiencia de liderazgo
                      </Typography>
                      <Typography variant="caption">
                        {groupMetrics.mostEfficientRecomendado.leadershipEfficiency.toFixed(1)} votantes por líder
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Acciones Rápidas */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#018da5", fontWeight: 600 }}>
                    Acciones del Grupo
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={onAddRecomendados}
                    fullWidth
                    sx={{
                      mb: 2,
                      background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #0b9b8a 0%, #018da5 100%)",
                      },
                    }}
                  >
                    Agregar Recomendados
                  </Button>

                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                    Gestiona los miembros y mejora el rendimiento del grupo
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Lista Detallada de Recomendados */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#018da5", fontWeight: 600 }}>
                    <Person sx={{ mr: 1, verticalAlign: "middle" }} />
                    Recomendados del Grupo ({groupMetrics.enrichedRecomendados.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {groupMetrics.enrichedRecomendados.length > 0 ? (
                    <List>
                      {groupMetrics.enrichedRecomendados.map((rec) => (
                        <ListItem key={rec.identificacion} divider>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: "#018da5" }}>
                              <Person />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="subtitle1" fontWeight={500}>
                                  {rec.nombre} {rec.apellido}
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  {rec.complianceRate !== null && (
                                    <Chip
                                      label={`${rec.complianceRate.toFixed(0)}%`}
                                      size="small"
                                      color={getComplianceColor(rec.complianceRate)}
                                    />
                                  )}
                                  <Chip
                                    label={`${rec.leadersCount} líderes`}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                  ID: {rec.identificacion} | Cel: {rec.celular}
                                </Typography>
                                <Box sx={{ display: "flex", gap: 3, mt: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    <HowToVote sx={{ fontSize: 12, mr: 0.5 }} />
                                    {rec.votersCount} votantes
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    <TrendingUp sx={{ fontSize: 12, mr: 0.5 }} />
                                    {rec.expectedVoters} esperados
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    <SupervisorAccount sx={{ fontSize: 12, mr: 0.5 }} />
                                    {rec.leadershipEfficiency.toFixed(1)} v/líder
                                  </Typography>
                                </Box>
                                {rec.complianceRate !== null && (
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(rec.complianceRate, 100)}
                                    color={getComplianceColor(rec.complianceRate)}
                                    sx={{ mt: 1, height: 4, borderRadius: 2 }}
                                  />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">
                      No hay recomendados en este grupo.
                      <Button
                        onClick={onAddRecomendados}
                        sx={{ ml: 1 }}
                        size="small"
                      >
                        Agregar algunos
                      </Button>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          // Vista original para cuando no hay métricas
          <Box>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6">
                Recomendados del Grupo ({grupoRecomendados.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onAddRecomendados}
                sx={{
                  background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0b9b8a 0%, #018da5 100%)",
                  },
                }}
              >
                Agregar Recomendados
              </Button>
            </Box>

            {grupoRecomendados.length > 0 ? (
              <List>
                {grupoRecomendados.map((rec) => (
                  <ListItem key={rec.identificacion}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "#018da5" }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${rec.nombre} ${rec.apellido}`}
                      secondary={`ID: ${rec.identificacion} | Cel: ${rec.celular}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No hay recomendados en este grupo.
                <Button
                  onClick={onAddRecomendados}
                  sx={{ ml: 1 }}
                  size="small"
                >
                  Agregar algunos
                </Button>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewGroupModal;