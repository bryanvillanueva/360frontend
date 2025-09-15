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
  Chip,
  Skeleton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
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
  BarChart,
  Bar,
} from "recharts";
import {
  ArrowDropUp,
  ArrowDropDown,
  Remove,
  Groups,
  Person,
  HowToReg,
} from "@mui/icons-material";

const HeaderBox = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  color: "#fff",
  textAlign: "center",
  boxShadow: "0 4px 20px rgba(1, 141, 165, 0.2)",
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(3),
  textAlign: "center",
  transition: "all 0.3s",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  },
}));

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  const fetchStats = async () => {
    try {
      const [
        votantesRes,
        lideresRes,
        recomendadosRes,
        promedioRes,
        tendenciaRes,
        distributionRes,
      ] = await Promise.all([
        axios.get("https://backend-node-soft360-production.up.railway.app/votantes/total"),
        axios.get("https://backend-node-soft360-production.up.railway.app/lideres/total"),
        axios.get("https://backend-node-soft360-production.up.railway.app/recomendados/total"),
        axios.get("https://backend-node-soft360-production.up.railway.app/votantes/promedio_lider"),
        axios.get("https://backend-node-soft360-production.up.railway.app/votantes/tendencia_mensual"),
        axios.get("https://backend-node-soft360-production.up.railway.app/lideres/distribution"),
      ]);

      setStats({
        totalVotantes: votantesRes.data,
        totalLideres: lideresRes.data,
        totalRecomendados: recomendadosRes.data,
        promedioVotantesPorLider: promedioRes.data,
      });
      setTrendData(tendenciaRes.data);
      setDistribution(distributionRes.data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };
    fetchData();
  }, []);

  const renderTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <ArrowDropUp color="success" fontSize="large" />;
      case "down":
        return <ArrowDropDown color="error" fontSize="large" />;
      default:
        return <Remove color="disabled" fontSize="large" />;
    }
  };

  const handleOpenModal = (title, data) => {
    setModalTitle(title);
    setModalData(data);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  if (loading || !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={80} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", pb: 4 }}>
      <HeaderBox>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Panel de Control Electoral
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Seguimiento en tiempo real de votantes, líderes, recomendados y grupos
        </Typography>
      </HeaderBox>

      {/* Métricas principales */}
      <Grid container spacing={3} sx={{ px: { xs: 2, md: 4 } }}>
        <Grid item xs={12} md={3}>
          <StatCard onClick={() => handleOpenModal("Detalle de Votantes", [])}>
            <Person sx={{ fontSize: 40, color: "#1976d2" }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Total de Votantes
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1976d2" }}>
              {stats.totalVotantes.total}
            </Typography>
            {renderTrendIcon(stats.totalVotantes.trend)}
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard onClick={() => handleOpenModal("Detalle de Líderes", [])}>
            <HowToReg sx={{ fontSize: 40, color: "#018da5" }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Total de Líderes
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#018da5" }}>
              {stats.totalLideres.total}
            </Typography>
            {renderTrendIcon(stats.totalLideres.trend)}
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard onClick={() => handleOpenModal("Detalle de Recomendados", [])}>
            <Groups sx={{ fontSize: 40, color: "#0b9b8a" }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Total de Recomendados
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#0b9b8a" }}>
              {stats.totalRecomendados.total}
            </Typography>
            {renderTrendIcon(stats.totalRecomendados.trend)}
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard>
            <Person sx={{ fontSize: 40, color: "#ff9800" }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Prom. Votantes / Líder
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff9800" }}>
              {stats.promedioVotantesPorLider.promedio}
            </Typography>
            {renderTrendIcon(stats.promedioVotantesPorLider.trend)}
          </StatCard>
        </Grid>
      </Grid>

      {/* Gráfico de tendencia */}
      <Box sx={{ mt: 5, px: { xs: 2, md: 4 } }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Tendencia de Votantes (últimos meses)
        </Typography>
        <Paper sx={{ p: 2, borderRadius: 3, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#1976d2" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Gráfico de distribución */}
      <Box sx={{ mt: 5, px: { xs: 2, md: 4 } }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Distribución de Votantes por Líder
        </Typography>
        <Paper sx={{ p: 2, borderRadius: 3, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lider_identificacion" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_votantes" fill="#018da5" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Modal Detalles */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="lg">
        <DialogTitle>{modalTitle}</DialogTitle>
        <DialogContent>
          {modalData.length === 0 ? (
            <Typography variant="body1">No hay datos disponibles</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {Object.keys(modalData[0]).map((key) => (
                      <TableCell key={key}>{key}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modalData.map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((val, j) => (
                        <TableCell key={j}>{val}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
