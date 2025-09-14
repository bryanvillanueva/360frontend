import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import axios from "axios";


const CreateLeaderForm = () => {
  const [formData, setFormData] = useState({
    identificacion: "",
    nombre: "",
    apellido: "",
    celular: "",
    email: "",
    recomendado_identificacion: "", // Este campo ya no es requerido
    objetivo: "", // nuevo campo (opcional)
  });
  const [loading, setLoading] = useState(false);
  const [recomendadoData, setRecomendadoData] = useState(null);

  // Estados para controlar modales de recomendado
  const [recommendedNotFoundModalOpen, setRecommendedNotFoundModalOpen] = useState(false);
  const [leaderWithoutRecommendedModalOpen, setLeaderWithoutRecommendedModalOpen] = useState(false);
  const [createRecommendedModalOpen, setCreateRecommendedModalOpen] = useState(false);

  // Estados para el formulario de recomendado (usado en ambos modales)
  const [recommendedFormData, setRecommendedFormData] = useState({
    identificacion: "",
    nombre: "",
    apellido: "",
    celular: "",
    email: "",
  });
  const [recommendedLoading, setRecommendedLoading] = useState(false);

  // Estados para la lista de líderes y modales de edición/eliminación
  const [leaders, setLeaders] = useState([]);
  const [leaderEditModalOpen, setLeaderEditModalOpen] = useState(false);
  const [leaderEditData, setLeaderEditData] = useState(null);
  const [leaderDeleteModalOpen, setLeaderDeleteModalOpen] = useState(false);
  const [leaderDeleteTarget, setLeaderDeleteTarget] = useState(null);
  const [leaderDeleteLoading, setLeaderDeleteLoading] = useState(false);
  const [votersAffected, setVotersAffected] = useState([]);

  // Estado para mostrar/ocultar el formulario de creación de líder
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Obtener la lista de líderes
  const fetchLeaders = async () => {
    try {
      const response = await axios.get("https://backend-node-soft360-production.up.railway.app/lideres");
      setLeaders(response.data);
    } catch (error) {
      console.error("Error al obtener líderes:", error);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  // Manejar cambios en el formulario de líder
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en el formulario de recomendado
  const handleRecommendedFormChange = (e) => {
    const { name, value } = e.target;
    setRecommendedFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Buscar datos del recomendado
  const handleBuscarRecomendado = async () => {
    if (!formData.recomendado_identificacion) {
      // Si se deja vacío, no se hace la búsqueda y se deja el modal para elegir opciones
      setLeaderWithoutRecommendedModalOpen(true);
      return;
    }
    setLoading(true);
    setRecomendadoData(null);
    try {
      const response = await axios.get(
        `https://backend-node-soft360-production.up.railway.app/recomendados/${formData.recomendado_identificacion}`
      );
      setRecomendadoData(response.data);
    } catch (error) {
      console.error("Error al buscar recomendado:", error);
      // Si no se encuentra, se abre el modal para crear recomendado.
      setRecommendedNotFoundModalOpen(true);
      setRecommendedFormData((prev) => ({
        ...prev,
        identificacion: formData.recomendado_identificacion,
      }));
    } finally {
      setLoading(false);
    }
  };

  // Enviar el formulario de creación de recomendado (modal)
  const handleCreateRecommended = async (e) => {
    e.preventDefault();
    setRecommendedLoading(true);
    try {
      const response = await axios.post("https://backend-node-soft360-production.up.railway.app/recomendados", recommendedFormData);
      alert("Recomendado creado con éxito");
      setRecomendadoData(response.data);
      setRecommendedNotFoundModalOpen(false);
      setCreateRecommendedModalOpen(false);
    } catch (error) {
      console.error("Error al crear recomendado:", error);
      alert(error.response?.data?.error || "Error al crear recomendado");
    } finally {
      setRecommendedLoading(false);
    }
  };

  // Manejar el envío del formulario de líder
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Si no hay recomendadoData y el campo recomendado_identificacion está vacío,
    // se abre el modal para elegir opción de autorecomendado o crear uno
    if (!recomendadoData && !formData.recomendado_identificacion) {
      setLeaderWithoutRecommendedModalOpen(true);
      return;
    }
    setLoading(true);
    try {
      await axios.post("https://backend-node-soft360-production.up.railway.app/lideres", formData);
      alert("Líder creado con éxito");
      setFormData({
        identificacion: "",
        nombre: "",
        apellido: "",
        celular: "",
        email: "",
        recomendado_identificacion: "",
        objetivo: "",
      });
      setRecomendadoData(null);
      fetchLeaders();
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error al crear líder:", error);
      alert(error.response?.data?.error || "Error al crear líder");
    } finally {
      setLoading(false);
    }
  };

  // Opción: Crear líder como autorecomendado (inserta primero en recomendados, luego en líderes)
  const handleCrearAutoRecomendado = async () => {
    setLeaderWithoutRecommendedModalOpen(false);
    setLoading(true);
    try {
      await axios.post("https://backend-node-soft360-production.up.railway.app/recomendados", {
        identificacion: formData.identificacion,
        nombre: formData.nombre,
        apellido: formData.apellido,
        celular: formData.celular,
        email: formData.email,
      });
      const leaderData = { ...formData, recomendado_identificacion: formData.identificacion };
      await axios.post("https://backend-node-soft360-production.up.railway.app/lideres", leaderData);
      alert("Líder y Autorecomendado creados con éxito");
      setFormData({
        identificacion: "",
        nombre: "",
        apellido: "",
        celular: "",
        email: "",
        recomendado_identificacion: "",
        objetivo: "",
      });
      setRecomendadoData(null);
      fetchLeaders();
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error al crear líder y autorecomendado:", error);
      alert(error.response?.data?.error || "Error al crear líder y autorecomendado");
    } finally {
      setLoading(false);
    }
  };

  // Opción: Cancelar y proceder a crear recomendado (abre modal)
  const handleCancelarYCrearRecomendado = () => {
    setLeaderWithoutRecommendedModalOpen(false);
    setCreateRecommendedModalOpen(true);
    setRecommendedFormData({
      identificacion: formData.recomendado_identificacion || formData.identificacion,
      nombre: "",
      apellido: "",
      celular: "",
      email: "",
    });
  };

  // --- Manejo de edición de líder ---
  const handleOpenLeaderEditModal = (leader) => {
    // Guardamos el id original en 'original_identificacion'
    setLeaderEditData({
      original_identificacion: leader.lider_identificacion,
      identificacion: leader.lider_identificacion,
      nombre: leader.lider_nombre,
      apellido: leader.lider_apellido,
      celular: leader.lider_celular,
      email: leader.lider_email,
      recomendado_identificacion: leader.recomendado_identificacion || "",
      objetivo: leader.lider_objetivo || "", // asignar valor del objetivo
    });
    setLeaderEditModalOpen(true);
  };

  const handleCloseLeaderEditModal = () => {
    setLeaderEditModalOpen(false);
    setLeaderEditData(null);
  };

  const handleLeaderEditChange = (e) => {
    const { name, value } = e.target;
    setLeaderEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeaderEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Utilizamos el id original para la actualización en la URL
      await axios.put(
        `https://backend-node-soft360-production.up.railway.app/lideres/${leaderEditData.original_identificacion}`,
        leaderEditData
      );
      alert("Líder actualizado con éxito");
      setLeaderEditModalOpen(false);
      setLeaderEditData(null);
      fetchLeaders();
    } catch (error) {
      console.error("Error al actualizar líder:", error);
      alert(error.response?.data?.error || "Error al actualizar líder");
    } finally {
      setLoading(false);
    }
  };

  // --- Manejo de eliminación de líder ---
  const handleOpenLeaderDeleteModal = async (leader) => {
    setLeaderDeleteTarget(leader);
    try {
      // Obtener votantes asociados al líder
      const response = await axios.get(
        `https://backend-node-soft360-production.up.railway.app/votantes/por-lider-detalle?lider=${leader.lider_identificacion}`
      );
      setVotersAffected(response.data.votantes || []);
    } catch (error) {
      console.error("Error al obtener votantes asociados:", error);
      setVotersAffected([]);
    }
    setLeaderDeleteModalOpen(true);
  };

  const handleCloseLeaderDeleteModal = () => {
    setLeaderDeleteModalOpen(false);
    setLeaderDeleteTarget(null);
    setVotersAffected([]);
  };

  const handleDeleteLeader = async () => {
    if (!leaderDeleteTarget) return;
    setLeaderDeleteLoading(true);
    try {
      await axios.delete(`https://backend-node-soft360-production.up.railway.app/lideres/${leaderDeleteTarget.lider_identificacion}`);
      alert("Líder eliminado con éxito");
      setLeaderDeleteModalOpen(false);
      setLeaderDeleteTarget(null);
      fetchLeaders();
    } catch (error) {
      console.error("Error al eliminar líder:", error);
      alert(error.response?.data?.error || "Error al eliminar líder");
    } finally {
      setLeaderDeleteLoading(false);
    }
  };

  return (
    <Box>
      {/* Barra superior */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#10a1e3",
          color: "white",
          p: 2,
          mb: 3,
          boxShadow: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h4">Formulario de Registro de Líder</Typography>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1, sm: 2 } }}>
        {/* Párrafo informativo */}
        <Typography variant="body1" sx={{ mb: 4, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
          Este formulario permite registrar un nuevo líder en el sistema. Para completar el registro, 
          primero debes buscar o crear un recomendado asociado al líder. Si el líder no tiene un 
          recomendado, puedes registrarlo como autorecomendado o crear un nuevo recomendado para él.
        </Typography>

        {/* Sección de búsqueda de recomendado */}
        <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
          <TextField
            label="Identificación del Recomendado"
            name="recomendado_identificacion"
            value={formData.recomendado_identificacion}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleBuscarRecomendado} disabled={loading} fullWidth>
            {loading ? <CircularProgress size={24} /> : "Buscar Recomendado"}
          </Button>
        </Box>

        {/* Mostrar información del recomendado */}
        {recomendadoData && (
          <Box sx={{ mb: 3, p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Recomendado Encontrado
            </Typography>
            <Typography>
              Nombre: {`${recomendadoData.nombre} ${recomendadoData.apellido}`}
            </Typography>
            <Typography>Identificación: {recomendadoData.identificacion}</Typography>
          </Box>
        )}

        {/* Botón para mostrar/ocultar el formulario de creación de líder */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setShowCreateForm((prev) => !prev)}>
            {showCreateForm ? "Ocultar Formulario" : "Crear Líder"}
          </Button>
        </Box>

        {/* Formulario para crear líder (oculto por defecto) */}
        {showCreateForm && (
          <Box sx={{ maxWidth: 1200, mx: "auto", mt: 3 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Identificación"
                name="identificacion"
                value={formData.identificacion}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Celular"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              {/* Campo de Recomendado no es requerido */}
              <TextField
                label="Identificación del Recomendado (opcional)"
                name="recomendado_identificacion"
                value={formData.recomendado_identificacion}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Objetivo de Votantes (opcional)"
                name="objetivo"
                value={formData.objetivo}
                onChange={handleChange}
                fullWidth
                type="number"
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
                {loading ? <CircularProgress size={24} /> : "Crear Líder"}
              </Button>
            </form>
          </Box>
        )}

        {/* Tabla de líderes */}
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5 }}>
          <Typography variant="h5" gutterBottom>
            Lista de Líderes
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Identificación</strong></TableCell>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Apellido</strong></TableCell>
                  <TableCell><strong>Celular</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Recomendado</strong></TableCell>
                  <TableCell><strong>Objetivo</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaders.map((leader) => (
                  <TableRow key={leader.lider_identificacion}>
                    <TableCell>{leader.lider_identificacion}</TableCell>
                    <TableCell>{leader.lider_nombre}</TableCell>
                    <TableCell>{leader.lider_apellido}</TableCell>
                    <TableCell>{leader.lider_celular}</TableCell>
                    <TableCell>{leader.lider_email}</TableCell>
                    <TableCell>{leader.recomendado_identificacion || "N/A"}</TableCell>
                    <TableCell>{leader.lider_objetivo || "N/A"}</TableCell>
                    <TableCell align="center">
                      <IconButton aria-label="editar" onClick={() => handleOpenLeaderEditModal(leader)}>
                        <Edit />
                      </IconButton>
                      <IconButton aria-label="eliminar" onClick={() => handleOpenLeaderDeleteModal(leader)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {leaders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography variant="body1" align="center">
                        No se encontraron líderes.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Modal: Recomendado no encontrado */}
        <Dialog
          open={recommendedNotFoundModalOpen}
          onClose={() => {
            setRecommendedNotFoundModalOpen(false);
            setRecomendadoData(null);
          }}
        >
          <DialogTitle>Recomendado no encontrado</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              El recomendado no existe en el sistema. Por favor, crea un recomendado.
            </Typography>
            <form onSubmit={handleCreateRecommended}>
              <TextField
                label="Identificación"
                name="identificacion"
                value={recommendedFormData.identificacion}
                onChange={handleRecommendedFormChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Nombre"
                name="nombre"
                value={recommendedFormData.nombre}
                onChange={handleRecommendedFormChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Apellido"
                name="apellido"
                value={recommendedFormData.apellido}
                onChange={handleRecommendedFormChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Celular"
                name="celular"
                value={recommendedFormData.celular}
                onChange={handleRecommendedFormChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={recommendedFormData.email}
                onChange={handleRecommendedFormChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" disabled={recommendedLoading} fullWidth>
                {recommendedLoading ? <CircularProgress size={24} /> : "Crear Recomendado"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: Líder sin Recomendado */}
        <Dialog open={leaderWithoutRecommendedModalOpen} onClose={() => setLeaderWithoutRecommendedModalOpen(false)}>
          <DialogTitle>Líder sin Recomendado</DialogTitle>
          <DialogContent>
            <Typography>
              Estás intentando crear un líder sin un recomendado asociado. ¿Qué deseas hacer?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCrearAutoRecomendado}
              sx={{
                backgroundColor: "#1976d2",
                color: "#fff",
                textTransform: "uppercase",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
            >
              CREAR AUTORECOMENDADO
            </Button>
            <Button
              onClick={handleCancelarYCrearRecomendado}
              sx={{
                backgroundColor: "#e57373",
                color: "#fff",
                textTransform: "uppercase",
                "&:hover": { backgroundColor: "#ef5350" },
              }}
            >
              CANCELAR Y CREAR RECOMENDADO
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal: Formulario para crear recomendado (opción "Cancelar y Crear Recomendado") */}
        <Dialog open={createRecommendedModalOpen} onClose={() => setCreateRecommendedModalOpen(false)}>
          <DialogTitle>Crear Recomendado</DialogTitle>
          <DialogContent>
            <form onSubmit={handleCreateRecommended}>
              <TextField
                label="Identificación"
                name="identificacion"
                value={recommendedFormData.identificacion}
                onChange={handleRecommendedFormChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Nombre"
                name="nombre"
                value={recommendedFormData.nombre}
                onChange={handleRecommendedFormChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Apellido"
                name="apellido"
                value={recommendedFormData.apellido}
                onChange={handleRecommendedFormChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Celular"
                name="celular"
                value={recommendedFormData.celular}
                onChange={handleRecommendedFormChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={recommendedFormData.email}
                onChange={handleRecommendedFormChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" disabled={recommendedLoading} fullWidth>
                {recommendedLoading ? <CircularProgress size={24} /> : "Crear Recomendado"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: Edición de líder */}
        <Dialog open={leaderEditModalOpen} onClose={handleCloseLeaderEditModal} fullWidth maxWidth="sm">
          <DialogTitle>Editar Líder</DialogTitle>
          <DialogContent>
            {leaderEditData && (
              <Box component="form" onSubmit={handleLeaderEditSubmit}>
                <input
                  type="hidden"
                  name="original_identificacion"
                  value={leaderEditData.original_identificacion}
                />
                <TextField
                  label="Identificación"
                  name="identificacion"
                  value={leaderEditData.identificacion}
                  onChange={handleLeaderEditChange}
                  fullWidth
                  required
                  sx={{ mb: 2, mt: 2 }}
                />
                <TextField
                  label="Nombre"
                  name="nombre"
                  value={leaderEditData.nombre}
                  onChange={handleLeaderEditChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Apellido"
                  name="apellido"
                  value={leaderEditData.apellido}
                  onChange={handleLeaderEditChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Celular"
                  name="celular"
                  value={leaderEditData.celular}
                  onChange={handleLeaderEditChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  value={leaderEditData.email}
                  onChange={handleLeaderEditChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Identificación del Recomendado"
                  name="recomendado_identificacion"
                  value={leaderEditData.recomendado_identificacion}
                  onChange={handleLeaderEditChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Objetivo de Votantes (opcional)"
                  name="objetivo"
                  value={leaderEditData.objetivo}
                  onChange={handleLeaderEditChange}
                  fullWidth
                  type="number"
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth sx={{ mb: 2 }}>
                  {loading ? <CircularProgress size={24} /> : "Guardar Cambios"}
                </Button>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal: Confirmación de eliminación de líder */}
        <Dialog open={leaderDeleteModalOpen} onClose={handleCloseLeaderDeleteModal} fullWidth maxWidth="sm">
          <DialogTitle>Confirmar Eliminación de Líder</DialogTitle>
          <DialogContent>
            {leaderDeleteTarget && (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  ¿Estás seguro de que deseas eliminar el líder con identificación{" "}
                  <strong>{leaderDeleteTarget.lider_identificacion}</strong>? Esta acción no se puede deshacer.
                </Typography>
                {votersAffected.length > 0 && (
                  <>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Los siguientes votantes están asociados a este líder:
                    </Typography>
                    <ul>
                      {votersAffected.map((votante) => (
                        <li key={votante.votante_identificacion}>
                          {votante.votante_nombre} {votante.votante_apellido} (ID: {votante.votante_identificacion})
                        </li>
                      ))}
                    </ul>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Deberás actualizar estos votantes después de eliminar.
                    </Typography>
                  </>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLeaderDeleteModal} variant="outlined">
              Cancelar
            </Button>
            <Button onClick={handleDeleteLeader} variant="contained" color="error" disabled={leaderDeleteLoading}>
              {leaderDeleteLoading ? <CircularProgress size={24} /> : "Eliminar"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default CreateLeaderForm;
