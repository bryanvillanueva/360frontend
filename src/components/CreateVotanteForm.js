import React, { useState, useEffect } from "react";
import {
  Box, Button, Typography, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, TextField,
  InputAdornment, Snackbar, Alert, Skeleton, Toolbar, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Edit, Delete, Add, Search as SearchIcon, Refresh, Visibility
} from "@mui/icons-material";
import axios from "axios";
import VotanteFormModal from "./modals/VotanteFormModal";
import SearchLeaderModal from "./modals/SearchLeaderModal";
import SearchRecommendedModal from "./modals/SearchRecommendedModal";
import SearchGroupModal from "./modals/SearchGroupModal";
import PageHeader from "./ui/PageHeader";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginTop: theme.spacing(3),
  "& .MuiTableHead-root": {
    background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
    "& .MuiTableCell-head": {
      color: "#fff",
      fontWeight: 600,
      fontSize: "0.95rem",
    },
  },
  "& .MuiTableBody-root .MuiTableRow-root": {
    transition: "all 0.3s",
    "&:hover": {
      backgroundColor: "rgba(1, 141, 165, 0.05)",
      transform: "translateX(4px)",
    },
  },
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(3),
    backgroundColor: "#fff",
    transition: "all 0.3s",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    "&.Mui-focused": {
      boxShadow: "0 4px 20px rgba(1, 141, 165, 0.2)",
    },
  },
}));

const CreateVotanteForm = () => {
  const [votantes, setVotantes] = useState([]);
  const [filteredVotantes, setFilteredVotantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [filterTarget, setFilterTarget] = useState(null);

  const [formModalOpen, setFormModalOpen] = useState(false);

  // fetch inicial
  useEffect(() => {
    fetchVotantes();
  }, []);

  const fetchVotantes = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://backend-node-soft360-production.up.railway.app/votantes");
      setVotantes(res.data);
      setFilteredVotantes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // buscar localmente
  const handleLocalSearch = (value) => {
    setSearchTerm(value);
    if (!value) {
      setFilteredVotantes(votantes);
      return;
    }
    const filtered = votantes.filter((v) => {
      const s = value.toLowerCase();
      return (
        v.identificacion?.toLowerCase().includes(s) ||
        v.nombre?.toLowerCase().includes(s) ||
        v.apellido?.toLowerCase().includes(s) ||
        v.celular?.toLowerCase().includes(s) ||
        v.email?.toLowerCase().includes(s) ||
        v.departamento?.toLowerCase().includes(s) ||
        v.ciudad?.toLowerCase().includes(s) ||
        v.barrio?.toLowerCase().includes(s) ||
        v.direccion?.toLowerCase().includes(s) ||
        v.lider_identificacion?.toLowerCase().includes(s)
      );
    });
    setFilteredVotantes(filtered);
  };

  // aplicar filtro avanzado
  const applyAdvancedFilter = async (type, target) => {
    setFilterType(type);
    setFilterTarget(target);
    setLoading(true);
    try {
      let res;
      if (type === "lider") {
        res = await axios.get(`https://backend-node-soft360-production.up.railway.app/votantes/por-lider-detalle?lider=${target.lider_identificacion}`);
        setVotantes(res.data.votantes);
        setFilteredVotantes(res.data.votantes);
      } else if (type === "recomendado") {
        res = await axios.get(`https://backend-node-soft360-production.up.railway.app/votantes/por-recomendado?recomendado=${target.identificacion}`);
        setVotantes(res.data);
        setFilteredVotantes(res.data);
      } else if (type === "grupo") {
        res = await axios.get(`https://backend-node-soft360-production.up.railway.app/votantes/por-grupo?grupo=${target.id}`);
        setVotantes(res.data);
        setFilteredVotantes(res.data);
      } else {
        fetchVotantes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", pb: 4 }}>
      <PageHeader
        title="Gestión de Votantes"
        description="Administra y organiza los votantes del sistema electoral"
      />

      <Box sx={{ maxWidth: 1400, mx: "auto", px: 2 }}>
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => {
                const type = e.target.value;
                setFilterType(type);
                if (type === "lider") setFilterTarget(null);
                if (type === "recomendado") setFilterTarget(null);
                if (type === "grupo") setFilterTarget(null);
                if (type === "todos") fetchVotantes();
              }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="lider">Por Líder</MenuItem>
              <MenuItem value="recomendado">Por Recomendado</MenuItem>
              <MenuItem value="grupo">Por Grupo</MenuItem>
            </Select>
          </FormControl>

          <SearchBar
            placeholder="Buscar votantes localmente..."
            size="small"
            value={searchTerm}
            onChange={(e) => handleLocalSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 250 }}
          />

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormModalOpen(true)}
            sx={{
              background: "linear-gradient(135deg, rgb(1, 141, 165) 0%, rgb(11, 155, 138) 100%)",
              borderRadius: 3,
              fontWeight: 600,
            }}
          >
            Nuevo Votante
          </Button>

          <IconButton onClick={fetchVotantes} color="primary">
            <Refresh />
          </IconButton>
        </Paper>

        {/* Tabla */}
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Identificación</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Líder</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton variant="rectangular" height={40} />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredVotantes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      No se encontraron votantes
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVotantes.map((v) => (
                  <TableRow key={v.identificacion}>
                    <TableCell>{v.identificacion}</TableCell>
                    <TableCell>{v.nombre}</TableCell>
                    <TableCell>{v.apellido}</TableCell>
                    <TableCell>{v.lider_identificacion || "-"}</TableCell>
                    <TableCell>
                      <IconButton size="small" sx={{ color: "#018da5" }}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" sx={{ color: "#018da5" }}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" sx={{ color: "#d32f2f" }}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </Box>

      {/* Modal Nuevo Votante */}
      <VotanteFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={fetchVotantes}
      />

      {/* Modales de búsqueda */}
      {filterType === "lider" && (
        <SearchLeaderModal
          open={!filterTarget}
          onClose={() => setFilterType("todos")}
          onSelectLeader={(leader) => applyAdvancedFilter("lider", leader)}
        />
      )}
      {filterType === "recomendado" && (
        <SearchRecommendedModal
          open={!filterTarget}
          onClose={() => setFilterType("todos")}
          onSelectRecommended={(rec) => applyAdvancedFilter("recomendado", rec)}
        />
      )}
      {filterType === "grupo" && (
        <SearchGroupModal
          open={!filterTarget}
          onClose={() => setFilterType("todos")}
          onSelectGroup={(group) => applyAdvancedFilter("grupo", group)}
        />
      )}
    </Box>
  );
};

export default CreateVotanteForm;
