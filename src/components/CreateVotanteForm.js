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
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import axios from "axios";

const CreateVotanteForm = () => {
  const [formData, setFormData] = useState({
    identificacion: "",
    nombre: "",
    apellido: "",
    direccion: "",
    celular: "",
    email: "",
    lider_identificacion: "",
  });
  const [loading, setLoading] = useState(false);
  const [votantes, setVotantes] = useState([]);
  const [liderData, setLiderData] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Estados para edición de votante
  const [votanteEditModalOpen, setVotanteEditModalOpen] = useState(false);
  const [votanteEditData, setVotanteEditData] = useState(null);

  // Estados para eliminación de votante
  const [votanteDeleteModalOpen, setVotanteDeleteModalOpen] = useState(false);
  const [votanteDeleteTarget, setVotanteDeleteTarget] = useState(null);
  const [votanteDeleteLoading, setVotanteDeleteLoading] = useState(false);

  // Estado para manejo de duplicado
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [votanteDuplicadoData, setVotanteDuplicadoData] = useState(null);
  // Estado para la opción de reasignación ("current" o "new")
  const [reassignOption, setReassignOption] = useState("current");

  // Manejar cambios en el formulario principal
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Buscar votantes asociados al líder
  const handleBuscarVotantes = async () => {
    if (!formData.lider_identificacion) {
      alert("Por favor, ingresa la identificación del líder.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `https://backend-node-soft360-production.up.railway.app/votantes/por-lider?lider=${formData.lider_identificacion}`
      );
      if (response.data.lider) {
        setLiderData(response.data.lider);
        setVotantes(response.data.votantes || []);
      } else {
        alert("No se encontró información del líder.");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        alert("No se encontró un líder con esa identificación.");
      } else {
        console.error("Error al buscar votantes:", error);
        alert("Error al buscar votantes.");
      }
      setLiderData(null);
      setVotantes([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear votante manual
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("https://backend-node-soft360-production.up.railway.app/votantes", formData);
      alert("Votante creado con éxito");
      setFormData({
        identificacion: "",
        nombre: "",
        apellido: "",
        direccion: "",
        celular: "",
        email: "",
        lider_identificacion: formData.lider_identificacion,
      });
      handleBuscarVotantes();
    } catch (error) {
      // Si se detecta duplicado, se espera que el backend retorne {duplicado: true, votante: {...}}
      if (
        error.response &&
        error.response.data &&
        error.response.data.duplicado
      ) {
        setVotanteDuplicadoData(error.response.data.votante);
        // Reiniciamos la opción de reasignación a "current" por defecto
        setReassignOption("current");
        setDuplicateModalOpen(true);
      } else {
        console.error("Error al crear votante:", error);
        alert(error.response?.data?.error || "Error al crear votante");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Edición de votante ---
  const handleOpenVotanteEditModal = (votante) => {
    setVotanteEditData({ ...votante, original_identificacion: votante.identificacion });
    setVotanteEditModalOpen(true);
  };

  const handleCloseVotanteEditModal = () => {
    setVotanteEditModalOpen(false);
    setVotanteEditData(null);
  };

  const handleVotanteEditChange = (e) => {
    const { name, value } = e.target;
    setVotanteEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVotanteEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `https://backend-node-soft360-production.up.railway.app/votantes/${votanteEditData.original_identificacion}`,
        votanteEditData
      );
      alert("Votante actualizado con éxito");
      setVotanteEditModalOpen(false);
      setVotanteEditData(null);
      handleBuscarVotantes();
    } catch (error) {
      console.error("Error al actualizar votante:", error);
      alert(error.response?.data?.error || "Error al actualizar votante");
    } finally {
      setLoading(false);
    }
  };

  // --- Eliminación de votante ---
  const handleOpenVotanteDeleteModal = (votante) => {
    setVotanteDeleteTarget(votante);
    setVotanteDeleteModalOpen(true);
  };

  const handleCloseVotanteDeleteModal = () => {
    setVotanteDeleteModalOpen(false);
    setVotanteDeleteTarget(null);
  };

  const handleDeleteVotante = async () => {
    if (!votanteDeleteTarget) return;
    setVotanteDeleteLoading(true);
    try {
      await axios.delete(`https://backend-node-soft360-production.up.railway.app/votantes/${votanteDeleteTarget.identificacion}`);
      alert("Votante eliminado con éxito");
      setVotanteDeleteModalOpen(false);
      setVotanteDeleteTarget(null);
      handleBuscarVotantes();
    } catch (error) {
      console.error("Error al eliminar votante:", error);
      alert(error.response?.data?.error || "Error al eliminar votante");
    } finally {
      setVotanteDeleteLoading(false);
    }
  };

  // --- Modal de duplicado ---
  // Se muestra la información existente versus la ingresada.
  const handleCerrarDuplicado = () => {
    setDuplicateModalOpen(false);
  };

  // Función para manejar la reasignación
  const handleReassign = async () => {
    if (!votanteDuplicadoData) return;
    // Solo se permite reasignar si el duplicado tiene un líder distinto
    if (votanteDuplicadoData.lider_identificacion !== formData.lider_identificacion) {
      try {
        await axios.put("https://backend-node-soft360-production.up.railway.app/votantes/reasignar", {
          votante_identificacion: votanteDuplicadoData.identificacion,
          old_lider_identificacion: votanteDuplicadoData.lider_identificacion,
          new_lider_identificacion: formData.lider_identificacion,
        });
        alert("Votante reasignado al nuevo líder con éxito");
        handleCerrarDuplicado();
        handleBuscarVotantes();
      } catch (error) {
        console.error("Error al reasignar votante:", error);
        alert(error.response?.data?.error || "Error al reasignar votante");
      }
    } else {
      alert("El votante ya está asignado al mismo líder.");
      handleCerrarDuplicado();
      setShowCreateForm(true);
    }
  };

  return (
    <Box sx={{ maxWidth: "100%", mx: "auto", mt: 1, p: 1 }}>
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
        <Typography variant="h4">Formulario de Registro de Votante</Typography>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1, sm: 2 } }}>
        {/* Párrafo informativo */}
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            p: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: 1,
          }}
        >
          Este formulario permite registrar un nuevo votante en el sistema. Para completar el registro, debes asignar el votante a un líder existente. Asegúrate de tener toda la información necesaria antes de proceder.
        </Typography>

        {/* Campo para ingresar líder */}
        <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
          <TextField
            label="Identificación del Líder"
            name="lider_identificacion"
            value={formData.lider_identificacion}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleBuscarVotantes}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : "Buscar Votantes"}
          </Button>
        </Box>

        {/* Mostrar información del líder */}
        {liderData && (
          <Typography variant="h6" gutterBottom>
            Líder: {`${liderData.nombre} ${liderData.apellido} (Cédula: ${liderData.identificacion})`}
          </Typography>
        )}

        {/* Botón para mostrar/ocultar el formulario de creación de votante */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Button variant="contained" onClick={() => setShowCreateForm((prev) => !prev)}>
            {showCreateForm ? "Ocultar Formulario" : "Agregar Votante"}
          </Button>
        </Box>

        {/* Formulario para crear votante */}
        {showCreateForm && (
          <Box sx={{ maxWidth: 1200, mx: "auto", mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Crear Votante
            </Typography>
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
                label="Dirección"
                name="direccion"
                value={formData.direccion}
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
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ width: "100%" }}>
                {loading ? <CircularProgress size={24} /> : "Crear"}
              </Button>
            </form>
          </Box>
        )}

        {/* Lista de votantes asociados */}
        {liderData && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cantidad de votantes: {votantes.length}
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Identificación</strong></TableCell>
                    <TableCell><strong>Nombre</strong></TableCell>
                    <TableCell><strong>Apellido</strong></TableCell>
                    <TableCell><strong>Dirección</strong></TableCell>
                    <TableCell><strong>Celular</strong></TableCell>
                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {votantes.length > 0 ? (
                    votantes.map((votante) => (
                      <TableRow key={votante.votante_identificacion}>
                        <TableCell>{votante.identificacion}</TableCell>
                        <TableCell>{votante.nombre}</TableCell>
                        <TableCell>{votante.apellido}</TableCell>
                        <TableCell>{votante.direccion}</TableCell>
                        <TableCell>{votante.celular}</TableCell>
                        <TableCell align="center">
                          <Button size="small" onClick={() => handleOpenVotanteEditModal(votante)}>
                            Editar
                          </Button>
                          <Button size="small" color="error" onClick={() => handleOpenVotanteDeleteModal(votante)}>
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay votantes asignados a este líder.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* Modal: Edición de votante */}
      <Dialog open={votanteEditModalOpen} onClose={handleCloseVotanteEditModal} fullWidth maxWidth="sm">
        <DialogTitle>Editar Votante</DialogTitle>
        <DialogContent>
          {votanteEditData && (
            <Box component="form" onSubmit={handleVotanteEditSubmit}>
              <input type="hidden" name="original_identificacion" value={votanteEditData.original_identificacion} />
              <TextField
                label="Identificación"
                name="identificacion"
                value={votanteEditData.identificacion}
                onChange={handleVotanteEditChange}
                fullWidth
                required
                sx={{ mb: 2, mt: 2 }}
              />
              <TextField
                label="Nombre"
                name="nombre"
                value={votanteEditData.nombre}
                onChange={handleVotanteEditChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Apellido"
                name="apellido"
                value={votanteEditData.apellido}
                onChange={handleVotanteEditChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Dirección"
                name="direccion"
                value={votanteEditData.direccion}
                onChange={handleVotanteEditChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Celular"
                name="celular"
                value={votanteEditData.celular}
                onChange={handleVotanteEditChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={votanteEditData.email}
                onChange={handleVotanteEditChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Líder (ID)"
                name="lider_identificacion"
                value={votanteEditData.lider_identificacion}
                onChange={handleVotanteEditChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
                {loading ? <CircularProgress size={24} /> : "Guardar Cambios"}
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmación de eliminación de votante */}
      <Dialog open={votanteDeleteModalOpen} onClose={handleCloseVotanteDeleteModal} fullWidth maxWidth="sm">
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          {votanteDeleteTarget && (
            <Typography variant="body1">
              ¿Estás seguro de que deseas eliminar el votante con identificación{" "}
              <strong>{votanteDeleteTarget.identificacion}</strong>? Esta acción no se puede deshacer.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVotanteDeleteModal} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleDeleteVotante} variant="contained" color="error" disabled={votanteDeleteLoading}>
            {votanteDeleteLoading ? <CircularProgress size={24} /> : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Duplicado de votante */}
      <Dialog open={duplicateModalOpen} onClose={handleCerrarDuplicado} fullWidth maxWidth="sm">
        <DialogTitle>Votante Duplicado</DialogTitle>
        <DialogContent>
          {votanteDuplicadoData && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                La identificación ingresada ya existe en el sistema.
              </Typography>
              <Box sx={{ mb: 2, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                <Typography variant="subtitle1">Información Existente</Typography>
                <Typography>
                  <strong>Identificación:</strong> {votanteDuplicadoData.identificacion}
                </Typography>
                <Typography>
                  <strong>Nombre:</strong> {votanteDuplicadoData.nombre} {votanteDuplicadoData.apellido}
                </Typography>
                <Typography>
                  <strong>Dirección:</strong> {votanteDuplicadoData.direccion}
                </Typography>
                <Typography>
                  <strong>Celular:</strong> {votanteDuplicadoData.celular}
                </Typography>
                <Typography>
                  <strong>Líder Actual:</strong> {votanteDuplicadoData.lider_identificacion}{" "}
                  {votanteDuplicadoData.lider_nombre ? `- ${votanteDuplicadoData.lider_nombre}` : ""}
                </Typography>
              </Box>
              <Box sx={{ mb: 2, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                <Typography variant="subtitle1">Información Ingresada</Typography>
                <Typography>
                  <strong>Identificación:</strong> {formData.identificacion}
                </Typography>
                <Typography>
                  <strong>Nombre:</strong> {formData.nombre} {formData.apellido}
                </Typography>
                <Typography>
                  <strong>Dirección:</strong> {formData.direccion}
                </Typography>
                <Typography>
                  <strong>Celular:</strong> {formData.celular}
                </Typography>
                <Typography>
                  <strong>Líder Intentado:</strong> {formData.lider_identificacion}
                </Typography>
              </Box>
              {votanteDuplicadoData.lider_identificacion !== formData.lider_identificacion && (
                <>
                  <Typography sx={{ mb: 2, color: "red" }}>
                    Nota: Este votante está asignado a otro líder.
                  </Typography>
                  <FormControl component="fieldset" sx={{ mt: 2 }}>
                    <FormLabel component="legend">
                      ¿A qué líder deseas asignar este votante?
                    </FormLabel>
                    <RadioGroup
                      value={reassignOption}
                      onChange={(e) => setReassignOption(e.target.value)}
                    >
                      <FormControlLabel
                        value="current"
                        control={<Radio />}
                        label={`Mantener líder actual (${votanteDuplicadoData.lider_identificacion}${
                          votanteDuplicadoData.lider_nombre ? " - " + votanteDuplicadoData.lider_nombre : ""
                        })`}
                      />
                      <FormControlLabel
                        value="new"
                        control={<Radio />}
                        label={`Asignar al nuevo líder (${formData.lider_identificacion})`}
                      />
                    </RadioGroup>
                  </FormControl>
                </>
              )}
              <Typography sx={{ mt: 2 }}>
                ¿Deseas editar la información ingresada o reasignar el votante?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrarDuplicado} variant="outlined">
            Cancelar
          </Button>
          {votanteDuplicadoData &&
            votanteDuplicadoData.lider_identificacion !== formData.lider_identificacion && (
              <Button
                onClick={handleReassign}
                variant="contained"
                color="primary"
              >
                Confirmar Reasignación
              </Button>
            )}
          <Button
            onClick={() => {
              handleCerrarDuplicado();
              setShowCreateForm(true);
            }}
            variant="contained"
            color="secondary"
          >
            Editar Información
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateVotanteForm;
