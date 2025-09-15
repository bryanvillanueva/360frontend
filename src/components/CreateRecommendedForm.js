import React, { useState, useEffect } from "react";
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
  IconButton,
  Snackbar,
  Alert,
  Skeleton,
  Checkbox,
  Chip,
  Fade,
  Grow,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Edit,
  Delete,
  Add,
  Search as SearchIcon,
  PersonAdd,
  Refresh,
  Visibility,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import axios from "axios";

// Importar modales
import RecommendedFormModal from "./modals/RecommendedFormModal";
import ViewRecommendedModal from "./modals/ViewRecommendedModal";
import BulkDeleteBar from "./modals/BulkDeleteBar";

// Styled Components (iguales a los de líderes)
const HeaderBox = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  color: "#fff",
  boxShadow: "0 4px 20px rgba(1, 141, 165, 0.2)",
}));

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

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  textTransform: "none",
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  transition: "all 0.3s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },
}));

const RecommendedManagement = () => {
  // Estados principales
  const [recomendados, setRecomendados] = useState([]);
  const [filteredRecomendados, setFilteredRecomendados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecomendados, setSelectedRecomendados] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [sureDelete, setSureDelete] = useState(false);

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(25);

  // Estados para modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  // Estados para formularios
  const [formData, setFormData] = useState({
    identificacion: "",
    nombre: "",
    apellido: "",
    departamento: "",
    ciudad: "",
    barrio: "",
    direccion: "",
    celular: "",
    email: "",
    original_identificacion: "",
  });

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Cargar recomendados al montar
  useEffect(() => {
    fetchRecomendados();
  }, []);

  // Obtener recomendados
  const fetchRecomendados = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://backend-node-soft360-production.up.railway.app/recomendados"
      );
      setRecomendados(response.data);
      setFilteredRecomendados(response.data);
    } catch (error) {
      showNotification("Error al obtener recomendados", "error");
    } finally {
      setLoading(false);
    }
  };

  // Mostrar notificación
  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  // Buscar localmente
  const handleLocalSearch = (value) => {
    setSearchTerm(value);
    setPage(0); // Reset to first page on search
    if (!value) {
      setFilteredRecomendados(recomendados);
      return;
    }
    const filtered = recomendados.filter((recomendado) => {
      const searchValue = value.toLowerCase();
      return (
        recomendado.identificacion?.toLowerCase().includes(searchValue) ||
        recomendado.nombre?.toLowerCase().includes(searchValue) ||
        recomendado.apellido?.toLowerCase().includes(searchValue) ||
        recomendado.celular?.toLowerCase().includes(searchValue) ||
        recomendado.email?.toLowerCase().includes(searchValue) ||
        recomendado.departamento?.toLowerCase().includes(searchValue) ||
        recomendado.ciudad?.toLowerCase().includes(searchValue) ||
        recomendado.barrio?.toLowerCase().includes(searchValue)
      );
    });
    setFilteredRecomendados(filtered);
  };

  // Abrir modal de crear
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormData({
      identificacion: "",
      nombre: "",
      apellido: "",
      departamento: "",
      ciudad: "",
      barrio: "",
      direccion: "",
      celular: "",
      email: "",
      original_identificacion: "",
    });
    setFormModalOpen(true);
  };

  // Abrir modal de editar
  const handleOpenEditModal = (recomendado) => {
    setIsEditing(true);
    setFormData({
      ...recomendado,
      original_identificacion: recomendado.identificacion,
    });
    setFormModalOpen(true);
  };

  // Manejar cambios en formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(
          `https://backend-node-soft360-production.up.railway.app/recomendados/${formData.original_identificacion}`,
          formData
        );
        showNotification("Recomendado actualizado con éxito");
      } else {
        await axios.post(
          "https://backend-node-soft360-production.up.railway.app/recomendados",
          formData
        );
        showNotification("Recomendado creado con éxito");
      }
      setFormModalOpen(false);
      fetchRecomendados();
    } catch (error) {
      showNotification(
        error.response?.data?.error || "Error al procesar la solicitud",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de ver detalles
  const handleOpenViewModal = (recomendado) => {
    setViewTarget(recomendado);
    setViewModalOpen(true);
  };

  // Eliminar recomendado individual
  const handleDeleteRecomendado = async (recomendado) => {
    if (window.confirm(`¿Estás seguro de eliminar el recomendado ${recomendado.nombre} ${recomendado.apellido}?`)) {
      setLoading(true);
      try {
        await axios.delete(
          `https://backend-node-soft360-production.up.railway.app/recomendados/${recomendado.identificacion}`
        );
        showNotification("Recomendado eliminado con éxito");
        fetchRecomendados();
      } catch (error) {
        showNotification(
          error.response?.data?.error || "Error al eliminar recomendado",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Selección de recomendados para eliminación masiva
  const handleSelectRecomendado = (recomendado) => {
    setSelectedRecomendados((prev) => {
      const isSelected = prev.some(
        (r) => r.identificacion === recomendado.identificacion
      );
      if (isSelected) {
        return prev.filter(
          (r) => r.identificacion !== recomendado.identificacion
        );
      }
      if (prev.length >= 50) {
        showNotification("Máximo 50 recomendados a la vez", "warning");
        return prev;
      }
      return [...prev, recomendado];
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const currentPageRecomendados = paginatedRecomendados.slice(0, Math.min(paginatedRecomendados.length, 50));
      const newSelected = [...selectedRecomendados];

      currentPageRecomendados.forEach(recomendado => {
        if (!newSelected.some(r => r.identificacion === recomendado.identificacion)) {
          if (newSelected.length < 50) {
            newSelected.push(recomendado);
          }
        }
      });

      setSelectedRecomendados(newSelected);
      if (newSelected.length >= 50) {
        showNotification("Máximo 50 recomendados seleccionados", "info");
      }
    } else {
      // Deseleccionar solo los de la página actual
      const currentPageIds = paginatedRecomendados.map(r => r.identificacion);
      setSelectedRecomendados(prev => prev.filter(r => !currentPageIds.includes(r.identificacion)));
    }
  };

  // Eliminación masiva
  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      const ids = selectedRecomendados.map(r => r.identificacion);
      await axios.delete(
        "https://backend-node-soft360-production.up.railway.app/recomendados/bulk",
        { data: { ids } }
      );
      showNotification(
        `${selectedRecomendados.length} recomendados eliminados con éxito`
      );
      setSelectedRecomendados([]);
      setBulkDeleteOpen(false);
      setSureDelete(false);
      fetchRecomendados();
    } catch (error) {
      showNotification("Error al eliminar recomendados", "error");
    } finally {
      setLoading(false);
    }
  };

  // Funciones de paginación
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Calcular datos paginados
  const paginatedRecomendados = filteredRecomendados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredRecomendados.length / rowsPerPage);

  const isSelected = (recomendado) =>
    selectedRecomendados.some(
      (r) => r.identificacion === recomendado.identificacion
    );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", pb: 4 }}>
      <Fade in timeout={800}>
        <HeaderBox>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              mb: 2,
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Gestión de Recomendados
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", opacity: 0.95 }}
          >
            Administra y organiza los recomendados del sistema electoral
          </Typography>
        </HeaderBox>
      </Fade>

      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 3 } }}>
        {/* Barra de herramientas */}
        <Grow in timeout={1000}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <SearchBar
              placeholder="Buscar recomendados localmente..."
              variant="outlined"
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

            <ActionButton
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={handleOpenCreateModal}
              sx={{
                background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
              }}
            >
              Nuevo Recomendado
            </ActionButton>

            <IconButton onClick={fetchRecomendados} color="primary">
              <Refresh />
            </IconButton>

            {selectedRecomendados.length > 0 && (
              <Chip
                label={`${selectedRecomendados.length} seleccionados`}
                color="primary"
                onDelete={() => setSelectedRecomendados([])}
              />
            )}

            {selectedRecomendados.length > 0 && (
              <ActionButton
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={() => setBulkDeleteOpen(true)}
              >
                Eliminar Seleccionados
              </ActionButton>
            )}
          </Paper>
        </Grow>

        {/* Tabla de recomendados */}
        <Grow in timeout={1200}>
          <StyledTableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedRecomendados.length > 0 &&
                        selectedRecomendados.length < filteredRecomendados.length
                      }
                      checked={
                        filteredRecomendados.length > 0 &&
                        selectedRecomendados.length >= Math.min(filteredRecomendados.length, rowsPerPage)
                      }
                      onChange={handleSelectAll}
                      sx={{ color: "#fff" }}
                    />
                  </TableCell>
                  <TableCell>Identificación</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Departamento</TableCell>
                  <TableCell>Ciudad</TableCell>
                  <TableCell>Barrio</TableCell>
                  <TableCell>Celular</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={10}>
                        <Skeleton variant="rectangular" height={40} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredRecomendados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography variant="body1" sx={{ py: 3 }}>
                        No se encontraron recomendados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRecomendados.map((recomendado) => (
                    <TableRow
                      key={recomendado.identificacion}
                      selected={isSelected(recomendado)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected(recomendado)}
                          onChange={() => handleSelectRecomendado(recomendado)}
                        />
                      </TableCell>
                      <TableCell>{recomendado.identificacion}</TableCell>
                      <TableCell>{recomendado.nombre}</TableCell>
                      <TableCell>{recomendado.apellido}</TableCell>
                      <TableCell>{recomendado.departamento || "-"}</TableCell>
                      <TableCell>{recomendado.ciudad || "-"}</TableCell>
                      <TableCell>{recomendado.barrio || "-"}</TableCell>
                      <TableCell>{recomendado.celular}</TableCell>
                      <TableCell>{recomendado.email}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenViewModal(recomendado)}
                          sx={{ color: "#018da5" }}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditModal(recomendado)}
                          sx={{ color: "#018da5" }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRecomendado(recomendado)}
                          sx={{ color: "#d32f2f" }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Paginación */}
            {filteredRecomendados.length > rowsPerPage && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  borderTop: "1px solid rgba(224, 224, 224, 1)"
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Mostrando {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, filteredRecomendados.length)} de {filteredRecomendados.length} recomendados
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <IconButton
                    onClick={() => handleChangePage(page - 1)}
                    disabled={page === 0}
                    size="small"
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                  <Typography variant="body2">
                    Página {page + 1} de {totalPages}
                  </Typography>
                  <IconButton
                    onClick={() => handleChangePage(page + 1)}
                    disabled={page >= totalPages - 1}
                    size="small"
                  >
                    <KeyboardArrowRight />
                  </IconButton>
                </Box>
              </Box>
            )}
          </StyledTableContainer>
        </Grow>

        {/* Modales */}
        <RecommendedFormModal
          open={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          isEditing={isEditing}
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          loading={loading}
        />

        <ViewRecommendedModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          recommendedData={viewTarget}
        />

        <BulkDeleteBar
          open={bulkDeleteOpen}
          selectedCount={selectedRecomendados.length}
          onCancel={() => {
            setBulkDeleteOpen(false);
            setSureDelete(false);
          }}
          onDelete={handleBulkDelete}
          sure={sureDelete}
          setSure={setSureDelete}
          max={50}
        />

        {/* Notificaciones */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default RecommendedManagement;