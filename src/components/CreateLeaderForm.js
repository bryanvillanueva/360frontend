import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Skeleton,
  Checkbox,
  Chip,
  Grow,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Edit,
  Delete,
  Search as SearchIcon,
  PersonAdd,
  Refresh,
  Visibility,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  CloudUpload,
} from "@mui/icons-material";
import axios from "axios";

// Importar modales
import LeaderFormModal from "./modals/LeaderFormModal";
import SearchLeaderModal from "./modals/SearchLeaderModal";
import ViewLeaderModal from "./modals/ViewLeaderModal";
import BulkDeleteBar from "./modals/BulkDeleteBar";
import PageHeader from "./ui/PageHeader";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginTop: theme.spacing(3),
  overflowX: "auto",
  "& .MuiTableHead-root": {
    background: theme.palette.primary.main,
    "& .MuiTableCell-head": {
      color: "#fff",
      fontWeight: 600,
      fontSize: "0.85rem",
      whiteSpace: "nowrap",
      padding: theme.spacing(1.5),
    },
  },
  "& .MuiTableBody-root .MuiTableRow-root": {
    transition: "all 0.3s",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
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
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
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

const CreateLeaderForm = () => {
  // Estados principales
  const [leaders, setLeaders] = useState([]);
  const [filteredLeaders, setFilteredLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeaders, setSelectedLeaders] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [sureDelete, setSureDelete] = useState(false);

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  // Estados para modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  // Estados para formularios
  const [formData, setFormData] = useState({
    identificacion: "",
    nombre: "",
    apellido: "",
    celular: "",
    email: "",
    departamento: "",
    ciudad: "",
    barrio: "",
    direccion: "",
    recomendado_identificacion: "",
    objetivo: "",
    original_identificacion: "",
  });

  const [recomendadoData, setRecomendadoData] = useState(null);

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Cargar líderes al montar
  useEffect(() => {
    fetchLeaders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Obtener líderes
  const fetchLeaders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://backend-node-soft360-production.up.railway.app/lideres"
      );
      setLeaders(response.data);
      setFilteredLeaders(response.data);
    } catch (error) {
      showNotification("Error al obtener líderes", "error");
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
      setFilteredLeaders(leaders);
      return;
    }
    const filtered = leaders.filter((leader) => {
      const searchValue = value.toLowerCase();
      return (
        leader.lider_identificacion?.toLowerCase().includes(searchValue) ||
        leader.lider_nombre?.toLowerCase().includes(searchValue) ||
        leader.lider_apellido?.toLowerCase().includes(searchValue) ||
        leader.lider_celular?.toLowerCase().includes(searchValue) ||
        leader.lider_email?.toLowerCase().includes(searchValue) ||
        leader.lider_departamento?.toLowerCase().includes(searchValue) ||
        leader.lider_ciudad?.toLowerCase().includes(searchValue) ||
        leader.lider_barrio?.toLowerCase().includes(searchValue)
      );
    });
    setFilteredLeaders(filtered);
  };

  // Abrir modal de búsqueda de líder
  const handleOpenSearchModal = () => {
    setSearchModalOpen(true);
  };

  // Seleccionar líder desde búsqueda
  const handleSelectLeaderFromSearch = (leader) => {
    setFormData({
      identificacion: "",
      nombre: "",
      apellido: "",
      celular: "",
      email: "",
      departamento: "",
      ciudad: "",
      barrio: "",
      direccion: "",
      recomendado_identificacion: leader.identificacion,
      objetivo: "",
      original_identificacion: "",
    });
    setRecomendadoData({
      identificacion: leader.identificacion,
      nombre: leader.nombre,
      apellido: leader.apellido,
    });
    setSearchModalOpen(false);
    setFormModalOpen(true);
  };

  // Abrir modal de crear
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormData({
      identificacion: "",
      nombre: "",
      apellido: "",
      celular: "",
      email: "",
      departamento: "",
      ciudad: "",
      barrio: "",
      direccion: "",
      recomendado_identificacion: "",
      objetivo: "",
      original_identificacion: "",
    });
    setRecomendadoData(null);
    setFormModalOpen(true);
  };

  // Abrir modal de editar
  const handleOpenEditModal = (leader) => {
    setIsEditing(true);
    setFormData({
      original_identificacion: leader.lider_identificacion,
      identificacion: leader.lider_identificacion,
      nombre: leader.lider_nombre,
      apellido: leader.lider_apellido,
      celular: leader.lider_celular,
      email: leader.lider_email,
      departamento: leader.lider_departamento || "",
      ciudad: leader.lider_ciudad || "",
      barrio: leader.lider_barrio || "",
      direccion: leader.lider_direccion || "",
      recomendado_identificacion: leader.recomendado_identificacion || "",
      objetivo: leader.lider_objetivo || "",
    });
    setFormModalOpen(true);
  };

  // Manejar cambios en formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar selección de recomendado
  const handleRecommendedSelect = (recommended) => {
    if (recommended) {
      setRecomendadoData(recommended);
      setFormData((prev) => ({
        ...prev,
        recomendado_identificacion: recommended.identificacion,
      }));
    } else {
      setRecomendadoData(null);
      setFormData((prev) => ({
        ...prev,
        recomendado_identificacion: "",
      }));
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(
          `https://backend-node-soft360-production.up.railway.app/lideres/${formData.original_identificacion}`,
          formData
        );
        showNotification("Líder actualizado con éxito");
      } else {
        // Si no hay recomendado, crear como autorecomendado
        if (!formData.recomendado_identificacion) {
          // Primero crear el recomendado
          await axios.post(
            "https://backend-node-soft360-production.up.railway.app/recomendados",
            {
              identificacion: formData.identificacion,
              nombre: formData.nombre,
              apellido: formData.apellido,
              celular: formData.celular,
              email: formData.email,
              departamento: formData.departamento,
              ciudad: formData.ciudad,
              barrio: formData.barrio,
              direccion: formData.direccion,
            }
          );
          // Luego crear el líder como autorecomendado
          await axios.post(
            "https://backend-node-soft360-production.up.railway.app/lideres",
            { ...formData, recomendado_identificacion: formData.identificacion }
          );
          showNotification("Líder creado como autorecomendado con éxito");
        } else {
          await axios.post(
            "https://backend-node-soft360-production.up.railway.app/lideres",
            formData
          );
          showNotification("Líder creado con éxito");
        }
      }
      setFormModalOpen(false);
      fetchLeaders();
    } catch (error) {
      showNotification(
        error.response?.data?.error || "Error al procesar la solicitud",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Eliminar líder individual reutilizando el flujo masivo
  const handleDeleteLeader = (leader) => {
    setSelectedLeaders([leader]);
    setSureDelete(false);
    setBulkDeleteOpen(true);
  };

  // Abrir modal de ver detalles
  const handleOpenViewModal = (leader) => {
    setViewTarget(leader);
    setViewModalOpen(true);
  };

  // Selección de líderes para eliminación masiva
  const handleSelectLeader = (leader) => {
    setSelectedLeaders((prev) => {
      const isSelected = prev.some(
        (l) => l.lider_identificacion === leader.lider_identificacion
      );
      if (isSelected) {
        return prev.filter(
          (l) => l.lider_identificacion !== leader.lider_identificacion
        );
      }
      if (prev.length >= 50) {
        showNotification("Máximo 50 líderes a la vez", "warning");
        return prev;
      }
      return [...prev, leader];
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const currentPageLeaders = paginatedLeaders.slice(0, Math.min(paginatedLeaders.length, 50));
      const newSelected = [...selectedLeaders];

      currentPageLeaders.forEach(leader => {
        if (!newSelected.some(l => l.lider_identificacion === leader.lider_identificacion)) {
          if (newSelected.length < 50) {
            newSelected.push(leader);
          }
        }
      });

      setSelectedLeaders(newSelected);
      if (newSelected.length >= 50) {
        showNotification("Máximo 50 líderes seleccionados", "info");
      }
    } else {
      // Deseleccionar solo los de la página actual
      const currentPageIds = paginatedLeaders.map(l => l.lider_identificacion);
      setSelectedLeaders(prev => prev.filter(l => !currentPageIds.includes(l.lider_identificacion)));
    }
  };

  // Eliminación masiva
  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      await Promise.all(
        selectedLeaders.map((leader) =>
          axios.delete(
            `https://backend-node-soft360-production.up.railway.app/lideres/${leader.lider_identificacion}`
          )
        )
      );
      showNotification(
        `${selectedLeaders.length} líderes eliminados con éxito`
      );
      setSelectedLeaders([]);
      setBulkDeleteOpen(false);
      setSureDelete(false);
      fetchLeaders();
    } catch (error) {
      showNotification("Error al eliminar líderes", "error");
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (leader) =>
    selectedLeaders.some(
      (l) => l.lider_identificacion === leader.lider_identificacion
    );

  // Funciones de paginación
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Calcular datos paginados
  const paginatedLeaders = filteredLeaders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredLeaders.length / rowsPerPage);

  return (
    <Box sx={(theme) => ({ minHeight: "100vh", bgcolor: theme.palette.background.subtle, pb: 4 })}>
      <PageHeader
        title="Gestión de Líderes"
        description="Administra y organiza los líderes del sistema electoral"
      />

      <Box>
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
              placeholder="Buscar líderes localmente..."
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
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleOpenSearchModal}
              sx={(theme) => ({ borderColor: theme.palette.primary.main, color: theme.palette.primary.main })}
            >
              Buscar Líder
            </ActionButton>

            <ActionButton
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={handleOpenCreateModal}
              sx={(theme) => ({
                background: theme.palette.primary.main,
              })}
            >
              Nuevo Líder
            </ActionButton>

            <ActionButton
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={() => showNotification("La carga masiva de líderes estará disponible próximamente", "info")}
              sx={(theme) => ({
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
              })}
            >
              Cargar Excel
            </ActionButton>

            <IconButton onClick={fetchLeaders} color="primary">
              <Refresh />
            </IconButton>

            {selectedLeaders.length > 0 && (
              <Chip
                label={`${selectedLeaders.length} seleccionados`}
                color="primary"
                onDelete={() => setSelectedLeaders([])}
              />
            )}

            {selectedLeaders.length > 0 && (
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

        {/* Tabla de líderes */}
        <Grow in timeout={1200}>
          <StyledTableContainer component={Paper}>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: 50 }}>
                    <Checkbox
                      indeterminate={
                        selectedLeaders.length > 0 &&
                        selectedLeaders.length < filteredLeaders.length
                      }
                      checked={
                        filteredLeaders.length > 0 &&
                        selectedLeaders.length >= Math.min(filteredLeaders.length, rowsPerPage)
                      }
                      onChange={handleSelectAll}
                      sx={{ color: "#fff" }}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 110 }}>Identificación</TableCell>
                  <TableCell sx={{ minWidth: 130 }}>Nombre</TableCell>
                  <TableCell sx={{ minWidth: 130 }}>Apellido</TableCell>
                  <TableCell sx={{ minWidth: 110 }}>Departamento</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>Ciudad</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>Barrio</TableCell>
                  <TableCell sx={{ minWidth: 110 }}>Celular</TableCell>
                  <TableCell sx={{ minWidth: 150 }}>Email</TableCell>
                  <TableCell align="center" sx={{ minWidth: 140 }}>Acciones</TableCell>
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
                ) : filteredLeaders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography variant="body1" sx={{ py: 3 }}>
                        No se encontraron líderes
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLeaders.map((leader) => (
                    <TableRow
                      key={leader.lider_identificacion}
                      selected={isSelected(leader)}
                      hover
                    >
                      <TableCell padding="checkbox" sx={{ width: 50 }}>
                        <Checkbox
                          checked={isSelected(leader)}
                          onChange={() => handleSelectLeader(leader)}
                        />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{leader.lider_identificacion}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{leader.lider_nombre}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{leader.lider_apellido}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{leader.lider_departamento || "-"}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{leader.lider_ciudad || "-"}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{leader.lider_barrio || "-"}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{leader.lider_celular}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{leader.lider_email}</TableCell>
                      <TableCell align="center" sx={(theme) => ({ borderLeft: `0.5px solid ${theme.palette.grey[300]}`, whiteSpace: 'nowrap' })}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenViewModal(leader)}
                            sx={(theme) => ({ color: theme.palette.primary.main })}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditModal(leader)}
                            sx={(theme) => ({ color: theme.palette.primary.main })}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteLeader(leader)}
                            sx={(theme) => ({ color: theme.palette.error.main })}
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

            {/* Paginación */}
            {filteredLeaders.length > rowsPerPage && (
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
                  Mostrando {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, filteredLeaders.length)} de {filteredLeaders.length} líderes
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
        <LeaderFormModal
          open={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          isEditing={isEditing}
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          loading={loading}
          recomendadoData={recomendadoData}
          onRecommendedSelect={handleRecommendedSelect}
        />


        <SearchLeaderModal
          open={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSelectLeader={handleSelectLeaderFromSearch}
        />

        <ViewLeaderModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          leaderData={viewTarget}
        />

        <BulkDeleteBar
          open={bulkDeleteOpen}
          selectedCount={selectedLeaders.length}
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

export default CreateLeaderForm;
