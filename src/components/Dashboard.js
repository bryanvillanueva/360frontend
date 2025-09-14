import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import RemoveIcon from "@mui/icons-material/Remove";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [compliantLeaders, setCompliantLeaders] = useState([]);
  const [nonCompliantLeaders, setNonCompliantLeaders] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalGroup, setModalGroup] = useState(""); // "compliant" o "non"

  // Cargar estadísticas generales y datos de tendencia
  const fetchStats = async () => {
    try {
      const [
        votantesRes,
        lideresRes,
        recomendadosRes,
        promedioRes,
        tendenciaRes,
      ] = await Promise.all([
        axios.get("https://backend-node-soft360-production.up.railway.app/votantes/total"),
        axios.get("https://backend-node-soft360-production.up.railway.app/lideres/total"),
        axios.get("https://backend-node-soft360-production.up.railway.app/recomendados/total"),
        axios.get("https://backend-node-soft360-production.up.railway.app/votantes/promedio_lider"),
        axios.get("https://backend-node-soft360-production.up.railway.app/votantes/tendencia_mensual"),
      ]);
      setStats({
        totalVotantes: votantesRes.data, // { total: number, trend: "up" | "down" | "equal" }
        totalLideres: lideresRes.data,
        totalRecomendados: recomendadosRes.data,
        promedioVotantesPorLider: promedioRes.data, // { promedio: number, trend: "up" | "down" | "equal" }
      });
      setTrendData(tendenciaRes.data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // Cargar lista de líderes (que ya incluyen el campo lider_objetivo) y distribución de votantes por líder
  const fetchLeadersAndDistribution = async () => {
    try {
      const leadersRes = await axios.get("https://backend-node-soft360-production.up.railway.app/lideres");
      setLeaders(leadersRes.data);
      const distributionRes = await axios.get("https://backend-node-soft360-production.up.railway.app/lideres/distribution");
      setDistribution(distributionRes.data);
    } catch (error) {
      console.error("Error al cargar líderes o distribución:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchStats();
      await fetchLeadersAndDistribution();
      setLoading(false);
    };
    fetchData();
  }, []);

  // Calcular grupos de cumplimiento a partir de los datos de líderes y distribución
  useEffect(() => {
    // Creamos un mapa: clave = identificación del líder, valor = total de votantes asignados
    const leaderMap = {};
    distribution.forEach((item) => {
      leaderMap[item.lider_identificacion] = item.total_votantes;
    });
    const compliant = [];
    const nonCompliant = [];
    leaders.forEach((leader) => {
      const votersCount = leaderMap[leader.lider_identificacion] || 0;
      // Usamos el campo lider_objetivo (asegúrate de que en la BD sea un entero o convertible a Number)
      const objetivo = leader.lider_objetivo ? Number(leader.lider_objetivo) : 0;
      const percentage = objetivo > 0 ? Math.round((votersCount / objetivo) * 100) : null;
      const leaderWithStats = { ...leader, votersCount, percentage };
      // Si existe un objetivo y el porcentaje es >= 100 se considera en cumplimiento
      if (objetivo > 0 && percentage >= 100) {
        compliant.push(leaderWithStats);
      } else {
        nonCompliant.push(leaderWithStats);
      }
    });
    setCompliantLeaders(compliant);
    setNonCompliantLeaders(nonCompliant);
  }, [leaders, distribution]);

  // Función para renderizar ícono de tendencia
  const renderTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <ArrowDropUpIcon color="success" fontSize="large" />;
      case "down":
        return <ArrowDropDownIcon color="error" fontSize="large" />;
      default:
        return <RemoveIcon color="disabled" fontSize="large" />;
    }
  };

  const handleOpenModal = (group) => {
    setModalGroup(group);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  if (loading || !stats) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Tarjetas de Totales */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Total de Votantes
            </Typography>
            <Typography variant="h4" sx={{color: "#1976d2", fontWeight: "bold" }}>
              {stats.totalVotantes.total}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {renderTrendIcon(stats.totalVotantes.trend)}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Total de Líderes
            </Typography>
            <Typography variant="h4" sx={{ color: "#1976d2", fontWeight: "bold" }}>
              {stats.totalLideres.total}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {renderTrendIcon(stats.totalLideres.trend)}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Total de Recomendados
            </Typography>
            <Typography variant="h4" sx={{ color: "#1976d2", fontWeight: "bold" }}>
              {stats.totalRecomendados.total}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {renderTrendIcon(stats.totalRecomendados.trend)}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Prom. Votantes/Líder
            </Typography>
            <Typography variant="h4" sx={{ color: "#1976d2", fontWeight: "bold" }}>
              {stats.promedioVotantesPorLider.promedio}
            </Typography>
            <Box sx={{ display: "flex", color: "#1976d2", justifyContent: "center" }}>
              {renderTrendIcon(stats.promedioVotantesPorLider.trend)}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Sección de Cumplimiento de Líderes */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Cumplimiento de Líderes
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="subtitle1">
                Líderes en Cumplimiento
              </Typography>
              <Typography variant="h4" sx={{color: "#1976d2", fontWeight: "bold" }}>
                {compliantLeaders.length}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => handleOpenModal("compliant")}
                sx={{ mt: 2 }}
              >
                Ver Detalles
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="subtitle1">
                Líderes Fuera de Cumplimiento
              </Typography>
              <Typography variant="h4" sx={{color: "#1976d2",  fontWeight: "bold" }}>
                {nonCompliantLeaders.length}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => handleOpenModal("non")}
                sx={{ mt: 2 }}
              >
                Ver Detalles
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Gráfico de Línea para Tendencia de Votantes en el Último Mes */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Tendencia de Votantes en el Último Mes
        </Typography>
        <Paper sx={{ p: 2, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#1976d2"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Modal: Detalle de Líderes según cumplimiento */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="lg">
        <DialogTitle>
          {modalGroup === "compliant"
            ? "Líderes en Cumplimiento"
            : "Líderes Fuera de Cumplimiento"}
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{backgroundColor:"#1976d2", color: "#fff"}}>Identificación</TableCell>
                  <TableCell sx={{backgroundColor:"#1976d2", color: "#fff"}}>Nombre</TableCell>
                  <TableCell sx={{backgroundColor:"#1976d2", color: "#fff"}}>Apellido</TableCell>
                  <TableCell sx={{backgroundColor:"#1976d2", color: "#fff"}}>Celular</TableCell>
                  <TableCell sx={{backgroundColor:"#1976d2", color: "#fff"}}>Email</TableCell>
                  <TableCell sx={{backgroundColor:"#1976d2", color: "#fff"}}>Objetivo</TableCell>
                  <TableCell sx={{backgroundColor:"#1976d2", color: "#fff"}}>Total de Votantes</TableCell>
                  <TableCell sx={{backgroundColor:"#1976d2", color: "#fff"}}>% Cumplimiento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(
                  modalGroup === "compliant" ? compliantLeaders : nonCompliantLeaders
                ).map((leader) => (
                  <TableRow key={leader.lider_identificacion}>
                    <TableCell>{leader.lider_identificacion}</TableCell>
                    <TableCell>{leader.lider_nombre}</TableCell>
                    <TableCell>{leader.lider_apellido}</TableCell>
                    <TableCell>{leader.lider_celular}</TableCell>
                    <TableCell>{leader.lider_email}</TableCell>
                    <TableCell>{leader.lider_objetivo || "N/A"}</TableCell>
                    <TableCell>{leader.votersCount}</TableCell>
                    <TableCell>
                      {leader.lider_objetivo
                        ? `${leader.percentage}%`
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
