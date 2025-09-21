import React, { useState, useEffect } from "react";
import {
  Box, Button, Typography, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, TextField,
  InputAdornment, Snackbar, Alert, Skeleton, MenuItem, Select, FormControl, InputLabel,
  TablePagination
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Edit, Delete, Add, Search as SearchIcon, Refresh, Visibility
} from "@mui/icons-material";
import axios from "axios";
import VotanteFormModal from "./modals/VotanteFormModal";
import VotanteEditModal from "./modals/VotanteEditModal";
import VotanteDeleteModal from "./modals/VotanteDeleteModal";
import ViewVotanteModal from "./modals/ViewVotanteModal";
import SearchLeaderModal from "./modals/SearchLeaderModal";
import SearchRecommendedModal from "./modals/SearchRecommendedModal";
import SearchGroupModal from "./modals/SearchGroupModal";

const HeaderBox = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  color: "#ffffffff",
  boxShadow: "0 4px 20px rgba(1, 141, 165, 0.2)",
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(3),
  "& .MuiTableHead-root": {
    background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
    "& .MuiTableCell-head": {
      color: "#ffffffff",
      fontWeight: 600,
      fontSize: "0.95rem",
    },
  },
  "& .MuiTableBody-root .MuiTableRow-root": {
    transition: "all 0.3s",
    "&:hover": {
      backgroundColor: "rgba(1, 141, 165, 0.05)",
      transform: "translateX(0px)",
    },
  },
}));

