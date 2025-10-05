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
  Tabs,
  Tab,
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
  BarChart,
  EmojiEvents,
  FlashOn,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  Treemap,
  Scatter,
  ScatterChart,
  ZAxis,
  LabelList,
} from "recharts";
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
  const [currentTab, setCurrentTab] = useState(0);

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

      <DialogContent sx={{ p: 0 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 3 }}>
          <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
            <Tab label="Información General" icon={<Person />} iconPosition="start" />
            <Tab label="Gráficos y Estadísticas" icon={<BarChart />} iconPosition="start" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : groupMetrics ? (
            <>
              {/* Tab 1: Información General */}
              {currentTab === 0 && (
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
                    <Box sx={{ mb: 3, p: 2, bgcolor: "#e8f5e9", borderRadius: 1, border: "1px solid #c8e6c9" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <EmojiEvents sx={{ color: "#2e7d32", fontSize: 24 }} />
                        <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#1b5e20" }}>
                          {groupMetrics.bestRecomendado.nombre} {groupMetrics.bestRecomendado.apellido}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#2e7d32" }}>
                        Tasa de cumplimiento: {groupMetrics.bestRecomendado.complianceRate?.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#388e3c" }}>
                        {groupMetrics.bestRecomendado.votersCount} votantes de {groupMetrics.bestRecomendado.expectedVoters} esperados
                      </Typography>
                    </Box>
                  )}

                  {groupMetrics.mostEfficientRecomendado && (
                    <Box sx={{ p: 2, bgcolor: "#e3f2fd", borderRadius: 1, border: "1px solid #bbdefb" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <FlashOn sx={{ color: "#1976d2", fontSize: 24 }} />
                        <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#0d47a1" }}>
                          {groupMetrics.mostEfficientRecomendado.nombre} {groupMetrics.mostEfficientRecomendado.apellido}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#1976d2" }}>
                        Mayor eficiencia de liderazgo
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#1976d2" }}>
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
                      bgcolor: "#018da5",
                      "&:hover": {
                        bgcolor: "#016f80",
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
              )}

              {/* Tab 2: Gráficos y Estadísticas */}
              {currentTab === 1 && (
                <Grid container spacing={3}>
                  {/* Resumen Ejecutivo con Cards Modernas y Mini Sparklines */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Card elevation={0} sx={{
                          background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
                          color: "#fff",
                          borderRadius: 2.5,
                          position: "relative",
                          overflow: "hidden",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 24px rgba(1, 141, 165, 0.3)"
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: -20,
                            right: -20,
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.1)"
                          }
                        }}>
                          <CardContent sx={{ position: "relative", zIndex: 1 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Box>
                                <Assessment sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                                <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                                  {groupMetrics.groupComplianceRate.toFixed(1)}%
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
                                  Cumplimiento Grupal
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Card elevation={0} sx={{
                          background: "linear-gradient(135deg, #67ddab 0%, #0b9b8a 100%)",
                          color: "#fff",
                          borderRadius: 2.5,
                          position: "relative",
                          overflow: "hidden",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 24px rgba(103, 221, 171, 0.3)"
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: -20,
                            right: -20,
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.1)"
                          }
                        }}>
                          <CardContent sx={{ position: "relative", zIndex: 1 }}>
                            <SupervisorAccount sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {groupMetrics.totalLeaders > 0 ? (groupMetrics.totalVoters / groupMetrics.totalLeaders).toFixed(1) : 0}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
                              Votantes por Líder
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Card elevation={0} sx={{
                          background: "linear-gradient(135deg, #80daeb 0%, #018da5 100%)",
                          color: "#fff",
                          borderRadius: 2.5,
                          position: "relative",
                          overflow: "hidden",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 24px rgba(128, 218, 235, 0.3)"
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: -20,
                            right: -20,
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.1)"
                          }
                        }}>
                          <CardContent sx={{ position: "relative", zIndex: 1 }}>
                            <EmojiEvents sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {groupMetrics.leadersInCompliance}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
                              Líderes en Cumplimiento
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Card elevation={0} sx={{
                          background: "linear-gradient(135deg, #909090 0%, #666 100%)",
                          color: "#fff",
                          borderRadius: 2.5,
                          position: "relative",
                          overflow: "hidden",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 24px rgba(144, 144, 144, 0.3)"
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: -20,
                            right: -20,
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.1)"
                          }
                        }}>
                          <CardContent sx={{ position: "relative", zIndex: 1 }}>
                            <Group sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {groupMetrics.totalRecomendados > 0 ? (groupMetrics.totalLeaders / groupMetrics.totalRecomendados).toFixed(1) : 0}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
                              Líderes por Recomendado
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Gráfico Compuesto Avanzado - Área + Línea + Barras */}
                  <Grid item xs={12} md={8}>
                    <Card elevation={0} sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2.5,
                      background: "#fff",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
                    }}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <BarChart sx={{ color: "#018da5" }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
                              Análisis de Rendimiento Integral
                            </Typography>
                          </Box>
                          <Chip
                            label="Vista Combinada"
                            size="small"
                            sx={{ bgcolor: "#f0f9fa", color: "#018da5", fontWeight: 600 }}
                          />
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <ResponsiveContainer width="100%" height={400}>
                          <ComposedChart
                            data={groupMetrics.enrichedRecomendados.map(r => ({
                              nombre: `${r.nombre.split(' ')[0]} ${r.apellido.split(' ')[0]}`,
                              votantes: r.votersCount,
                              esperado: r.expectedVoters,
                              cumplimiento: r.complianceRate || 0,
                              eficiencia: r.leadershipEfficiency,
                              lideres: r.leadersCount
                            }))}
                            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                          >
                            <defs>
                              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#80daeb" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#80daeb" stopOpacity={0.1}/>
                              </linearGradient>
                              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#018da5" stopOpacity={1}/>
                                <stop offset="95%" stopColor="#0b9b8a" stopOpacity={0.9}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis
                              dataKey="nombre"
                              tick={{ fontSize: 11, fill: "#666" }}
                              axisLine={{ stroke: "#e0e0e0" }}
                            />
                            <YAxis
                              yAxisId="left"
                              tick={{ fontSize: 11, fill: "#666" }}
                              axisLine={{ stroke: "#e0e0e0" }}
                              label={{ value: 'Votantes', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#666' } }}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              tick={{ fontSize: 11, fill: "#666" }}
                              axisLine={{ stroke: "#e0e0e0" }}
                              label={{ value: 'Cumplimiento %', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: '#666' } }}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                padding: 12
                              }}
                            />
                            <Legend
                              wrapperStyle={{ paddingTop: 20 }}
                              iconType="circle"
                            />
                            <Area
                              yAxisId="left"
                              type="monotone"
                              dataKey="esperado"
                              fill="url(#areaGradient)"
                              stroke="#80daeb"
                              strokeWidth={2}
                              name="Meta Esperada"
                            />
                            <Bar
                              yAxisId="left"
                              dataKey="votantes"
                              fill="url(#barGradient)"
                              name="Votantes Actuales"
                              radius={[8, 8, 0, 0]}
                              maxBarSize={50}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="cumplimiento"
                              stroke="#67ddab"
                              strokeWidth={3}
                              dot={{ fill: "#67ddab", r: 5 }}
                              activeDot={{ r: 7 }}
                              name="% Cumplimiento"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Treemap - Distribución Jerárquica de Votantes */}
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2.5,
                      background: "#fff",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
                    }}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <Group sx={{ color: "#018da5" }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
                            Mapa de Distribución
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <ResponsiveContainer width="100%" height={400}>
                          <Treemap
                            data={groupMetrics.enrichedRecomendados.map((r, idx) => ({
                              name: `${r.nombre.split(' ')[0]} ${r.apellido.split(' ')[0]}`,
                              size: r.votersCount,
                              compliance: r.complianceRate || 0,
                              leaders: r.leadersCount
                            }))}
                            dataKey="size"
                            aspectRatio={4/3}
                            stroke="#fff"
                            strokeWidth={2}
                            content={({ x, y, width, height, name, size, compliance, leaders }) => {
                              const colors = ['#018da5', '#67ddab', '#80daeb', '#0b9b8a', '#909090'];
                              const color = colors[Math.floor(Math.random() * colors.length)];

                              return (
                                <g>
                                  <rect
                                    x={x}
                                    y={y}
                                    width={width}
                                    height={height}
                                    fill={color}
                                    opacity={0.8}
                                    rx={8}
                                  />
                                  {width > 60 && height > 50 && (
                                    <>
                                      <text
                                        x={x + width / 2}
                                        y={y + height / 2 - 10}
                                        textAnchor="middle"
                                        fill="#fff"
                                        fontSize={12}
                                        fontWeight={600}
                                      >
                                        {name}
                                      </text>
                                      <text
                                        x={x + width / 2}
                                        y={y + height / 2 + 8}
                                        textAnchor="middle"
                                        fill="#fff"
                                        fontSize={16}
                                        fontWeight={700}
                                      >
                                        {size}
                                      </text>
                                      <text
                                        x={x + width / 2}
                                        y={y + height / 2 + 24}
                                        textAnchor="middle"
                                        fill="#fff"
                                        fontSize={10}
                                        opacity={0.9}
                                      >
                                        {compliance.toFixed(0)}% · {leaders}L
                                      </text>
                                    </>
                                  )}
                                </g>
                              );
                            }}
                          >
                            <Tooltip
                              contentStyle={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                padding: 12
                              }}
                              content={({ payload }) => {
                                if (!payload || !payload[0]) return null;
                                const data = payload[0].payload;
                                return (
                                  <Box sx={{ bgcolor: "#fff", p: 1.5, borderRadius: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                      {data.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: "block", color: "#666" }}>
                                      Votantes: {data.size}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: "block", color: "#666" }}>
                                      Cumplimiento: {data.compliance.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: "block", color: "#666" }}>
                                      Líderes: {data.leaders}
                                    </Typography>
                                  </Box>
                                );
                              }}
                            />
                          </Treemap>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Gráfico de Burbujas (Scatter) - Análisis Multidimensional */}
                  <Grid item xs={12} md={7}>
                    <Card elevation={0} sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2.5,
                      background: "#fff",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
                    }}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <TrendingUp sx={{ color: "#018da5" }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
                              Matriz de Rendimiento
                            </Typography>
                          </Box>
                          <Chip
                            label="Vista Multidimensional"
                            size="small"
                            sx={{ bgcolor: "#f0f9fa", color: "#018da5", fontWeight: 600 }}
                          />
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="caption" sx={{ color: "#666", display: "block", mb: 2 }}>
                          Tamaño de burbuja = Número de líderes | Eje X = Votantes | Eje Y = % Cumplimiento
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                          <ScatterChart
                            margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                          >
                            <defs>
                              <linearGradient id="bubbleGradient1" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#018da5" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#0b9b8a" stopOpacity={0.9}/>
                              </linearGradient>
                              <linearGradient id="bubbleGradient2" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#67ddab" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#0b9b8a" stopOpacity={0.9}/>
                              </linearGradient>
                              <linearGradient id="bubbleGradient3" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#80daeb" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#018da5" stopOpacity={0.9}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                              type="number"
                              dataKey="votantes"
                              name="Votantes"
                              tick={{ fontSize: 11, fill: "#666" }}
                              axisLine={{ stroke: "#e0e0e0" }}
                              label={{ value: 'Votantes Actuales', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: '#666' } }}
                            />
                            <YAxis
                              type="number"
                              dataKey="cumplimiento"
                              name="Cumplimiento"
                              tick={{ fontSize: 11, fill: "#666" }}
                              axisLine={{ stroke: "#e0e0e0" }}
                              label={{ value: '% Cumplimiento', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#666' } }}
                            />
                            <ZAxis
                              type="number"
                              dataKey="lideres"
                              range={[100, 1000]}
                              name="Líderes"
                            />
                            <Tooltip
                              cursor={{ strokeDasharray: '3 3' }}
                              contentStyle={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                padding: 12
                              }}
                              content={({ payload }) => {
                                if (!payload || !payload[0]) return null;
                                const data = payload[0].payload;
                                return (
                                  <Box sx={{ bgcolor: "#fff", p: 1.5, borderRadius: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                      {data.nombre}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: "block", color: "#666" }}>
                                      Votantes: {data.votantes}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: "block", color: "#666" }}>
                                      Cumplimiento: {data.cumplimiento.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: "block", color: "#666" }}>
                                      Líderes: {data.lideres}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: "block", color: "#666" }}>
                                      Eficiencia: {data.eficiencia.toFixed(1)} v/líder
                                    </Typography>
                                  </Box>
                                );
                              }}
                            />
                            <Scatter
                              name="Recomendados"
                              data={groupMetrics.enrichedRecomendados.map(r => ({
                                nombre: `${r.nombre.split(' ')[0]} ${r.apellido.split(' ')[0]}`,
                                votantes: r.votersCount,
                                cumplimiento: r.complianceRate || 0,
                                lideres: r.leadersCount,
                                eficiencia: r.leadershipEfficiency
                              }))}
                              fill="url(#bubbleGradient1)"
                              shape="circle"
                            >
                              {groupMetrics.enrichedRecomendados.map((entry, index) => {
                                const gradients = ['url(#bubbleGradient1)', 'url(#bubbleGradient2)', 'url(#bubbleGradient3)'];
                                return (
                                  <Cell key={`cell-${index}`} fill={gradients[index % gradients.length]} />
                                );
                              })}
                            </Scatter>
                          </ScatterChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Gráfico Radar Mejorado */}
                  <Grid item xs={12} md={5}>
                    <Card elevation={0} sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2.5,
                      background: "#fff",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
                    }}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <Assessment sx={{ color: "#018da5" }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
                            Análisis Radar
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <ResponsiveContainer width="100%" height={400}>
                          <RadarChart
                            data={groupMetrics.enrichedRecomendados.slice(0, 5).map(r => ({
                              recomendado: `${r.nombre.split(' ')[0]} ${r.apellido.split(' ')[0]}`,
                              cumplimiento: r.complianceRate || 0,
                              eficiencia: Math.min(r.leadershipEfficiency * 10, 100),
                              lideres: Math.min(r.leadersCount * 20, 100),
                            }))}
                            margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
                          >
                            <defs>
                              <radialGradient id="radarGradient1">
                                <stop offset="0%" stopColor="#018da5" stopOpacity={0.6}/>
                                <stop offset="100%" stopColor="#018da5" stopOpacity={0.2}/>
                              </radialGradient>
                              <radialGradient id="radarGradient2">
                                <stop offset="0%" stopColor="#67ddab" stopOpacity={0.6}/>
                                <stop offset="100%" stopColor="#67ddab" stopOpacity={0.2}/>
                              </radialGradient>
                            </defs>
                            <PolarGrid stroke="#e0e0e0" strokeWidth={1.5} />
                            <PolarAngleAxis
                              dataKey="recomendado"
                              tick={{ fontSize: 11, fill: "#666", fontWeight: 500 }}
                            />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 100]}
                              tick={{ fontSize: 10, fill: "#999" }}
                            />
                            <Radar
                              name="Cumplimiento %"
                              dataKey="cumplimiento"
                              stroke="#018da5"
                              fill="url(#radarGradient1)"
                              strokeWidth={3}
                              dot={{ fill: "#018da5", r: 4 }}
                            />
                            <Radar
                              name="Eficiencia"
                              dataKey="eficiencia"
                              stroke="#67ddab"
                              fill="url(#radarGradient2)"
                              strokeWidth={3}
                              dot={{ fill: "#67ddab", r: 4 }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: 11, paddingTop: 15 }}
                              iconType="circle"
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                fontSize: 12,
                                padding: 12
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Ranking de Cumplimiento Mejorado */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      background: "#fff"
                    }}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <EmojiEvents sx={{ color: "#018da5" }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
                            Ranking de Cumplimiento
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ maxHeight: 350, overflowY: "auto" }}>
                          {groupMetrics.enrichedRecomendados.map((rec, idx) => (
                            <Box key={idx} sx={{ mb: 3 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                                <Box sx={{
                                  minWidth: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background: idx === 0 ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" :
                                             idx === 1 ? "linear-gradient(135deg, #C0C0C0 0%, #808080 100%)" :
                                             idx === 2 ? "linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)" :
                                             "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  color: idx < 3 ? "#fff" : "#666",
                                  fontSize: "0.875rem",
                                  boxShadow: idx < 3 ? "0 2px 4px rgba(0,0,0,0.2)" : "none"
                                }}>
                                  {idx + 1}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                      {rec.nombre.split(' ')[0]} {rec.apellido.split(' ')[0]}
                                    </Typography>
                                    <Chip
                                      label={`${rec.complianceRate?.toFixed(1)}%`}
                                      size="small"
                                      color={getComplianceColor(rec.complianceRate || 0)}
                                      sx={{
                                        height: 24,
                                        fontSize: "0.75rem",
                                        fontWeight: 600
                                      }}
                                    />
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(rec.complianceRate || 0, 100)}
                                    color={getComplianceColor(rec.complianceRate || 0)}
                                    sx={{
                                      height: 10,
                                      borderRadius: 5,
                                      bgcolor: "#f5f5f5",
                                      "& .MuiLinearProgress-bar": {
                                        borderRadius: 5,
                                        background: rec.complianceRate >= 80
                                          ? "linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)"
                                          : rec.complianceRate >= 60
                                          ? "linear-gradient(90deg, #ff9800 0%, #ffc107 100%)"
                                          : "linear-gradient(90deg, #f44336 0%, #e57373 100%)"
                                      }
                                    }}
                                  />
                                  <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                      {rec.votersCount} / {rec.expectedVoters} votantes
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                      {rec.leadersCount} líderes
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </>
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
                  bgcolor: "#018da5",
                  "&:hover": {
                    bgcolor: "#016f80",
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
        </Box>
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