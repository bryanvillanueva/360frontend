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
  alpha,
  Collapse,
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
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import {
  Cell,
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
  Area,
  ComposedChart,
  Line,
  Treemap,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";
import axios from "axios";
import theme from "../../theme";

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

  // Estados para cascada expandible
  const [expandedRecomendados, setExpandedRecomendados] = useState({});
  const [expandedLeaders, setExpandedLeaders] = useState({});
  const [leaderVoters, setLeaderVoters] = useState({});

  useEffect(() => {
    if (open && selectedGrupo && grupoRecomendados.length > 0) {
      fetchGroupMetrics();
    }
    if (!open) {
      setExpandedRecomendados({});
      setExpandedLeaders({});
      setLeaderVoters({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedGrupo, grupoRecomendados]);

  const toggleRecomendado = (id) => {
    setExpandedRecomendados(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLeader = async (leaderId) => {
    const isExpanding = !expandedLeaders[leaderId];
    setExpandedLeaders(prev => ({ ...prev, [leaderId]: isExpanding }));

    if (isExpanding && !leaderVoters[leaderId]) {
      try {
        const res = await axios.get(
          `https://backend-node-soft360-production.up.railway.app/votantes/por-lider-detalle?lider=${leaderId}`
        );
        setLeaderVoters(prev => ({ ...prev, [leaderId]: res.data.votantes || [] }));
      } catch (err) {
        console.warn("Error al cargar votantes del líder:", err);
        setLeaderVoters(prev => ({ ...prev, [leaderId]: [] }));
      }
    }
  };

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

  // Recharts colors from theme (Recharts can't use MUI theme callbacks)
  const COLORS = {
    primary: theme.palette.primary.main,
    primaryDark: theme.palette.primary.dark,
    primaryLight: theme.palette.primary.light,
    success: theme.palette.success.main,
    grey500: theme.palette.grey[500],
    grey300: theme.palette.grey[300],
    textSecondary: theme.palette.text.secondary,
    textPrimary: theme.palette.text.primary,
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
          <Group />
          {selectedGrupo?.nombre} - Análisis de Rendimiento
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAddRecomendados}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.35)",
              },
            }}
          >
            Agregar Recomendados
          </Button>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <Close />
          </IconButton>
        </Box>
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
            {/* Lista Detallada de Recomendados con Cascada */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 600 })}>
                    <Person sx={{ mr: 1, verticalAlign: "middle" }} />
                    Recomendados del Grupo ({groupMetrics.enrichedRecomendados.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {groupMetrics.enrichedRecomendados.length > 0 ? (
                    <List disablePadding>
                      {groupMetrics.enrichedRecomendados.map((rec) => (
                        <Box key={rec.identificacion}>
                          <ListItem
                            divider={!expandedRecomendados[rec.identificacion]}
                            button
                            onClick={() => toggleRecomendado(rec.identificacion)}
                            sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={(theme) => ({ bgcolor: theme.palette.primary.main })}>
                                <Person />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <Typography variant="subtitle1" fontWeight={500}>
                                    {rec.nombre} {rec.apellido}
                                  </Typography>
                                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
                                    {expandedRecomendados[rec.identificacion] ? <ExpandLess /> : <ExpandMore />}
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

                          {/* Líderes del recomendado (nivel 2) */}
                          <Collapse in={expandedRecomendados[rec.identificacion]} timeout="auto" unmountOnExit>
                            <List disablePadding sx={{ pl: 4, bgcolor: "grey.50" }}>
                              {rec.leaders && rec.leaders.length > 0 ? (
                                rec.leaders.map((leader) => (
                                  <Box key={leader.lider_identificacion}>
                                    <ListItem
                                      button
                                      onClick={() => toggleLeader(leader.lider_identificacion)}
                                      sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" }, borderLeft: "3px solid", borderLeftColor: "primary.light" }}
                                    >
                                      <ListItemAvatar>
                                        <Avatar sx={(theme) => ({ bgcolor: theme.palette.primary.light, width: 32, height: 32 })}>
                                          <SupervisorAccount sx={{ fontSize: 18 }} />
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={
                                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="body2" fontWeight={500}>
                                              {leader.lider_nombre} {leader.lider_apellido}
                                            </Typography>
                                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                              <Chip
                                                label={`${leader.votersCount} votantes`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: 22, fontSize: "0.7rem" }}
                                              />
                                              {leader.complianceRate !== null && (
                                                <Chip
                                                  label={`${leader.complianceRate.toFixed(0)}%`}
                                                  size="small"
                                                  color={getComplianceColor(leader.complianceRate)}
                                                  sx={{ height: 22, fontSize: "0.7rem" }}
                                                />
                                              )}
                                              {expandedLeaders[leader.lider_identificacion] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                                            </Box>
                                          </Box>
                                        }
                                        secondary={`ID: ${leader.lider_identificacion} | Objetivo: ${leader.lider_objetivo || 0}`}
                                      />
                                    </ListItem>

                                    {/* Votantes del líder (nivel 3) */}
                                    <Collapse in={expandedLeaders[leader.lider_identificacion]} timeout="auto" unmountOnExit>
                                      <List disablePadding sx={{ pl: 4, bgcolor: "grey.100" }}>
                                        {!leaderVoters[leader.lider_identificacion] ? (
                                          <ListItem>
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            <Typography variant="caption">Cargando votantes...</Typography>
                                          </ListItem>
                                        ) : leaderVoters[leader.lider_identificacion].length === 0 ? (
                                          <ListItem>
                                            <Typography variant="caption" color="text.secondary">Sin votantes asignados</Typography>
                                          </ListItem>
                                        ) : (
                                          leaderVoters[leader.lider_identificacion].map((voter) => (
                                            <ListItem key={voter.identificacion} sx={{ py: 0.5, borderLeft: "3px solid", borderLeftColor: "grey.400" }}>
                                              <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: "grey.400", width: 26, height: 26 }}>
                                                  <HowToVote sx={{ fontSize: 14 }} />
                                                </Avatar>
                                              </ListItemAvatar>
                                              <ListItemText
                                                primary={
                                                  <Typography variant="body2" fontSize="0.8rem">
                                                    {voter.nombre} {voter.apellido}
                                                  </Typography>
                                                }
                                                secondary={`ID: ${voter.identificacion} | ${voter.ciudad || "-"}, ${voter.barrio || "-"}`}
                                              />
                                            </ListItem>
                                          ))
                                        )}
                                      </List>
                                    </Collapse>
                                  </Box>
                                ))
                              ) : (
                                <ListItem>
                                  <Typography variant="caption" color="text.secondary">Sin líderes asignados</Typography>
                                </ListItem>
                              )}
                            </List>
                          </Collapse>
                        </Box>
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

            {/* Métricas Generales */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 600 })}>
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

            {/* Mejor Rendimiento (full width) */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 600 })}>
                    <Star sx={{ mr: 1, verticalAlign: "middle" }} />
                    Mejor Rendimiento
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    {groupMetrics.bestRecomendado && (
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, bgcolor: "#e8f5e9", borderRadius: 1, border: "1px solid #c8e6c9", height: "100%" }}>
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
                      </Grid>
                    )}

                    {groupMetrics.mostEfficientRecomendado && (
                      <Grid item xs={12} md={6}>
                        <Box sx={(theme) => ({ p: 2, bgcolor: theme.palette.background.subtle, borderRadius: 1, border: `1px solid ${theme.palette.primary.light}`, height: "100%" })}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <FlashOn sx={(theme) => ({ color: theme.palette.primary.main, fontSize: 24 })} />
                            <Typography variant="subtitle1" fontWeight={600} sx={(theme) => ({ color: theme.palette.primary.dark })}>
                              {groupMetrics.mostEfficientRecomendado.nombre} {groupMetrics.mostEfficientRecomendado.apellido}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={(theme) => ({ color: theme.palette.primary.main })}>
                            Mayor eficiencia de liderazgo
                          </Typography>
                          <Typography variant="caption" sx={(theme) => ({ color: theme.palette.primary.main })}>
                            {groupMetrics.mostEfficientRecomendado.leadershipEfficiency.toFixed(1)} votantes por líder
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
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
                        <Card elevation={0} sx={(theme) => ({
                          background: theme.palette.primary.main,
                          color: "#fff",
                          borderRadius: 2.5,
                          position: "relative",
                          overflow: "hidden",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
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
                        })}>
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
                        <Card elevation={0} sx={(theme) => ({
                          background: theme.palette.success.main,
                          color: "#fff",
                          borderRadius: 2.5,
                          position: "relative",
                          overflow: "hidden",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.3)}`
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
                        })}>
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
                        <Card elevation={0} sx={(theme) => ({
                          background: theme.palette.primary.light,
                          color: "#fff",
                          borderRadius: 2.5,
                          position: "relative",
                          overflow: "hidden",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.light, 0.3)}`
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
                        })}>
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
                        <Card elevation={0} sx={(theme) => ({
                          background: theme.palette.grey[500],
                          color: "#fff",
                          borderRadius: 2.5,
                          position: "relative",
                          overflow: "hidden",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 24px ${alpha(theme.palette.grey[500], 0.3)}`
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
                        })}>
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
                    <Card elevation={0} sx={(theme) => ({
                      border: `1px solid ${theme.palette.grey[300]}`,
                      borderRadius: 2.5,
                      background: "#fff",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
                    })}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <BarChart sx={(theme) => ({ color: theme.palette.primary.main })} />
                            <Typography variant="h6" sx={(theme) => ({ fontWeight: 600, color: theme.palette.text.primary })}>
                              Análisis de Rendimiento Integral
                            </Typography>
                          </Box>
                          <Chip
                            label="Vista Combinada"
                            size="small"
                            sx={(theme) => ({ bgcolor: theme.palette.background.subtle, color: theme.palette.primary.main, fontWeight: 600 })}
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
                                <stop offset="5%" stopColor={COLORS.primaryLight} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={COLORS.primaryLight} stopOpacity={0.1}/>
                              </linearGradient>
                              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={1}/>
                                <stop offset="95%" stopColor={COLORS.primaryDark} stopOpacity={0.9}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grey300} vertical={false} />
                            <XAxis
                              dataKey="nombre"
                              tick={{ fontSize: 11, fill: COLORS.textSecondary }}
                              axisLine={{ stroke: COLORS.grey300 }}
                            />
                            <YAxis
                              yAxisId="left"
                              tick={{ fontSize: 11, fill: COLORS.textSecondary }}
                              axisLine={{ stroke: COLORS.grey300 }}
                              label={{ value: 'Votantes', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: COLORS.textSecondary } }}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              tick={{ fontSize: 11, fill: COLORS.textSecondary }}
                              axisLine={{ stroke: COLORS.grey300 }}
                              label={{ value: 'Cumplimiento %', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: COLORS.textSecondary } }}
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
                              stroke={COLORS.primaryLight}
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
                              stroke={COLORS.success}
                              strokeWidth={3}
                              dot={{ fill: COLORS.success, r: 5 }}
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
                    <Card elevation={0} sx={(theme) => ({
                      border: `1px solid ${theme.palette.grey[300]}`,
                      borderRadius: 2.5,
                      background: "#fff",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
                    })}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <Group sx={(theme) => ({ color: theme.palette.primary.main })} />
                          <Typography variant="h6" sx={(theme) => ({ fontWeight: 600, color: theme.palette.text.primary })}>
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
                              const colors = [COLORS.primary, COLORS.success, COLORS.primaryLight, COLORS.primaryDark, COLORS.grey500];
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
                                    <Typography variant="caption" sx={(theme) => ({ display: "block", color: theme.palette.text.secondary })}>
                                      Votantes: {data.size}
                                    </Typography>
                                    <Typography variant="caption" sx={(theme) => ({ display: "block", color: theme.palette.text.secondary })}>
                                      Cumplimiento: {data.compliance.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption" sx={(theme) => ({ display: "block", color: theme.palette.text.secondary })}>
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
                    <Card elevation={0} sx={(theme) => ({
                      border: `1px solid ${theme.palette.grey[300]}`,
                      borderRadius: 2.5,
                      background: "#fff",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
                    })}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <TrendingUp sx={(theme) => ({ color: theme.palette.primary.main })} />
                            <Typography variant="h6" sx={(theme) => ({ fontWeight: 600, color: theme.palette.text.primary })}>
                              Matriz de Rendimiento
                            </Typography>
                          </Box>
                          <Chip
                            label="Vista Multidimensional"
                            size="small"
                            sx={(theme) => ({ bgcolor: theme.palette.background.subtle, color: theme.palette.primary.main, fontWeight: 600 })}
                          />
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary, display: "block", mb: 2 })}>
                          Tamaño de burbuja = Número de líderes | Eje X = Votantes | Eje Y = % Cumplimiento
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                          <ScatterChart
                            margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                          >
                            <defs>
                              <linearGradient id="bubbleGradient1" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                                <stop offset="100%" stopColor={COLORS.primaryDark} stopOpacity={0.9}/>
                              </linearGradient>
                              <linearGradient id="bubbleGradient2" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.8}/>
                                <stop offset="100%" stopColor={COLORS.primaryDark} stopOpacity={0.9}/>
                              </linearGradient>
                              <linearGradient id="bubbleGradient3" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={COLORS.primaryLight} stopOpacity={0.8}/>
                                <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.9}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grey300} />
                            <XAxis
                              type="number"
                              dataKey="votantes"
                              name="Votantes"
                              tick={{ fontSize: 11, fill: COLORS.textSecondary }}
                              axisLine={{ stroke: COLORS.grey300 }}
                              label={{ value: 'Votantes Actuales', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: COLORS.textSecondary } }}
                            />
                            <YAxis
                              type="number"
                              dataKey="cumplimiento"
                              name="Cumplimiento"
                              tick={{ fontSize: 11, fill: COLORS.textSecondary }}
                              axisLine={{ stroke: COLORS.grey300 }}
                              label={{ value: '% Cumplimiento', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: COLORS.textSecondary } }}
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
                                    <Typography variant="caption" sx={(theme) => ({ display: "block", color: theme.palette.text.secondary })}>
                                      Votantes: {data.votantes}
                                    </Typography>
                                    <Typography variant="caption" sx={(theme) => ({ display: "block", color: theme.palette.text.secondary })}>
                                      Cumplimiento: {data.cumplimiento.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption" sx={(theme) => ({ display: "block", color: theme.palette.text.secondary })}>
                                      Líderes: {data.lideres}
                                    </Typography>
                                    <Typography variant="caption" sx={(theme) => ({ display: "block", color: theme.palette.text.secondary })}>
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
                    <Card elevation={0} sx={(theme) => ({
                      border: `1px solid ${theme.palette.grey[300]}`,
                      borderRadius: 2.5,
                      background: "#fff",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
                    })}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <Assessment sx={(theme) => ({ color: theme.palette.primary.main })} />
                          <Typography variant="h6" sx={(theme) => ({ fontWeight: 600, color: theme.palette.text.primary })}>
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
                                <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.6}/>
                                <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                              </radialGradient>
                              <radialGradient id="radarGradient2">
                                <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.6}/>
                                <stop offset="100%" stopColor={COLORS.success} stopOpacity={0.2}/>
                              </radialGradient>
                            </defs>
                            <PolarGrid stroke={COLORS.grey300} strokeWidth={1.5} />
                            <PolarAngleAxis
                              dataKey="recomendado"
                              tick={{ fontSize: 11, fill: COLORS.textSecondary, fontWeight: 500 }}
                            />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 100]}
                              tick={{ fontSize: 10, fill: "#999" }}
                            />
                            <Radar
                              name="Cumplimiento %"
                              dataKey="cumplimiento"
                              stroke={COLORS.primary}
                              fill="url(#radarGradient1)"
                              strokeWidth={3}
                              dot={{ fill: COLORS.primary, r: 4 }}
                            />
                            <Radar
                              name="Eficiencia"
                              dataKey="eficiencia"
                              stroke={COLORS.success}
                              fill="url(#radarGradient2)"
                              strokeWidth={3}
                              dot={{ fill: COLORS.success, r: 4 }}
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
                    <Card elevation={0} sx={(theme) => ({
                      border: `1px solid ${theme.palette.grey[300]}`,
                      borderRadius: 2,
                      background: "#fff"
                    })}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <EmojiEvents sx={(theme) => ({ color: theme.palette.primary.main })} />
                          <Typography variant="h6" sx={(theme) => ({ fontWeight: 600, color: theme.palette.text.primary })}>
                            Ranking de Cumplimiento
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ maxHeight: 350, overflowY: "auto" }}>
                          {groupMetrics.enrichedRecomendados.map((rec, idx) => (
                            <Box key={idx} sx={{ mb: 3 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                                <Box sx={(theme) => ({
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
                                  color: idx < 3 ? "#fff" : theme.palette.text.secondary,
                                  fontSize: "0.875rem",
                                  boxShadow: idx < 3 ? "0 2px 4px rgba(0,0,0,0.2)" : "none"
                                })}>
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
                                    sx={(theme) => ({
                                      height: 10,
                                      borderRadius: 5,
                                      bgcolor: theme.palette.background.subtle,
                                      "& .MuiLinearProgress-bar": {
                                        borderRadius: 5,
                                        background: rec.complianceRate >= 80
                                          ? "linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)"
                                          : rec.complianceRate >= 60
                                          ? "linear-gradient(90deg, #ff9800 0%, #ffc107 100%)"
                                          : "linear-gradient(90deg, #f44336 0%, #e57373 100%)"
                                      }
                                    })}
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
                sx={(theme) => ({
                  bgcolor: theme.palette.primary.main,
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                })}
              >
                Agregar Recomendados
              </Button>
            </Box>

            {grupoRecomendados.length > 0 ? (
              <List>
                {grupoRecomendados.map((rec) => (
                  <ListItem key={rec.identificacion}>
                    <ListItemAvatar>
                      <Avatar sx={(theme) => ({ bgcolor: theme.palette.primary.main })}>
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
