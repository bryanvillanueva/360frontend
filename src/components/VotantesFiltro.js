import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Collapse,
} from "@mui/material";
import axios from "axios";

const VotantesFiltro = () => {
  // Estados para el buscador de recomendados
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendedResults, setRecommendedResults] = useState([]); // solo se carga tras buscar
  const [loadingRecommended, setLoadingRecommended] = useState(false);

  // Estados para cuando se selecciona un recomendado
  const [selectedRecommended, setSelectedRecommended] = useState(null);
  const [lideres, setLideres] = useState([]);
  const [totalVotantes, setTotalVotantes] = useState(0);
  const [loadingLideres, setLoadingLideres] = useState(false);
  const [expandedLeader, setExpandedLeader] = useState("");
  const [leaderVoters, setLeaderVoters] = useState({});
  const [loadingVotantes, setLoadingVotantes] = useState({});

  // Función para buscar recomendados (se obtienen todos y se filtra en el frontend)
  const handleBuscarRecomendados = async () => {
    if (!searchTerm) {
      alert("Por favor, ingresa un término de búsqueda.");
      return;
    }
    setLoadingRecommended(true);
    try {
      // Se consulta el endpoint que trae todos los recomendados
      const response = await axios.get("https://backend-node-soft360-production.up.railway.app/recomendados");
      // Filtrar resultados por cédula, nombre o apellido (convertido a minúsculas)
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = response.data.filter((rec) =>
        rec.identificacion.toString().toLowerCase().includes(lowerTerm) ||
        (rec.nombre && rec.nombre.toLowerCase().includes(lowerTerm)) ||
        (rec.apellido && rec.apellido.toLowerCase().includes(lowerTerm))
      );
      setRecommendedResults(filtered);
    } catch (error) {
      console.error("Error al buscar recomendados:", error);
      alert("Error al buscar recomendados");
    } finally {
      setLoadingRecommended(false);
    }
  };

  // Cuando el usuario selecciona un recomendado de la lista
  const handleSelectRecommended = async (rec) => {
    setSelectedRecommended(rec);
    setLoadingLideres(true);
    try {
      // Consultamos líderes asociados al recomendado usando un endpoint personalizado
      // Se asume que el endpoint devuelve un arreglo de líderes asociados al recomendado
      const response = await axios.get(
        `https://backend-node-soft360-production.up.railway.app/lideres/por-recomendado?recomendado=${rec.identificacion}`
      );
      const leaders = response.data || [];
      let total = 0;
      // Para cada líder, se consulta el total de votantes asociados
      for (let leader of leaders) {
        const votRes = await axios.get(
          `https://backend-node-soft360-production.up.railway.app/votantes/por-lider?lider=${leader.lider_identificacion}`
        );
        const voters = votRes.data.votantes || [];
        leader.totalVotantes = voters.length;
        total += voters.length;
      }
      setLideres(leaders);
      setTotalVotantes(total);
    } catch (error) {
      console.error("Error al obtener líderes:", error);
      alert("Error al obtener líderes asociados");
    } finally {
      setLoadingLideres(false);
    }
  };

  // Toggle para expandir/ocultar la lista de votantes de un líder
  const handleToggleExpand = async (leaderId) => {
    if (expandedLeader === leaderId) {
      setExpandedLeader("");
      return;
    }
    setExpandedLeader(leaderId);
    if (!leaderVoters[leaderId]) {
      setLoadingVotantes((prev) => ({ ...prev, [leaderId]: true }));
      try {
        const res = await axios.get(
          `https://backend-node-soft360-production.up.railway.app/votantes/por-lider-detalle?lider=${leaderId}`
        );
        const voters = res.data.votantes || [];
        setLeaderVoters((prev) => ({ ...prev, [leaderId]: voters }));
      } catch (error) {
        console.error("Error al obtener votantes para el líder:", error);
        alert("Error al obtener votantes para el líder");
      } finally {
        setLoadingVotantes((prev) => ({ ...prev, [leaderId]: false }));
      }
    }
  };

  // Función para descargar la lista de votantes de un líder en CSV
  const handleDownloadExcel = (voters) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Cedula,Nombre,Apellido,Direccion,Celular\n";
    voters.forEach((v) => {
      const row = [
        v.votante_identificacion,
        v.votante_nombre,
        v.votante_apellido,
        v.direccion,
        v.celular,
      ].join(",");
      csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "votantes_leader.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Filtro de Recomendados y Líderes
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Buscar Recomendado (Cédula, Nombre o Apellido)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handleBuscarRecomendados}
          disabled={loadingRecommended}
        >
          {loadingRecommended ? <CircularProgress size={24} /> : "Buscar"}
        </Button>
      </Box>
      {/* Solo se muestran resultados si se hizo la búsqueda */}
      {recommendedResults.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Identificación</strong></TableCell>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Apellido</strong></TableCell>
                  <TableCell align="center"><strong>Seleccionar</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recommendedResults.map((rec) => (
                  <TableRow key={rec.identificacion}>
                    <TableCell>{rec.identificacion}</TableCell>
                    <TableCell>{rec.nombre}</TableCell>
                    <TableCell>{rec.apellido}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        onClick={() => handleSelectRecommended(rec)}
                      >
                        Seleccionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {selectedRecommended && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Recomendado: {selectedRecommended.nombre} {selectedRecommended.apellido} (Cédula: {selectedRecommended.identificacion})
          </Typography>
          <Typography variant="body1">
            Total de líderes asociados: {lideres.length}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Total de votantes asociados: {totalVotantes}
          </Typography>
          {lideres.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Lista de Líderes
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#1976d2" }}>
                      <TableCell sx={{ color: "#ffffff" }}>Identificación</TableCell>
                      <TableCell sx={{ color: "#ffffff" }}>Nombre</TableCell>
                      <TableCell sx={{ color: "#ffffff" }}>Apellido</TableCell>
                      <TableCell sx={{ color: "#ffffff" }}>Email</TableCell>
                      <TableCell sx={{ color: "#ffffff" }}>Total Votantes</TableCell>
                      <TableCell align="center" sx={{ color: "#ffffff" }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lideres.map((leader) => (
                      <React.Fragment key={leader.lider_identificacion}>
                        <TableRow>
                          <TableCell>{leader.lider_identificacion}</TableCell>
                          <TableCell>{leader.lider_nombre}</TableCell>
                          <TableCell>{leader.lider_apellido}</TableCell>
                          <TableCell>{leader.lider_email}</TableCell>
                          <TableCell>{leader.totalVotantes || 0}</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              onClick={() => handleToggleExpand(leader.lider_identificacion)}
                            >
                              {expandedLeader === leader.lider_identificacion ? "Ocultar Votantes" : "Ver Votantes"}
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                            <Collapse in={expandedLeader === leader.lider_identificacion} timeout="auto" unmountOnExit>
                              <Box sx={{ margin: 1 }}>
                                {loadingVotantes[leader.lider_identificacion] ? (
                                  <CircularProgress size={24} />
                                ) : (
                                  <Box>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow sx={{ backgroundColor: "#90caf9" }}>
                                          <TableCell>Cédula</TableCell>
                                          <TableCell>Nombre</TableCell>
                                          <TableCell>Apellido</TableCell>
                                          <TableCell>Dirección</TableCell>
                                          <TableCell>Celular</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {leaderVoters[leader.lider_identificacion] &&
                                        leaderVoters[leader.lider_identificacion].length > 0 ? (
                                          leaderVoters[leader.lider_identificacion].map((v) => (
                                            <TableRow key={v.votante_identificacion}>
                                              <TableCell>{v.votante_identificacion}</TableCell>
                                              <TableCell>{v.votante_nombre}</TableCell>
                                              <TableCell>{v.votante_apellido}</TableCell>
                                              <TableCell>{v.direccion}</TableCell>
                                              <TableCell>{v.celular}</TableCell>
                                            </TableRow>
                                          ))
                                        ) : (
                                          <TableRow>
                                            <TableCell colSpan={5} align="center">
                                              No hay votantes para este líder.
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                    <Button
                                      variant="contained"
                                      sx={{ mt: 2 }}
                                      onClick={() =>
                                        handleDownloadExcel(
                                          leaderVoters[leader.lider_identificacion] || []
                                        )
                                      }
                                    >
                                      Descargar Excel
                                    </Button>
                                  </Box>
                                )}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default VotantesFiltro;
