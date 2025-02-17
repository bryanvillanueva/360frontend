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
  // Estados para duplicados (se espera que el backend devuelva, para cada duplicado, los campos:
  // duplicado: identificacion, nombre, apellido, direccion, celular, lider_identificacion, lider_nombre,
  // y los campos "intentado": identificacion_intentado, nombre_intentado, apellido_intentado, direccion_intentado, celular_intentado, lider_intentado)
  const [duplicados, setDuplicados] = useState([]);
  const [duplicadosReasignables, setDuplicadosReasignables] = useState([]);
  const [duplicadosNoReasignables, setDuplicadosNoReasignables] = useState([]);
  const [modalReasignacionOpen, setModalReasignacionOpen] = useState(false);
  const [modalNoReasignableOpen, setModalNoReasignableOpen] = useState(false);
  // Para cada duplicado reasignable se almacena la opción seleccionada ("current" o "new")
  const [reassignOptions, setReassignOptions] = useState({});

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Por favor selecciona un archivo");
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
      // Se espera que el backend retorne un objeto con: message, insertados y duplicados (arreglo)
      if (response.data.duplicados && response.data.duplicados.length > 0) {
        const dups = response.data.duplicados;
        setDuplicados(dups);
        // Separamos los duplicados:
        // Reasignables: donde el campo lider_intentado está definido y es distinto al actual
        const reasignables = dups.filter(
          (dup) =>
            dup.lider_intentado &&
            dup.lider_intentado !== dup.lider_identificacion
        );
        // No reasignables: donde el líder ingresado es igual al existente o no se envió lider_intentado
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
        // Abrir el modal de reasignación si hay duplicados reasignables; si no, se abre el modal de no reasignables
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

  const handleReassignOptionChange = (cedula, value) => {
    setReassignOptions((prev) => ({ ...prev, [cedula]: value }));
  };

  const handleConfirmReassign = async () => {
    let errorOccurred = false;
    for (const dup of duplicadosReasignables) {
      if (reassignOptions[dup.identificacion] === "new") {
        // Se reasigna: se actualiza el registro del votante con la información ingresada (intentada)
        try {
          await axios.put("http://127.0.0.1:5000/votantes/reasignar", {
            votante_identificacion: dup.identificacion,
            old_lider_identificacion: dup.lider_identificacion,
            new_lider_identificacion: dup.lider_intentado,
            // Se actualizan los campos con la información ingresada en el Excel
            nombre_intentado: dup.nombre_intentado || dup.nombre,
            apellido_intentado: dup.apellido_intentado || dup.apellido,
            direccion_intentado: dup.direccion_intentado || dup.direccion,
            celular_intentado: dup.celular_intentado || dup.celular,
            lider_intentado: dup.lider_intentado,
          });
        } catch (error) {
          console.error("Error al reasignar votante:", error);
          errorOccurred = true;
        }
      } else {
        // Opción "current": se mantiene el líder actual sin actualizar la información,
        // pero se crea un log en el perfil del líder (del duplicado ingresado) informando que se mantuvo
        try {
          await axios.put("http://127.0.0.1:5000/votantes/reasignar", {
            votante_identificacion: dup.identificacion,
            old_lider_identificacion: dup.lider_identificacion,
            new_lider_identificacion: dup.lider_identificacion,
            // Se envía el campo lider_intentado para que el backend pueda generar el log en el perfil del otro líder, si corresponde.
            lider_intentado: dup.lider_intentado,
          });
        } catch (error) {
          console.error("Error al loggear duplicado sin cambio:", error);
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
                    {/* Información Existente */}
                    <Box
                      sx={{
                        flex: 1,
                        p: 1,
                        border: "1px solid #ccc",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">
                        Información Existente
                      </Typography>
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
                    {/* Información Ingresada */}
                    <Box
                      sx={{
                        flex: 1,
                        p: 1,
                        border: "1px solid #ccc",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">
                        Información Ingresada
                      </Typography>
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
                  {/* Mostrar opción de reasignación solo si el duplicado tiene un líder ingresado distinto */}
                  {dup.lider_intentado && dup.lider_intentado !== dup.lider_identificacion && (
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
                            label={`Mantener líder actual (${dup.lider_identificacion} ${
                              dup.lider_nombre ? "- " + dup.lider_nombre : ""
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
                    Opciones: editar la información manualmente o confirmar la
                    reasignación.
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
                    <Box sx={{ flex: 1, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                      <Typography variant="subtitle2">
                        Información Existente
                      </Typography>
                      <Typography><strong>Identificación:</strong> {dup.identificacion}</Typography>
                      <Typography>
                        <strong>Nombre:</strong> {dup.nombre} {dup.apellido}
                      </Typography>
                      <Typography><strong>Dirección:</strong> {dup.direccion}</Typography>
                      <Typography><strong>Celular:</strong> {dup.celular}</Typography>
                      <Typography>
                        <strong>Líder Actual:</strong> {dup.lider_identificacion}{" "}
                        {dup.lider_nombre ? `- ${dup.lider_nombre}` : ""}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                      <Typography variant="subtitle2">
                        Información Ingresada
                      </Typography>
                      <Typography>
                        <strong>Identificación:</strong> {dup.identificacion_intentado || dup.identificacion}
                      </Typography>
                      <Typography>
                        <strong>Nombre:</strong> {dup.nombre_intentado || dup.nombre} {dup.apellido_intentado || dup.apellido}
                      </Typography>
                      <Typography>
                        <strong>Dirección:</strong> {dup.direccion_intentado || dup.direccion}
                      </Typography>
                      <Typography>
                        <strong>Celular:</strong> {dup.celular_intentado || dup.celular}
                      </Typography>
                      <Typography>
                        <strong>Líder Ingresado:</strong> {dup.lider_intentado || dup.lider_identificacion}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ mt: 2 }}>
                    Opciones: editar la información manualmente o descargar un Excel con estos duplicados.
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body1">
                No se detectaron duplicados.
              </Typography>
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
