import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Fade,
  Grow,
  Chip,
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PageHeader from "./ui/PageHeader";

// Modales
import CreateGroupModal from "./modals/CreateGroupModal";
import EditGroupModal from "./modals/EditGroupModal";
import ViewGroupModal from "./modals/ViewGroupModal";
import AddRecomendadoModal from "./modals/AddRecomendadoModal";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.2s ease",
  cursor: "pointer",
  borderRadius: theme.spacing(1.5),
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.grey[300]}`,
  "&:hover": {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  borderRadius: theme.spacing(1.5),
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.grey[300]}`,
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}));


const SearchBar = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(1.5),
    backgroundColor: "#fff",
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(0.75),
  fontWeight: 500,
  fontSize: "0.75rem",
}));

const Grupos = () => {
  const [loading, setLoading] = useState(true);
  const [grupos, setGrupos] = useState([]);
  const [totalGrupos, setTotalGrupos] = useState(0);
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openAddRecomendadoDialog, setOpenAddRecomendadoDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [grupoRecomendados, setGrupoRecomendados] = useState([]);
  const [grupoCompleto, setGrupoCompleto] = useState([]); // eslint-disable-line no-unused-vars
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState({ nombre: "", descripcion: "" });
  const [createData, setCreateData] = useState({ nombre: "", descripcion: "" });
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [deletingGrupo, setDeletingGrupo] = useState(null);

  useEffect(() => {
    fetchGrupos();
    fetchTotalGrupos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGrupos = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://backend-node-soft360-production.up.railway.app/grupos");

      // Calcular estadísticas para cada grupo
      const gruposConEstadisticas = await Promise.all(
        response.data.map(async (grupo) => {
          try {
            // Obtener recomendados del grupo
            const recomendadosRes = await axios.get(
              `https://backend-node-soft360-production.up.railway.app/grupos/${grupo.id}/recomendados`
            );

            // Obtener estructura completa para contar líderes y votantes
            const completoRes = await axios.get(
              `https://backend-node-soft360-production.up.railway.app/grupos/${grupo.id}/completo`
            );

            // Contar únicos
            const lideres = new Set();
            const votantes = new Set();

            completoRes.data.forEach(item => {
              if (item.lider_id) lideres.add(item.lider_id);
              if (item.votante_id) votantes.add(item.votante_id);
            });

            return {
              ...grupo,
              totalRecomendados: recomendadosRes.data.length,
              totalLideres: lideres.size,
              totalVotantes: votantes.size,
            };
          } catch (error) {
            console.error(`Error al obtener estadísticas del grupo ${grupo.id}:`, error);
            return {
              ...grupo,
              totalRecomendados: 0,
              totalLideres: 0,
              totalVotantes: 0,
            };
          }
        })
      );

      setGrupos(gruposConEstadisticas);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar grupos:", error);
      setLoading(false);
      showNotification("Error al cargar los grupos", "error");
    }
  };

  const fetchTotalGrupos = async () => {
    try {
      const response = await axios.get("https://backend-node-soft360-production.up.railway.app/grupos/total");
      setTotalGrupos(response.data.total);
    } catch (error) {
      console.error("Error al cargar total de grupos:", error);
    }
  };

  const fetchGrupoRecomendados = async (grupoId) => {
    try {
      const response = await axios.get(
        `https://backend-node-soft360-production.up.railway.app/grupos/${grupoId}/recomendados`
      );
      setGrupoRecomendados(response.data);
    } catch (error) {
      console.error("Error al cargar recomendados del grupo:", error);
      setGrupoRecomendados([]);
    }
  };

  const fetchGrupoCompleto = async (grupoId) => {
    try {
      const response = await axios.get(
        `https://backend-node-soft360-production.up.railway.app/grupos/${grupoId}/completo`
      );
      setGrupoCompleto(response.data);
    } catch (error) {
      console.error("Error al cargar estructura completa del grupo:", error);
      setGrupoCompleto([]);
    }
  };

  const handleEditGrupo = async () => {
    try {
      await axios.put(
        `https://backend-node-soft360-production.up.railway.app/grupos/${selectedGrupo.id}`,
        editData
      );
      showNotification("Grupo actualizado con éxito", "success");
      setOpenEditDialog(false);
      fetchGrupos();
    } catch (error) {
      console.error("Error al actualizar grupo:", error);
      showNotification("Error al actualizar el grupo", "error");
    }
  };

  const handleCreateGrupo = async () => {
    try {
      if (!createData.nombre.trim()) {
        showNotification("El nombre del grupo es requerido", "warning");
        return;
      }

      await axios.post(
        "https://backend-node-soft360-production.up.railway.app/grupos",
        createData
      );
      showNotification("Grupo creado con éxito", "success");
      setOpenDialog(false);
      setCreateData({ nombre: "", descripcion: "" });
      fetchGrupos();
      fetchTotalGrupos();
    } catch (error) {
      console.error("Error al crear grupo:", error);
      showNotification("Error al crear el grupo", "error");
    }
  };

  const handleViewGrupo = async (grupo) => {
    setSelectedGrupo(grupo);
    setOpenViewDialog(true);
    await fetchGrupoRecomendados(grupo.id);
    await fetchGrupoCompleto(grupo.id);
  };

  const handleDeleteGrupo = async () => {
    try {
      await axios.delete(
        `https://backend-node-soft360-production.up.railway.app/grupos/${deletingGrupo.id}`
      );
      showNotification("Grupo eliminado con éxito", "success");
      setOpenDeleteDialog(false);
      setDeletingGrupo(null);
      fetchGrupos();
      fetchTotalGrupos();
    } catch (error) {
      console.error("Error al eliminar grupo:", error);
      showNotification("Error al eliminar el grupo", "error");
    }
  };

  const handleOpenAddRecomendado = () => {
    setOpenAddRecomendadoDialog(true);
  };

  const handleRecomendadoAdded = () => {
    showNotification("Recomendados agregados con éxito", "success");
    if (selectedGrupo) {
      fetchGrupoRecomendados(selectedGrupo.id);
      fetchGrupos(); // Actualizar estadísticas
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const filteredGrupos = grupos.filter(
    (grupo) =>
      grupo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grupo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box>
        <PageHeader
          title="Gestión de Grupos"
          description="Organiza y gestiona los grupos de votantes de manera eficiente"
        />

        {/* Estadísticas */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard elevation={0}>
              <GroupIcon sx={{ fontSize: 28, mb: 0.5, color: "primary.main" }} />
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}>
                {totalGrupos || grupos.length}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>Total de Grupos</Typography>
            </StatCard>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard elevation={0}>
              <PersonIcon sx={{ fontSize: 28, mb: 0.5, color: "primary.main" }} />
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}>
                {grupos.reduce((sum, g) => sum + (g.totalRecomendados || 0), 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>Recomendados</Typography>
            </StatCard>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard elevation={0}>
              <SupervisorAccountIcon sx={{ fontSize: 28, mb: 0.5, color: "primary.main" }} />
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}>
                {grupos.reduce((sum, g) => sum + (g.totalLideres || 0), 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>Líderes</Typography>
            </StatCard>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard elevation={0}>
              <HowToVoteIcon sx={{ fontSize: 28, mb: 0.5, color: "primary.main" }} />
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}>
                {grupos.reduce((sum, g) => sum + (g.totalVotantes || 0), 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>Votantes</Typography>
            </StatCard>
          </Grid>
        </Grid>

        {/* Barra de búsqueda y acciones */}
        <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <SearchBar
            fullWidth
            variant="outlined"
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
            sx={{ flex: 1, minWidth: 300 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={(theme) => ({
              borderRadius: 2,
              px: 3,
              bgcolor: theme.palette.primary.main,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            })}
          >
            Crear Grupo
          </Button>
        </Box>

        {/* Grid de Grupos */}
        <Grid container spacing={3}>
          {filteredGrupos.map((grupo, index) => (
            <Grow in={true} timeout={300 * (index + 1)} key={grupo.id}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <StyledCard elevation={3} onClick={() => handleViewGrupo(grupo)}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                      <Avatar sx={(theme) => ({ bgcolor: theme.palette.primary.main, width: 56, height: 56 })}>
                        <GroupIcon />
                      </Avatar>
                      <StyledChip
                        label={`ID: ${grupo.id}`}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                      {grupo.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {grupo.descripcion}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <StyledChip
                        icon={<PersonIcon />}
                        label={`${grupo.totalRecomendados || 0} Rec.`}
                        size="small"
                        color="secondary"
                      />
                      <StyledChip
                        icon={<SupervisorAccountIcon />}
                        label={`${grupo.totalLideres || 0} Líd.`}
                        size="small"
                        color="info"
                      />
                      <StyledChip
                        icon={<HowToVoteIcon />}
                        label={`${grupo.totalVotantes || 0} Vot.`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "space-around", p: 2 }}>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewGrupo(grupo)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Agregar recomendados">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setSelectedGrupo(grupo);
                          handleOpenAddRecomendado();
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar grupo">
                      <IconButton
                        color="secondary"
                        onClick={() => {
                          setSelectedGrupo(grupo);
                          setEditData({ nombre: grupo.nombre, descripcion: grupo.descripcion });
                          setOpenEditDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar grupo">
                      <IconButton
                        color="error"
                        onClick={() => {
                          setDeletingGrupo(grupo);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </StyledCard>
              </Grid>
            </Grow>
          ))}
        </Grid>

        {/* Modales */}
        <CreateGroupModal
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          createData={createData}
          setCreateData={setCreateData}
          onCreateGroup={handleCreateGrupo}
        />

        <EditGroupModal
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          editData={editData}
          setEditData={setEditData}
          onEditGroup={handleEditGrupo}
        />

        <ViewGroupModal
          open={openViewDialog}
          onClose={() => setOpenViewDialog(false)}
          selectedGrupo={selectedGrupo}
          grupoRecomendados={grupoRecomendados}
          onAddRecomendados={handleOpenAddRecomendado}
        />

        <AddRecomendadoModal
          open={openAddRecomendadoDialog}
          onClose={() => setOpenAddRecomendadoDialog(false)}
          grupo={selectedGrupo}
          onRecomendadoAdded={handleRecomendadoAdded}
        />

        {/* Dialog de confirmación para eliminar */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas eliminar el grupo "{deletingGrupo?.nombre}"?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Los recomendados NO serán eliminados, solo se removerán del grupo.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDeleteDialog(false);
              setDeletingGrupo(null);
            }}>Cancelar</Button>
            <Button variant="contained" color="error" onClick={handleDeleteGrupo}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notificaciones */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default Grupos;