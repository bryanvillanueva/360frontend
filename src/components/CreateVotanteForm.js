import React, { useState, useEffect } from "react";
import {
  Box, Button, Typography, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, TextField,
  InputAdornment, Snackbar, Alert, Skeleton, MenuItem, Select, FormControl, InputLabel,
  TablePagination, Checkbox, Chip, alpha, Dialog, DialogTitle, DialogContent,
  DialogActions, Radio, RadioGroup, FormControlLabel, FormLabel
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Edit, Delete, Add, Search as SearchIcon, Refresh, Visibility, CloudUpload
} from "@mui/icons-material";
import axios from "axios";
import VotanteFormModal from "./modals/VotanteFormModal";
import VotanteEditModal from "./modals/VotanteEditModal";
import VotanteDeleteModal from "./modals/VotanteDeleteModal";
import ViewVotanteModal from "./modals/ViewVotanteModal";
import SearchLeaderModal from "./modals/SearchLeaderModal";
import SearchRecommendedModal from "./modals/SearchRecommendedModal";
import SearchGroupModal from "./modals/SearchGroupModal";
import BulkDeleteBar from "./modals/BulkDeleteBar";
import PageHeader from "./ui/PageHeader";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
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
    backgroundColor: theme.palette.background.paper,
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
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
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
  const [selectedVotantes, setSelectedVotantes] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [sureDelete, setSureDelete] = useState(false);

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

  // Estados para carga Excel
  const fileInputRef = React.useRef(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [duplicadosReasignables, setDuplicadosReasignables] = useState([]);
  const [duplicadosNoReasignables, setDuplicadosNoReasignables] = useState([]);
  const [modalReasignacionOpen, setModalReasignacionOpen] = useState(false);
  const [modalNoReasignableOpen, setModalNoReasignableOpen] = useState(false);
  const [reassignOptions, setReassignOptions] = useState({});

  // fetch inicial
  useEffect(() => {
    fetchVotantes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        v.lider_nombre?.toLowerCase().includes(s)
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

  // Selección de votantes
  const handleSelectVotante = (votante) => {
    const isSelected = selectedVotantes.some(
      (v) => v.identificacion === votante.identificacion
    );
    if (isSelected) {
      setSelectedVotantes(
        selectedVotantes.filter((v) => v.identificacion !== votante.identificacion)
      );
    } else {
      if (selectedVotantes.length < 50) {
        setSelectedVotantes([...selectedVotantes, votante]);
      } else {
        showSnackbar("Máximo 50 votantes seleccionados", "info");
      }
    }
  };

  const isSelected = (votante) =>
    selectedVotantes.some((v) => v.identificacion === votante.identificacion);

  const handleSelectAll = () => {
    if (selectedVotantes.length < votantesPaginados.length) {
      const availableSlots = 50 - selectedVotantes.length;
      if (availableSlots >= votantesPaginados.length) {
        setSelectedVotantes([...selectedVotantes, ...votantesPaginados]);
      } else {
        showSnackbar("Máximo 50 votantes seleccionados", "info");
      }
    } else {
      const currentPageIds = votantesPaginados.map((v) => v.identificacion);
      setSelectedVotantes((prev) =>
        prev.filter((v) => !currentPageIds.includes(v.identificacion))
      );
    }
  };

  // Eliminación individual con motivo
  const handleDeleteVotante = (votante) => {
    setSelectedVotante(votante);
    setDeleteModalOpen(true);
  };

  // Confirmar eliminación individual con motivo
  const handleConfirmDelete = async (deleteReason) => {
    setLoading(true);
    try {
      await axios.delete(
        `https://backend-node-soft360-production.up.railway.app/votantes/${selectedVotante.identificacion}`,
        {
          data: { delete_reason: deleteReason || "Sin motivo especificado" }
        }
      );
      showSnackbar("Votante eliminado exitosamente");
      setDeleteModalOpen(false);
      setSelectedVotante(null);
      fetchVotantes();
    } catch (error) {
      console.error("Error al eliminar votante:", error);
      showSnackbar(error.response?.data?.error || "Error al eliminar votante", "error");
    } finally {
      setLoading(false);
    }
  };

  // Eliminación masiva
  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      const ids = selectedVotantes.map((v) => v.identificacion);
      await axios.delete(
        "https://backend-node-soft360-production.up.railway.app/votantes/bulk",
        { data: { ids } }
      );
      showSnackbar(
        `${selectedVotantes.length} votante(s) eliminado(s) exitosamente`
      );
      setSelectedVotantes([]);
      setBulkDeleteOpen(false);
      setSureDelete(false);
      fetchVotantes();
    } catch (error) {
      console.error("Error al eliminar votantes:", error);
      showSnackbar(
        error.response?.data?.error || "Error al eliminar votantes",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Manejar carga de Excel
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";

    const formDataToSend = new FormData();
    formDataToSend.append("file", file);
    setUploadLoading(true);

    try {
      const response = await axios.post(
        "https://backend-node-soft360-production.up.railway.app/votantes/upload_csv",
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { procesados = 0, capturas_insertadas = 0, incidencias = [] } = response.data;

      if (incidencias && incidencias.length > 0) {
        const duplicadosMismoLider = incidencias.filter(i =>
          i.tipo === 'DUPLICIDAD_CON_SI_MISMO' || i.tipo === 'DUPLICIDAD_LIDER'
        );
        const duplicadosOtroLider = incidencias.filter(i =>
          i.tipo === 'DUPLICIDAD_ENTRE_LIDERES'
        );
        const conflictos = incidencias.filter(i =>
          i.tipo === 'CONFLICTO_DATOS'
        );

        const reasignables = duplicadosOtroLider.map(inc => ({
          identificacion: inc.votante_identificacion,
          nombre: inc.detalles?.votante_nombre || '',
          apellido: inc.detalles?.votante_apellido || '',
          direccion: inc.detalles?.direccion || '',
          celular: inc.detalles?.celular || '',
          lider_identificacion: inc.detalles?.lider_actual || '',
          lider_nombre: inc.detalles?.lider_actual_nombre || '',
          identificacion_intentado: inc.votante_identificacion,
          nombre_intentado: inc.detalles?.nombre_capturado || '',
          apellido_intentado: inc.detalles?.apellido_capturado || '',
          direccion_intentado: inc.detalles?.direccion_capturada || '',
          celular_intentado: inc.detalles?.celular_capturado || '',
          lider_intentado: inc.lider_identificacion || '',
        }));

        const noReasignables = [...duplicadosMismoLider, ...conflictos].map(inc => ({
          identificacion: inc.votante_identificacion,
          nombre: inc.detalles?.votante_nombre || '',
          apellido: inc.detalles?.votante_apellido || '',
          direccion: inc.detalles?.direccion || '',
          celular: inc.detalles?.celular || '',
          lider_identificacion: inc.detalles?.lider_actual || inc.lider_identificacion || '',
          lider_nombre: inc.detalles?.lider_actual_nombre || '',
          identificacion_intentado: inc.votante_identificacion,
          nombre_intentado: inc.detalles?.nombre_capturado || '',
          apellido_intentado: inc.detalles?.apellido_capturado || '',
          direccion_intentado: inc.detalles?.direccion_capturada || '',
          celular_intentado: inc.detalles?.celular_capturado || '',
          lider_intentado: inc.lider_identificacion || '',
        }));

        setDuplicadosReasignables(reasignables);
        setDuplicadosNoReasignables(noReasignables);

        const initialOptions = {};
        reasignables.forEach((dup) => {
          initialOptions[dup.identificacion] = "current";
        });
        setReassignOptions(initialOptions);

        if (reasignables.length > 0) {
          setModalReasignacionOpen(true);
        } else if (noReasignables.length > 0) {
          setModalNoReasignableOpen(true);
        }

        showSnackbar(`${procesados} procesados, ${capturas_insertadas} capturas, ${incidencias.length} incidencias`, "warning");
      } else {
        showSnackbar(`Carga exitosa: ${procesados} procesados, ${capturas_insertadas} capturas creadas`);
      }
      fetchVotantes();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Error al cargar el archivo";
      showSnackbar(errorMsg, "error");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleReassignOptionChange = (cedula, value) => {
    setReassignOptions((prev) => ({ ...prev, [cedula]: value }));
  };

  const handleConfirmReassign = async () => {
    let errorOccurred = false;
    let reasignados = 0;
    let mantenidos = 0;

    for (const dup of duplicadosReasignables) {
      if (reassignOptions[dup.identificacion] === "new") {
        try {
          await axios.post("https://backend-node-soft360-production.up.railway.app/asignaciones", {
            votante_identificacion: dup.identificacion,
            lider_identificacion: dup.lider_intentado
          });

          const hayDiferencias =
            (dup.nombre_intentado && dup.nombre_intentado !== dup.nombre) ||
            (dup.apellido_intentado && dup.apellido_intentado !== dup.apellido) ||
            (dup.celular_intentado && dup.celular_intentado !== dup.celular) ||
            (dup.direccion_intentado && dup.direccion_intentado !== dup.direccion);

          if (hayDiferencias) {
            await axios.put(`https://backend-node-soft360-production.up.railway.app/votantes/${dup.identificacion}`, {
              nombre: dup.nombre_intentado || dup.nombre,
              apellido: dup.apellido_intentado || dup.apellido,
              celular: dup.celular_intentado || dup.celular,
              direccion: dup.direccion_intentado || dup.direccion
            });
          }
          reasignados++;
        } catch (error) {
          console.error("Error al reasignar votante:", error);
          errorOccurred = true;
        }
      } else {
        mantenidos++;
      }
    }

    if (!errorOccurred) {
      showSnackbar(`${reasignados} reasignado(s), ${mantenidos} mantenido(s) sin cambios`);
    } else {
      showSnackbar("Error al procesar algunos duplicados", "error");
    }
    setModalReasignacionOpen(false);
    fetchVotantes();
  };

  const handleDownloadDuplicados = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Identificacion,Nombre,Apellido,Direccion,Celular,LiderActual\n";
    duplicadosNoReasignables.forEach((dup) => {
      const row = [dup.identificacion, dup.nombre, dup.apellido, dup.direccion, dup.celular, dup.lider_identificacion].join(",");
      csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "duplicados_votantes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={(theme) => ({ minHeight: "100vh", bgcolor: theme.palette.background.subtle, pb: 4 })}>
      <PageHeader
        title="Gestión de Votantes"
        description="Administra y organiza los votantes del sistema electoral"
      />

      <Box>
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

          {selectedVotantes.length > 0 && (
            <Chip
              label={`${selectedVotantes.length} seleccionado(s)`}
              color="primary"
              onDelete={() => setSelectedVotantes([])}
            />
          )}

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormModalOpen(true)}
            sx={(theme) => ({
              background: theme.palette.primary.main,
              borderRadius: 3,
              fontWeight: 600,
            })}
          >
            Nuevo Votante
          </Button>

          <input
            type="file"
            accept=".xls,.xlsx"
            ref={fileInputRef}
            onChange={handleExcelUpload}
            style={{ display: "none" }}
          />
          <Button
            variant="outlined"
            startIcon={uploadLoading ? <CircularProgress size={18} /> : <CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadLoading}
            sx={(theme) => ({
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              borderRadius: 3,
              fontWeight: 600,
            })}
          >
            Cargar Excel
          </Button>

          {selectedVotantes.length > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={() => setBulkDeleteOpen(true)}
              sx={{
                borderRadius: 3,
                fontWeight: 600,
              }}
            >
              Eliminar Seleccionados
            </Button>
          )}

          <IconButton onClick={fetchVotantes} color="primary">
            <Refresh />
          </IconButton>
        </Paper>

        {/* Tabla con paginación - Usando RoundedPaper en lugar de Paper */}
        <RoundedPaper elevation={2}>
          <StyledTableContainer>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: 50 }}>
                    <Checkbox
                      indeterminate={
                        selectedVotantes.length > 0 &&
                        selectedVotantes.length < votantesPaginados.length
                      }
                      checked={
                        votantesPaginados.length > 0 &&
                        selectedVotantes.length >= votantesPaginados.length
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
                  <TableCell sx={{ minWidth: 150 }}>Dirección</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>Líder</TableCell>
                  <TableCell align="center" sx={{ minWidth: 140 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(rowsPerPage)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={10}>
                        <Skeleton variant="rectangular" height={40} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : votantesPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography variant="body1" sx={{ py: 3 }}>
                        No se encontraron votantes
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  votantesPaginados.map((v) => (
                    <TableRow key={v.identificacion} hover selected={isSelected(v)}>
                      <TableCell padding="checkbox" sx={{ width: 50 }}>
                        <Checkbox
                          checked={isSelected(v)}
                          onChange={() => handleSelectVotante(v)}
                        />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{v.identificacion}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{v.nombre}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{v.apellido}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{v.departamento || "-"}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{v.ciudad || "-"}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{v.barrio || "-"}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.direccion || "-"}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {v.lideres_asignados && v.lideres_asignados.length > 0 ? (
                          <Box>
                            <Typography variant="body2">
                              {v.first_lider_nombre && v.first_lider_apellido
                                ? `${v.first_lider_nombre} ${v.first_lider_apellido}`
                                : v.first_lider_identificacion || "-"}
                            </Typography>
                            {v.lideres_asignados.length > 1 && (
                              <Chip
                                label={`+${v.lideres_asignados.length - 1} más`}
                                size="small"
                                color="info"
                                sx={{ height: 18, fontSize: '0.7rem', mt: 0.5 }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Sin líder
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center" sx={(theme) => ({ borderLeft: `0.5px solid ${theme.palette.grey[300]}`, whiteSpace: 'nowrap' })}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            sx={(theme) => ({ color: theme.palette.primary.main })}
                            onClick={() => handleViewVotante(v)}
                            title="Ver detalles"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={(theme) => ({ color: theme.palette.primary.main })}
                            onClick={() => handleEditVotante(v)}
                            title="Editar votante"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={(theme) => ({ color: theme.palette.error.main })}
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
            sx={(theme) => ({
              borderTop: '1px solid rgba(224, 224, 224, 0.5)',
              '& .MuiTablePagination-toolbar': {
                padding: '4px 16px 8px', // Padding reducido: 4px arriba, 16px lados, 8px abajo
                minHeight: '44px',       // Altura mínima reducida
                borderRadius: '0 0 16px 16px',
                backgroundColor: theme.palette.background.paper,
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
            })}
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
          onDelete={handleConfirmDelete}
          loading={loading}
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

      {/* Barra de eliminación masiva */}
      <BulkDeleteBar
        open={bulkDeleteOpen}
        selectedCount={selectedVotantes.length}
        onCancel={() => {
          setBulkDeleteOpen(false);
          setSureDelete(false);
        }}
        onDelete={handleBulkDelete}
        sure={sureDelete}
        setSure={setSureDelete}
        max={50}
      />

      {/* Modal para duplicados reasignables */}
      <Dialog
        open={modalReasignacionOpen}
        onClose={() => setModalReasignacionOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Duplicados con Líder Diferente</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
            {duplicadosReasignables.map((dup) => (
              <Box key={dup.identificacion} sx={{ mb: 2, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Comparativo de Información</Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ flex: 1, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                    <Typography variant="subtitle2">Información Existente</Typography>
                    <Typography><strong>ID:</strong> {dup.identificacion}</Typography>
                    <Typography><strong>Nombre:</strong> {dup.nombre} {dup.apellido}</Typography>
                    <Typography><strong>Dirección:</strong> {dup.direccion}</Typography>
                    <Typography><strong>Celular:</strong> {dup.celular}</Typography>
                    <Typography><strong>Líder Actual:</strong> {dup.lider_identificacion} {dup.lider_nombre ? `- ${dup.lider_nombre}` : ""}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                    <Typography variant="subtitle2">Información Ingresada</Typography>
                    <Typography><strong>ID:</strong> {dup.identificacion_intentado || dup.identificacion}</Typography>
                    <Typography><strong>Nombre:</strong> {dup.nombre_intentado || dup.nombre} {dup.apellido_intentado || dup.apellido}</Typography>
                    <Typography><strong>Dirección:</strong> {dup.direccion_intentado || dup.direccion}</Typography>
                    <Typography><strong>Celular:</strong> {dup.celular_intentado || dup.celular}</Typography>
                    <Typography><strong>Líder Ingresado:</strong> {dup.lider_intentado || dup.lider_identificacion}</Typography>
                  </Box>
                </Box>
                {dup.lider_intentado && dup.lider_intentado !== dup.lider_identificacion && (
                  <Box sx={{ mt: 1 }}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">¿A qué líder deseas asignar este votante?</FormLabel>
                      <RadioGroup
                        value={reassignOptions[dup.identificacion] || "current"}
                        onChange={(e) => handleReassignOptionChange(dup.identificacion, e.target.value)}
                      >
                        <FormControlLabel value="current" control={<Radio />} label={`Mantener líder actual (${dup.lider_identificacion} ${dup.lider_nombre ? "- " + dup.lider_nombre : ""})`} />
                        <FormControlLabel value="new" control={<Radio />} label={`Asignar al nuevo líder (${dup.lider_intentado})`} />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalReasignacionOpen(false)} variant="outlined">Cancelar</Button>
          {duplicadosReasignables.some(
            (dup) => dup.lider_intentado && dup.lider_intentado !== dup.lider_identificacion && reassignOptions[dup.identificacion] === "new"
          ) && (
            <Button onClick={handleConfirmReassign} variant="contained" color="primary">Confirmar Reasignación</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal para duplicados no reasignables */}
      <Dialog
        open={modalNoReasignableOpen}
        onClose={() => setModalNoReasignableOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Duplicados Detectados (Mismo Líder)</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
            {duplicadosNoReasignables.map((dup) => (
              <Box key={dup.identificacion} sx={{ mb: 2, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Comparativo de Información</Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ flex: 1, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                    <Typography variant="subtitle2">Información Existente</Typography>
                    <Typography><strong>ID:</strong> {dup.identificacion}</Typography>
                    <Typography><strong>Nombre:</strong> {dup.nombre} {dup.apellido}</Typography>
                    <Typography><strong>Dirección:</strong> {dup.direccion}</Typography>
                    <Typography><strong>Celular:</strong> {dup.celular}</Typography>
                    <Typography><strong>Líder Actual:</strong> {dup.lider_identificacion} {dup.lider_nombre ? `- ${dup.lider_nombre}` : ""}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                    <Typography variant="subtitle2">Información Ingresada</Typography>
                    <Typography><strong>ID:</strong> {dup.identificacion_intentado || dup.identificacion}</Typography>
                    <Typography><strong>Nombre:</strong> {dup.nombre_intentado || dup.nombre} {dup.apellido_intentado || dup.apellido}</Typography>
                    <Typography><strong>Dirección:</strong> {dup.direccion_intentado || dup.direccion}</Typography>
                    <Typography><strong>Celular:</strong> {dup.celular_intentado || dup.celular}</Typography>
                    <Typography><strong>Líder Ingresado:</strong> {dup.lider_intentado || dup.lider_identificacion}</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalNoReasignableOpen(false)} variant="outlined">Cerrar</Button>
          <Button onClick={handleDownloadDuplicados} variant="contained" color="primary">Descargar CSV</Button>
        </DialogActions>
      </Dialog>

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