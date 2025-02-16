import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import axios from "axios";

const UploadVotantes = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  // Estados para duplicados que vienen del backend. Se espera que cada duplicado incluya:
  // - Los datos existentes: identificacion, nombre, apellido, direccion, celular, lider_identificacion, lider_nombre
  // - Los datos intentados (del Excel): identificacion_intentado, nombre_intentado, apellido_intentado, direccion_intentado, celular_intentado, lider_intentado
  const [duplicados, setDuplicados] = useState([]);
  const [duplicadosReasignables, setDuplicadosReasignables] = useState([]);
  const [duplicadosNoReasignables, setDuplicadosNoReasignables] = useState([]);
  // Modales para duplicados
  const [modalReasignacionOpen, setModalReasignacionOpen] = useState(false);
  const [modalNoReasignableOpen, setModalNoReasignableOpen] = useState(false);
  // Estado para almacenar la opción de reasignación para cada duplicado reasignable
  const [reassignOptions, setReassignOptions] = useState({});

  // Manejo del archivo
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Función para subir el archivo y procesar duplicados
  const handleUpload = async () => {
    if (!file) {
      alert("Por favor, selecciona un archivo");
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append("file", file);
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/votantes/upload_csv",
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      // Se espera que el backend retorne { message, insertados, duplicados }
      if (response.data.duplicados && response.data.duplicados.length > 0) {
        const dups = response.data.duplicados;
        setDuplicados(dups);
        // Separamos duplicados en dos grupos:
        // * Reasignables: aquellos donde el Excel indica un líder (lider_intentado) distinto del actual (lider_identificacion)
        const reasignables = dups.filter(
          (dup) =>
            dup.lider_intentado &&
            dup.lider_intentado !== dup.lider_identificacion
        );
        // * No reasignables: duplicados donde el líder ingresado es igual al actual
        const noReasignables = dups.filter(
          (dup) =>
            !dup.lider_intentado || dup.lider_intentado === dup.lider_identificacion
        );
        setDuplicadosReasignables(reasignables);
        setDuplicadosNoReasignables(noReasignables);
        // Inicializamos la opción de reasignación para cada duplicado reasignable en "current"
        const initialOptions = {};
        reasignables.forEach((dup) => {
          initialOptions[dup.identificacion] = "current";
        });
        setReassignOptions(initialOptions);
        // Abrir el modal correspondiente según si hay duplicados reasignables
        if (reasignables.length > 0) {
          setModalReasignacionOpen(true);
        } else {
          setModalNoReasignableOpen(true);
        }
      } else {
        alert(response.data.message);
      }
      setUploadResult(response.data);
    } catch (error) {
      console.error("Error al cargar el archivo:", error);
      alert("Error al cargar el archivo");
    } finally {
      setLoading(false);
    }
  };

  // Actualiza la opción de reasignación para un duplicado
  const handleReassignOptionChange = (cedula, value) => {
    setReassignOptions((prev) => ({ ...prev, [cedula]: value }));
  };

  // Confirma la reasignación para duplicados reasignables cuya opción sea "new"
  const handleConfirmReassign = async () => {
    let errorOccurred = false;
    for (const dup of duplicadosReasignables) {
      if (reassignOptions[dup.identificacion] === "new") {
        try {
          await axios.put("http://127.0.0.1:5000/votantes/reasignar", {
            votante_identificacion: dup.identificacion,
            old_lider_identificacion: dup.lider_identificacion,
            new_lider_identificacion: dup.lider_intentado,
          });
        } catch (error) {
          console.error("Error al reasignar votante:", error);
          errorOccurred = true;
        }
      }
    }
    if (!errorOccurred) {
      alert("Reasignación completada para los duplicados seleccionados.");
    } else {
      alert("Ocurrió un error al reasignar algunos duplicados.");
    }
    setModalReasignacionOpen(false);
  };

  // Función para descargar duplicados no reasignables como CSV
  const handleDownloadDuplicados = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Identificacion,Nombre,Apellido,Direccion,Celular,LiderActual\n";
    duplicadosNoReasignables.forEach((dup) => {
      const row = [
        dup.identificacion,
        dup.nombre,
        dup.apellido,
        dup.direccion,
        dup.celular,
        dup.lider_identificacion,
      ].join(",");
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
        <Typography variant="h4">Carga Masiva de Votantes</Typography>
      </Box>

      <Box sx={{ maxWidth: 600, mx: "auto", px: { xs: 1, sm: 2 } }}>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            p: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: 1,
          }}
        >
          Este formulario permite cargar múltiples votantes al sistema mediante un
          archivo Excel. Asegúrate de que el archivo tenga el formato correcto antes de
          subirlo.
        </Typography>

        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              Cargar Votantes
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mb: 2 }}
            >
              Suba un archivo Excel (.xls, .xlsx) con la información de los votantes.
            </Typography>
            <Paper
              sx={{
                padding: 2,
                textAlign: "center",
                border: "2px dashed #1976d2",
                borderRadius: 1,
                mb: 3,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 100,
                position: "relative",
              }}
            >
              <input
                type="file"
                accept=".xls, .xlsx"
                onChange={handleFileChange}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                }}
              />
              {!file ? (
                <Typography variant="body2" color="text.secondary">
                  Arrastra un archivo o haz clic para seleccionar
                </Typography>
              ) : (
                <Typography variant="body2" color="text.primary">
                  {file.name}
                </Typography>
              )}
            </Paper>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={loading}
              sx={{ width: "100%" }}
            >
              {loading ? <CircularProgress size={24} /> : "Subir"}
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Modal para duplicados reasignables (cuando el líder ingresado es distinto al existente) */}
      <Dialog
        open={modalReasignacionOpen}
        onClose={() => setModalReasignacionOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Duplicados con Líder Diferente</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
            {duplicadosReasignables.length > 0 ? (
              duplicadosReasignables.map((dup) => (
                <Box
                  key={dup.identificacion}
                  sx={{ mb: 2, p: 1, border: "1px solid #ccc", borderRadius: 1 }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Comparativo de Información
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {/* Información existente (lo que está en la base de datos) */}
                    <Box
                      sx={{
                        flex: 1,
                        p: 1,
                        border: "1px solid #ccc",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">Información Existente</Typography>
                      <Typography>
                        <strong>Identificación:</strong> {dup.identificacion}
                      </Typography>
                      <Typography>
                        <strong>Nombre:</strong> {dup.nombre} {dup.apellido}
                      </Typography>
                      <Typography>
                        <strong>Dirección:</strong> {dup.direccion}
                      </Typography>
                      <Typography>
                        <strong>Celular:</strong> {dup.celular}
                      </Typography>
                      <Typography>
                        <strong>Líder Actual:</strong> {dup.lider_identificacion}{" "}
                        {dup.lider_nombre ? `- ${dup.lider_nombre}` : ""}
                      </Typography>
                    </Box>
                    {/* Información ingresada (lo que viene en el Excel) */}
                    <Box
                      sx={{
                        flex: 1,
                        p: 1,
                        border: "1px solid #ccc",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">Información Ingresada</Typography>
                      <Typography>
                        <strong>Identificación:</strong>{" "}
                        {dup.identificacion_intentado || dup.identificacion}
                      </Typography>
                      <Typography>
                        <strong>Nombre:</strong>{" "}
                        {dup.nombre_intentado || dup.nombre}{" "}
                        {dup.apellido_intentado || dup.apellido}
                      </Typography>
                      <Typography>
                        <strong>Dirección:</strong>{" "}
                        {dup.direccion_intentado || dup.direccion}
                      </Typography>
                      <Typography>
                        <strong>Celular:</strong>{" "}
                        {dup.celular_intentado || dup.celular}
                      </Typography>
                      <Typography>
                        <strong>Líder Intentado:</strong>{" "}
                        {dup.lider_intentado || dup.lider_identificacion}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Mostrar opción de reasignación solo si el líder ingresado (lider_intentado) es diferente */}
                  {dup.lider_intentado &&
                    dup.lider_intentado !== dup.lider_identificacion && (
                      <Box sx={{ mt: 1 }}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">
                            ¿A qué líder deseas asignar este votante?
                          </FormLabel>
                          <RadioGroup
                            value={reassignOptions[dup.identificacion] || "current"}
                            onChange={(e) =>
                              handleReassignOptionChange(dup.identificacion, e.target.value)
                            }
                          >
                            <FormControlLabel
                              value="current"
                              control={<Radio />}
                              label={`Mantener líder actual (${dup.lider_identificacion}${
                                dup.lider_nombre ? " - " + dup.lider_nombre : ""
                              })`}
                            />
                            <FormControlLabel
                              value="new"
                              control={<Radio />}
                              label={`Asignar al nuevo líder (${dup.lider_intentado})`}
                            />
                          </RadioGroup>
                        </FormControl>
                      </Box>
                    )}
                  <Typography sx={{ mt: 2 }}>
                    ¿Deseas editar la información ingresada o confirmar la reasignación?
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body1">
                No se detectaron duplicados para reasignación.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalReasignacionOpen(false)} variant="outlined">
            Cancelar
          </Button>
          {duplicadosReasignables.some(
            (dup) =>
              dup.lider_intentado &&
              dup.lider_intentado !== dup.lider_identificacion &&
              reassignOptions[dup.identificacion] === "new"
          ) && (
            <Button onClick={handleConfirmReassign} variant="contained" color="primary">
              Confirmar Reasignación
            </Button>
          )}
          <Button
            onClick={() => {
              setModalReasignacionOpen(false);
              alert("Por favor, edita la información del duplicado manualmente.");
            }}
            variant="contained"
            color="secondary"
          >
            Editar Información
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para duplicados no reasignables (cuando el líder ingresado es el mismo que el actual) */}
      <Dialog
        open={modalNoReasignableOpen}
        onClose={() => setModalNoReasignableOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Duplicados Detectados (Mismo Líder)</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
            {duplicadosNoReasignables.length > 0 ? (
              duplicadosNoReasignables.map((dup) => (
                <Box
                  key={dup.identificacion}
                  sx={{ mb: 2, p: 1, border: "1px solid #ccc", borderRadius: 1 }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Comparativo de Información
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {/* Información existente */}
                    <Box
                      sx={{
                        flex: 1,
                        p: 1,
                        border: "1px solid #ccc",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">Información Existente</Typography>
                      <Typography>
                        <strong>Identificación:</strong> {dup.identificacion}
                      </Typography>
                      <Typography>
                        <strong>Nombre:</strong> {dup.nombre} {dup.apellido}
                      </Typography>
                      <Typography>
                        <strong>Dirección:</strong> {dup.direccion}
                      </Typography>
                      <Typography>
                        <strong>Celular:</strong> {dup.celular}
                      </Typography>
                      <Typography>
                        <strong>Líder Actual:</strong> {dup.lider_identificacion}{" "}
                        {dup.lider_nombre ? `- ${dup.lider_nombre}` : ""}
                      </Typography>
                    </Box>
                    {/* Información ingresada */}
                    <Box
                      sx={{
                        flex: 1,
                        p: 1,
                        border: "1px solid #ccc",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">Información Ingresada</Typography>
                      <Typography>
                        <strong>Identificación:</strong>{" "}
                        {dup.identificacion_intentado || dup.identificacion}
                      </Typography>
                      <Typography>
                        <strong>Nombre:</strong>{" "}
                        {dup.nombre_intentado || dup.nombre}{" "}
                        {dup.apellido_intentado || dup.apellido}
                      </Typography>
                      <Typography>
                        <strong>Dirección:</strong>{" "}
                        {dup.direccion_intentado || dup.direccion}
                      </Typography>
                      <Typography>
                        <strong>Celular:</strong>{" "}
                        {dup.celular_intentado || dup.celular}
                      </Typography>
                      <Typography>
                        <strong>Líder Ingresado:</strong>{" "}
                        {dup.lider_intentado || dup.lider_identificacion}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ mt: 2 }}>
                    Opciones: Editar la información manualmente o descargar un Excel con estos duplicados.
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body1">No se detectaron duplicados.</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalNoReasignableOpen(false)} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleDownloadDuplicados} variant="contained" color="primary">
            Descargar Excel
          </Button>
          <Button
            onClick={() => {
              setModalNoReasignableOpen(false);
              alert("Por favor, edita la información del duplicado manualmente.");
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

export default UploadVotantes;