// Nuevo componente para el Paper con bordes redondeados en la parte inferior
const RoundedPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  '& .MuiTablePagination-root': {
    borderBottomLeftRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    backgroundColor: '#ffffff',
    marginTop: 0, // Aseguramos que no haya margen superior
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

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  
  // Estados para datos de modales
  const [selectedVotante, setSelectedVotante] = useState(null);
  const [editVotanteData, setEditVotanteData] = useState(null);
  
  // Estados para notificaciones
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // fetch inicial
  useEffect(() => {
    fetchVotantes();
  }, []);

  // Resetear paginación cuando cambian los datos
  useEffect(() => {
    setPage(0);
  }, [filteredVotantes]);

  const fetchVotantes = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://backend-node-soft360-production.up.railway.app/votantes");
      setVotantes(res.data);
      setFilteredVotantes(res.data);
    } catch (err) {
      console.error(err);
      showSnackbar("Error al cargar votantes", "error");
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar notificaciones
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Cerrar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
      showSnackbar("Error al aplicar filtro", "error");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Obtener votantes para la página actual
  const votantesPaginados = filteredVotantes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Manejar ver votante
  const handleViewVotante = (votante) => {
    setSelectedVotante(votante);
    setViewModalOpen(true);
  };

  // Manejar editar votante
  const handleEditVotante = (votante) => {
    setEditVotanteData({ ...votante });
    setEditModalOpen(true);
  };

  // Manejar eliminar votante
  const handleDeleteVotante = (votante) => {
    setSelectedVotante(votante);
    setDeleteModalOpen(true);
  };

  // Manejar cambios en edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditVotanteData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar cambios de edición
  const handleSaveEdit = async () => {
    try {
      await axios.put(
        `https://backend-node-soft360-production.up.railway.app/votantes/${editVotanteData.identificacion}`,
        editVotanteData
      );
      showSnackbar("Votante actualizado exitosamente");
      setEditModalOpen(false);
      setEditVotanteData(null);
      fetchVotantes();
    } catch (error) {
      console.error("Error al actualizar votante:", error);
      showSnackbar("Error al actualizar votante", "error");
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `https://backend-node-soft360-production.up.railway.app/votantes/${selectedVotante.identificacion}`
      );
      showSnackbar("Votante eliminado exitosamente");
      setDeleteModalOpen(false);
      setSelectedVotante(null);
      fetchVotantes();
    } catch (error) {
      console.error("Error al eliminar votante:", error);
      showSnackbar("Error al eliminar votante", "error");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", pb: 4 }}>
      <HeaderBox>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: "center", mb: 2 }}>
          Gestión de Votantes
        </Typography>
        <Typography variant="body1" sx={{ textAlign: "center", opacity: 0.95 }}>
          Administra y organiza los votantes del sistema electoral
        </Typography>
      </HeaderBox>

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

        {/* Tabla con paginación - Usando RoundedPaper en lugar de Paper */}
        <RoundedPaper elevation={2}>
          <StyledTableContainer>
            <Table sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '120px' }}>Identificación</TableCell>
                  <TableCell sx={{ width: '120px' }}>Nombre</TableCell>
                  <TableCell sx={{ width: '120px' }}>Apellido</TableCell>
                  <TableCell sx={{ width: '120px' }}>Departamento</TableCell>
                  <TableCell sx={{ width: '120px' }}>Ciudad</TableCell>
                  <TableCell sx={{ width: '120px' }}>Barrio</TableCell>
                  <TableCell sx={{ width: '150px' }}>Dirección</TableCell>
                  <TableCell sx={{ width: '120px' }}>Líder</TableCell>
                  <TableCell sx={{ width: '120px' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(rowsPerPage)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <Skeleton variant="rectangular" height={40} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : votantesPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body1" sx={{ py: 3 }}>
                        No se encontraron votantes
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  votantesPaginados.map((v) => (
                    <TableRow key={v.identificacion}>
                      <TableCell>{v.identificacion}</TableCell>
                      <TableCell>{v.nombre}</TableCell>
                      <TableCell>{v.apellido}</TableCell>
                      <TableCell>{v.departamento || "-"}</TableCell>
                      <TableCell>{v.ciudad || "-"}</TableCell>
                      <TableCell>{v.barrio || "-"}</TableCell>
                      <TableCell>{v.direccion || "-"}</TableCell>
                      <TableCell>{v.lider_identificacion || "-"}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            sx={{ color: "#018da5" }}
                            onClick={() => handleViewVotante(v)}
                            title="Ver detalles"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            sx={{ color: "#018da5" }}
                            onClick={() => handleEditVotante(v)}
                            title="Editar votante"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            sx={{ color: "#d32f2f" }}
                            onClick={() => handleDeleteVotante(v)}
                            title="Eliminar votante"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
          
          {/* Paginación con bordes redondeados y sin espacio superior */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredVotantes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
            sx={{
              borderTop: '1px solid rgba(224, 224, 224, 0.5)',
              '& .MuiTablePagination-toolbar': {
                padding: '4px 16px 8px', // Padding reducido: 4px arriba, 16px lados, 8px abajo
                minHeight: '44px',       // Altura mínima reducida
                borderRadius: '0 0 16px 16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                justifyContent: 'flex-end', // Alinea todo el contenido a la derecha
                alignItems: 'center',
              },
              '& .MuiTablePagination-selectLabel': {
                margin: 0,
                marginRight: '8px'
              },
              '& .MuiTablePagination-displayedRows': {
                margin: 0
              },
              '& .MuiTablePagination-spacer': {
                display: 'none'
              },
              '& .MuiTablePagination-actions': {
                marginLeft: '8px'
              }
            }}
          />
        </RoundedPaper>
      </Box>

      {/* Modal Nuevo Votante */}
      <VotanteFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={() => {
          fetchVotantes();
          showSnackbar("Votante creado exitosamente");
        }}
      />

      {/* Modal Editar Votante */}
      {editVotanteData && (
        <VotanteEditModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditVotanteData(null);
          }}
          votante={editVotanteData}
          onChange={handleEditChange}
          onSave={handleSaveEdit}
          loading={false}
        />
      )}

      {/* Modal Ver Votante */}
      {selectedVotante && (
        <ViewVotanteModal
          open={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedVotante(null);
          }}
          votante={selectedVotante}
        />
      )}

      {/* Modal Eliminar Votante */}
      {selectedVotante && (
        <VotanteDeleteModal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedVotante(null);
          }}
          votante={selectedVotante}
          onConfirm={handleConfirmDelete}
          loading={false}
        />
      )}

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

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateVotanteForm;