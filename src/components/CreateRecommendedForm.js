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
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import axios from "axios";

const RecommendedManagement = () => {
  const [recomendados, setRecomendados] = useState([]);
  const [filteredRecomendados, setFilteredRecomendados] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el modal de creación/edición
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    identificacion: "",
    nombre: "",
    apellido: "",
    celular: "",
    email: "",
    original_identificacion: "",
  });
  const [loading, setLoading] = useState(false);

  // Estado para el modal de confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [leadersAffected, setLeadersAffected] = useState([]);

  // Obtener la lista de recomendados al cargar el componente
  useEffect(() => {
    fetchRecomendados();
  }, []);

  const fetchRecomendados = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/recomendados");
      setRecomendados(response.data);
      setFilteredRecomendados(response.data);
    } catch (error) {
      console.error("Error al obtener recomendados:", error);
    }
  };

  // Manejar la búsqueda local (por cualquier campo)
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredRecomendados(recomendados);
      return;
    }
    const lowerTerm = term.toLowerCase();
    const filtered = recomendados.filter((rec) =>
      Object.values(rec).some((val) =>
        String(val).toLowerCase().includes(lowerTerm)
      )
    );
    setFilteredRecomendados(filtered);
  };

  // Abrir modal para crear nuevo recomendado
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormData({
      identificacion: "",
      nombre: "",
      apellido: "",
      celular: "",
      email: "",
      original_identificacion: "",
    });
    setModalOpen(true);
  };

  // Abrir modal para editar un recomendado
  const handleOpenEditModal = (recomendado) => {
    setIsEditing(true);
    setFormData({
      ...recomendado,
      original_identificacion: recomendado.identificacion, // Guardamos el valor original
    });
    setModalOpen(true);
  };

  // Cerrar modal de creación/edición
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar el formulario para crear o editar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        // Actualizar recomendado usando el original_identificacion para la verificación
        await axios.put(
          `http://127.0.0.1:5000/recomendados/${formData.original_identificacion}`,
          formData
        );
        alert("Recomendado actualizado con éxito");
      } else {
        // Crear recomendado
        await axios.post("http://127.0.0.1:5000/recomendados", formData);
        alert("Recomendado creado con éxito");
      }
      setModalOpen(false);
      await fetchRecomendados();
    } catch (error) {
      console.error("Error al crear/actualizar recomendado:", error);
      alert(
        error.response?.data?.error ||
          "Error al crear/actualizar recomendado"
      );
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de confirmación para eliminar un recomendado
  const handleOpenDeleteModal = async (recomendado) => {
    setDeleteTarget(recomendado);
    setLeadersAffected([]);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/lideres/por-recomendado?recomendado=${recomendado.identificacion}`
      );
      setLeadersAffected(response.data);
    } catch (error) {
      console.error("Error al obtener líderes asociados:", error);
    }
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  // Eliminar recomendado
  const handleDeleteRecommended = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await axios.delete(
        `http://127.0.0.1:5000/recomendados/${deleteTarget.identificacion}`
      );
      alert("Recomendado eliminado con éxito");
      setDeleteModalOpen(false);
      await fetchRecomendados();
    } catch (error) {
      console.error("Error al eliminar recomendado:", error);
      alert(error.response?.data?.error || "Error al eliminar recomendado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: "100%", mx: "auto", mt: 1, p: 1 }}>
      {/* Encabezado: Título y descripción con estilos */}
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
        <Typography variant="h4" align="center">
          Gestión de Recomendados
        </Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          p: 2,
          borderRadius: 1,
          mb: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="body1">
          Aquí puedes consultar, crear, editar o eliminar los recomendados. Utiliza el
          buscador para filtrar por cualquier campo (nombre, identificación, apellido, etc.).
        </Typography>
      </Box>

      {/* Barra de búsqueda y botón para agregar nuevo */}
      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
        <TextField
          label="Buscar recomendado"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handleOpenCreateModal}
          sx={{
            whiteSpace: "nowrap",
            minWidth: "400px",
            gap: 1,
          }}
          startIcon={<Add />}
        >
          Agregar Nuevo
        </Button>
      </Box>

      {/* Tabla de recomendados */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Identificación</strong></TableCell>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Apellido</strong></TableCell>
              <TableCell><strong>Celular</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecomendados.map((rec) => (
              <TableRow key={rec.identificacion}>
                <TableCell>{rec.identificacion}</TableCell>
                <TableCell>{rec.nombre}</TableCell>
                <TableCell>{rec.apellido}</TableCell>
                <TableCell>{rec.celular}</TableCell>
                <TableCell>{rec.email}</TableCell>
                <TableCell align="center">
                  <IconButton
                    aria-label="editar"
                    onClick={() => handleOpenEditModal(rec)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    aria-label="eliminar"
                    onClick={() => handleOpenDeleteModal(rec)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredRecomendados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body1" align="center">
                    No se encontraron resultados
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para crear/editar recomendado */}
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {isEditing ? "Editar Recomendado" : "Crear Recomendado"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Identificación"
              name="identificacion"
              value={formData.identificacion}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2, mt: 2 }}
            />
            {/* Campo oculto para conservar el valor original */}
            <input
              type="hidden"
              name="original_identificacion"
              value={formData.original_identificacion}
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
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : isEditing ? "Guardar Cambios" : "Crear"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar recomendado */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          {deleteTarget && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ¿Estás seguro de que deseas eliminar el recomendado con identificación{" "}
                <strong>{deleteTarget.identificacion}</strong>? Esta acción no se puede deshacer.
              </Typography>
              {leadersAffected.length > 0 ? (
                <>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Los siguientes líderes están asociados a este recomendado:
                  </Typography>
                  <ul>
                    {leadersAffected.map((lider) => (
                      <li key={lider.lider_identificacion}>
                        {lider.lider_nombre} {lider.lider_apellido} (ID: {lider.lider_identificacion})
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  No se encontraron líderes asociados a este recomendado.
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteRecommended}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecommendedManagement;
