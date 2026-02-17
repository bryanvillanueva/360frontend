import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Divider,
  LinearProgress,
  Avatar,
  Alert,
  alpha,
} from "@mui/material";
import axios from "axios";
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  EmojiEvents,
  Warning,
  HowToVote,
  SupervisorAccount,
  Speed,
  Group,
  Person,
  LocationOn,
  Timeline,
} from "@mui/icons-material";
import mapboxgl from "mapbox-gl";
import PageHeader from "./ui/PageHeader";
import theme from "../theme";
import colombiaCityCoords from "../data/colombiaCityCoords";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Initialize Mapbox map when data is ready
  useEffect(() => {
    if (!dashboardData || !mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-74.3, 4.5],
      zoom: 4,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Build GeoJSON from voter city distribution
      const features = Object.entries(dashboardData.distribucion.ciudadesRaw || {})
        .map(([ciudad, count]) => {
          const key = ciudad.toLowerCase().trim();
          const coords = colombiaCityCoords[key];
          if (!coords) return null;
          return {
            type: "Feature",
            geometry: { type: "Point", coordinates: coords },
            properties: { ciudad, count },
          };
        })
        .filter(Boolean);

      map.addSource("voters", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
      });

      map.addLayer({
        id: "voter-circles",
        type: "circle",
        source: "voters",
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["get", "count"],
            1, 6,
            50, 14,
            200, 22,
            1000, 36,
          ],
          "circle-color": theme.palette.primary.main,
          "circle-opacity": 0.7,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Add count labels
      map.addLayer({
        id: "voter-labels",
        type: "symbol",
        source: "voters",
        layout: {
          "text-field": ["get", "count"],
          "text-size": 11,
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#fff",
        },
      });

      // Popup on click
      map.on("click", "voter-circles", (e) => {
        const { ciudad, count } = e.features[0].properties;
        new mapboxgl.Popup({ closeButton: false, offset: 15 })
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-family:Montserrat,sans-serif;padding:4px 0">` +
            `<strong style="font-size:14px">${ciudad}</strong><br/>` +
            `<span style="color:${theme.palette.text.secondary}">${count} votantes</span>` +
            `</div>`
          )
          .addTo(map);
      });

      map.on("mouseenter", "voter-circles", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "voter-circles", () => {
        map.getCanvas().style.cursor = "";
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [dashboardData]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        votantesRes,
        lideresRes,
        recomendadosRes,
        gruposRes,
        tendenciaRes,
      ] = await Promise.all([
        axios.get("https://backend-node-soft360-production.up.railway.app/votantes"),
        axios.get("https://backend-node-soft360-production.up.railway.app/lideres"),
        axios.get("https://backend-node-soft360-production.up.railway.app/recomendados"),
        axios.get("https://backend-node-soft360-production.up.railway.app/grupos"),
        axios.get("https://backend-node-soft360-production.up.railway.app/votantes/tendencia_mensual").catch(() => ({ data: [] })),
      ]);

      const votantes = votantesRes.data;
      const lideres = lideresRes.data;
      const recomendados = recomendadosRes.data;
      const grupos = gruposRes.data;

      // Calculate metrics
      const totalVotantes = votantes.length;
      const totalLideres = lideres.length;
      const totalRecomendados = recomendados.length;
      const totalGrupos = grupos.length;

      // Compliance calculations
      const lideresConObjetivo = lideres.filter(l => l.lider_objetivo > 0);
      const lideresCompliance = lideresConObjetivo.map(lider => {
        const votantesDelLider = votantes.filter(v => v.lider_identificacion === lider.lider_identificacion);
        const cumplimiento = lider.lider_objetivo > 0 ? (votantesDelLider.length / lider.lider_objetivo) * 100 : 0;
        return {
          ...lider,
          votantesActuales: votantesDelLider.length,
          cumplimiento,
          enCumplimiento: cumplimiento >= 80
        };
      });

      const lideresEnCumplimiento = lideresCompliance.filter(l => l.enCumplimiento).length;
      const tasaCumplimiento = lideresConObjetivo.length > 0
        ? (lideresEnCumplimiento / lideresConObjetivo.length) * 100
        : 0;

      // Efficiency metrics
      const promedioVotantesPorLider = totalLideres > 0 ? totalVotantes / totalLideres : 0;
      const promedioLideresPorRecomendado = totalRecomendados > 0 ? totalLideres / totalRecomendados : 0;

      // Top and bottom performers
      const topLideres = lideresCompliance
        .filter(l => l.cumplimiento > 0)
        .sort((a, b) => b.cumplimiento - a.cumplimiento)
        .slice(0, 10);

      const lideresEnRiesgo = lideresCompliance
        .filter(l => l.cumplimiento < 60 && l.cumplimiento > 0)
        .sort((a, b) => a.cumplimiento - b.cumplimiento)
        .slice(0, 5);

      // Distribution by location (departamento/ciudad/barrio)
      const distribucionDepartamento = votantes.reduce((acc, v) => {
        const departamento = v.departamento || "Sin especificar";
        acc[departamento] = (acc[departamento] || 0) + 1;
        return acc;
      }, {});

      const distribucionCiudad = votantes.reduce((acc, v) => {
        const ciudad = v.ciudad || "Sin especificar";
        acc[ciudad] = (acc[ciudad] || 0) + 1;
        return acc;
      }, {});

      const distribucionBarrio = votantes.reduce((acc, v) => {
        const barrio = v.barrio || "Sin especificar";
        acc[barrio] = (acc[barrio] || 0) + 1;
        return acc;
      }, {});

      const topDepartamentos = Object.entries(distribucionDepartamento)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);

      const topCiudades = Object.entries(distribucionCiudad)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);

      const topBarrios = Object.entries(distribucionBarrio)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);

      // Trend data (monthly growth)
      const trendData = tendenciaRes.data.length > 0
        ? tendenciaRes.data
        : generateMockTrendData();

      // Groups performance
      const gruposPerformance = await Promise.all(
        grupos.slice(0, 10).map(async (grupo) => {
          try {
            const recomendadosRes = await axios.get(
              `https://backend-node-soft360-production.up.railway.app/grupos/${grupo.id}/recomendados`
            );
            const completoRes = await axios.get(
              `https://backend-node-soft360-production.up.railway.app/grupos/${grupo.id}/completo`
            );

            const lideresUnicos = new Set();
            const votantesUnicos = new Set();

            completoRes.data.forEach(item => {
              if (item.lider_id) lideresUnicos.add(item.lider_id);
              if (item.votante_id) votantesUnicos.add(item.votante_id);
            });

            return {
              nombre: grupo.nombre,
              recomendados: recomendadosRes.data.length,
              lideres: lideresUnicos.size,
              votantes: votantesUnicos.size,
              eficiencia: lideresUnicos.size > 0 ? votantesUnicos.size / lideresUnicos.size : 0
            };
          } catch (error) {
            return {
              nombre: grupo.nombre,
              recomendados: 0,
              lideres: 0,
              votantes: 0,
              eficiencia: 0
            };
          }
        })
      );

      setDashboardData({
        totals: {
          votantes: totalVotantes,
          lideres: totalLideres,
          recomendados: totalRecomendados,
          grupos: totalGrupos,
        },
        metrics: {
          tasaCumplimiento,
          lideresEnCumplimiento,
          totalLideresConObjetivo: lideresConObjetivo.length,
          promedioVotantesPorLider,
          promedioLideresPorRecomendado,
        },
        topLideres,
        lideresEnRiesgo,
        distribucion: {
          departamentos: topDepartamentos,
          ciudades: topCiudades,
          ciudadesRaw: distribucionCiudad,
          barrios: topBarrios,
        },
        trendData,
        gruposPerformance: gruposPerformance.sort((a, b) => b.votantes - a.votantes),
      });

      setLoading(false);
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
      setLoading(false);
    }
  };

  const generateMockTrendData = () => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
    return months.map((month, idx) => ({
      date: month,
      count: Math.floor(Math.random() * 500) + 100 * idx,
    }));
  };

  const getComplianceColor = (rate) => {
    if (rate >= 80) return "success";
    if (rate >= 60) return "warning";
    return "error";
  };

  if (loading || !dashboardData) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={80} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={3}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} md={3} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const { totals, metrics, topLideres, lideresEnRiesgo, trendData, gruposPerformance } = dashboardData;

  // Recharts color references (plain strings needed for SVG)
  const rechartsColors = {
    primaryMain: theme.palette.primary.main,
    primaryDark: theme.palette.primary.dark,
    primaryLight: theme.palette.primary.light,
    warningMain: theme.palette.warning.main,
    grey500: theme.palette.grey[500],
    grey300: theme.palette.grey[300],
    textSecondary: theme.palette.text.secondary,
  };


  return (
    <Box sx={(theme) => ({ minHeight: "100vh", bgcolor: theme.palette.background.subtle, pb: 4 })}>
      <PageHeader
        title="Panel de Control Electoral"
        description="Monitoreo en tiempo real de métricas clave y rendimiento de campaña"
      />

      {/* KPI Cards Principales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card elevation={0} sx={(theme) => ({
            background: theme.palette.primary.main,
            color: "#fff",
            borderRadius: 2.5,
            transition: "transform 0.2s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
            }
          })}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ flex: 1 }}>
                  <HowToVote sx={{ fontSize: 36, mb: 1, opacity: 0.9 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {totals.votantes.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
                    Total Votantes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card elevation={0} sx={(theme) => ({
            background: theme.palette.primary.dark,
            color: "#fff",
            borderRadius: 2.5,
            transition: "transform 0.2s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.dark, 0.3)}`
            }
          })}>
            <CardContent>
              <SupervisorAccount sx={{ fontSize: 36, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {totals.lideres.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
                Líderes Activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card elevation={0} sx={(theme) => ({
            background: theme.palette.primary.light,
            color: "#fff",
            borderRadius: 2.5,
            transition: "transform 0.2s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.light, 0.3)}`
            }
          })}>
            <CardContent>
              <Person sx={{ fontSize: 36, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {totals.recomendados.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
                Recomendados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card elevation={0} sx={(theme) => ({
            background: theme.palette.grey[500],
            color: "#fff",
            borderRadius: 2.5,
            transition: "transform 0.2s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: `0 8px 24px ${alpha(theme.palette.grey[500], 0.3)}`
            }
          })}>
            <CardContent>
              <Group sx={{ fontSize: 36, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {totals.grupos}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
                Grupos Organizados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Mapa de Distribución */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card elevation={0} sx={(theme) => ({ borderRadius: 2.5, border: `1px solid ${theme.palette.grey[300]}` })}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <LocationOn sx={(theme) => ({ color: theme.palette.primary.main })} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Mapa de Distribución de Votantes
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box
                ref={mapContainerRef}
                sx={{ width: "100%", height: 450, borderRadius: 2, overflow: "hidden" }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Métricas de Rendimiento */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card elevation={0} sx={(theme) => ({ borderRadius: 2.5, border: `1px solid ${theme.palette.grey[300]}` })}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <EmojiEvents sx={(theme) => ({ color: theme.palette.primary.main, fontSize: 28 })} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Tasa de Cumplimiento
                </Typography>
              </Box>
              <Typography variant="h3" sx={(theme) => ({ fontWeight: 700, color: theme.palette.primary.main, mb: 1 })}>
                {metrics.tasaCumplimiento.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.tasaCumplimiento}
                color={getComplianceColor(metrics.tasaCumplimiento)}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {metrics.lideresEnCumplimiento} de {metrics.totalLideresConObjetivo} líderes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card elevation={0} sx={(theme) => ({ borderRadius: 2.5, border: `1px solid ${theme.palette.grey[300]}` })}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Speed sx={(theme) => ({ color: theme.palette.primary.dark, fontSize: 28 })} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Eficiencia Líder
                </Typography>
              </Box>
              <Typography variant="h3" sx={(theme) => ({ fontWeight: 700, color: theme.palette.primary.dark, mb: 1 })}>
                {metrics.promedioVotantesPorLider.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Votantes promedio por líder
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card elevation={0} sx={(theme) => ({ borderRadius: 2.5, border: `1px solid ${theme.palette.grey[300]}` })}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TrendingUp sx={(theme) => ({ color: theme.palette.primary.light, fontSize: 28 })} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Líderes/Recomendado
                </Typography>
              </Box>
              <Typography variant="h3" sx={(theme) => ({ fontWeight: 700, color: theme.palette.primary.light, mb: 1 })}>
                {metrics.promedioLideresPorRecomendado.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Conversión de estructura
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card elevation={0} sx={(theme) => ({ borderRadius: 2.5, border: `1px solid ${theme.palette.grey[300]}` })}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Warning sx={(theme) => ({ color: theme.palette.warning.main, fontSize: 28 })} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  En Riesgo
                </Typography>
              </Box>
              <Typography variant="h3" sx={(theme) => ({ fontWeight: 700, color: theme.palette.warning.main, mb: 1 })}>
                {lideresEnRiesgo.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Líderes bajo rendimiento (&lt;60%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos Principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Gráfico de Tendencia Mejorado */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={(theme) => ({ borderRadius: 2.5, border: `1px solid ${theme.palette.grey[300]}` })}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Timeline sx={(theme) => ({ color: theme.palette.primary.main })} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tendencia de Crecimiento
                  </Typography>
                </Box>
                <Chip label="Últimos 6 meses" size="small" sx={(theme) => ({ bgcolor: theme.palette.background.subtle, color: theme.palette.primary.main })} />
              </Box>
              <Divider sx={{ mb: 3 }} />
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={rechartsColors.primaryMain} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={rechartsColors.primaryMain} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={rechartsColors.grey300} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: rechartsColors.textSecondary }}
                    axisLine={{ stroke: rechartsColors.grey300 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: rechartsColors.textSecondary }}
                    axisLine={{ stroke: rechartsColors.grey300 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={rechartsColors.primaryMain}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    name="Votantes"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Rendimiento de Grupos */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={(theme) => ({ borderRadius: 2.5, border: `1px solid ${theme.palette.grey[300]}` })}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Group sx={(theme) => ({ color: theme.palette.primary.main })} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Rendimiento por Grupo
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={gruposPerformance} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <defs>
                    <linearGradient id="votantesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={rechartsColors.primaryMain} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={rechartsColors.primaryDark} stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={rechartsColors.grey300} vertical={false} />
                  <XAxis dataKey="nombre" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                    }}
                  />
                  <Legend iconType="circle" />
                  <Bar yAxisId="left" dataKey="votantes" fill="url(#votantesGrad)" radius={[8, 8, 0, 0]} name="Votantes" />
                  <Line yAxisId="right" type="monotone" dataKey="eficiencia" stroke={rechartsColors.primaryDark} strokeWidth={3} dot={{ r: 5 }} name="Eficiencia" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Rankings y Alertas */}
      <Grid container spacing={3}>
        {/* Top Performers */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={(theme) => ({ borderRadius: 2.5, border: `1px solid ${theme.palette.grey[300]}` })}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <EmojiEvents sx={{ color: "#FFD700" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Top 10 Líderes
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                {topLideres.map((lider, idx) => (
                  <Box key={idx} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                      <Avatar sx={(theme) => ({
                        width: 32,
                        height: 32,
                        bgcolor: idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : theme.palette.grey[300],
                        color: idx < 3 ? "#fff" : theme.palette.text.secondary,
                        fontSize: "0.875rem",
                        fontWeight: 700
                      })}>
                        {idx + 1}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                          {lider.lider_nombre || lider.lider_identificacion}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {lider.votantesActuales} / {lider.lider_objetivo} votantes
                          </Typography>
                          <Chip
                            label={`${lider.cumplimiento.toFixed(0)}%`}
                            size="small"
                            color={getComplianceColor(lider.cumplimiento)}
                            sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(lider.cumplimiento, 100)}
                          color={getComplianceColor(lider.cumplimiento)}
                          sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Líderes en Riesgo */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={(theme) => ({ borderRadius: 2.5, border: `1px solid ${theme.palette.grey[300]}` })}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Warning sx={(theme) => ({ color: theme.palette.warning.main })} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Líderes en Riesgo
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {lideresEnRiesgo.length === 0 ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  ¡Excelente! No hay líderes en riesgo en este momento.
                </Alert>
              ) : (
                <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                  {lideresEnRiesgo.map((lider, idx) => (
                    <Box key={idx} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                        <Avatar sx={(theme) => ({
                          width: 32,
                          height: 32,
                          bgcolor: theme.palette.warning.main,
                          fontSize: "0.875rem"
                        })}>
                          <Warning fontSize="small" />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                            {lider.lider_nombre || lider.lider_identificacion}
                          </Typography>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {lider.votantesActuales} / {lider.lider_objetivo} votantes
                            </Typography>
                            <Chip
                              label={`${lider.cumplimiento.toFixed(0)}%`}
                              size="small"
                              color="error"
                              sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={lider.cumplimiento}
                            color="error"
                            sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
