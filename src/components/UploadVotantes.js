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
        "https://backend-node-soft360-production.up.railway.app/votantes/upload_csv",
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // NUEVO FORMATO DE RESPUESTA con arquitectura de staging (capturas_votante)
      // Response esperado: { message, procesados, capturas_insertadas, incidencias }
      const { procesados = 0, capturas_insertadas = 0, incidencias = [] } = response.data;

      // Mostrar resumen de procesamiento
      if (incidencias && incidencias.length > 0) {
        // Clasificar incidencias por tipo
        const duplicadosMismoLider = incidencias.filter(i =>
          i.tipo === 'DUPLICIDAD_CON_SI_MISMO' || i.tipo === 'DUPLICIDAD_LIDER'
        );
        const duplicadosOtroLider = incidencias.filter(i =>
          i.tipo === 'DUPLICIDAD_ENTRE_LIDERES'
        );
        const conflictos = incidencias.filter(i =>
          i.tipo === 'CONFLICTO_DATOS'
        );

        // Construir array de duplicados para compatibilidad con UI existente
        const dups = incidencias.map(inc => ({
          identificacion: inc.votante_identificacion,
          nombre: inc.votante_nombre || '',
          apellido: inc.votante_apellido || '',
          direccion: inc.detalles?.direccion || '',
          celular: inc.detalles?.celular || '',
          lider_identificacion: inc.detalles?.lider_actual || '',
          lider_nombre: inc.detalles?.lider_actual_nombre || '',
          // Datos intentados (si existen en detalles)
          identificacion_intentado: inc.votante_identificacion,
          nombre_intentado: inc.detalles?.nombre_capturado || '',
          apellido_intentado: inc.detalles?.apellido_capturado || '',
          direccion_intentado: inc.detalles?.direccion_capturada || '',
          celular_intentado: inc.detalles?.celular_capturado || '',
          lider_intentado: inc.lider_identificacion || '',
          tipo_incidencia: inc.tipo
        }));

        setDuplicados(dups);

        // Separar duplicados reasignables y no reasignables
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
          tipo_incidencia: inc.tipo
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
          tipo_incidencia: inc.tipo
        }));

        setDuplicadosReasignables(reasignables);
        setDuplicadosNoReasignables(noReasignables);

        // Inicializar opciones de reasignación
        const initialOptions = {};
        reasignables.forEach((dup) => {
          initialOptions[dup.identificacion] = "current";
        });
        setReassignOptions(initialOptions);

        // Abrir modal correspondiente
        if (reasignables.length > 0) {
          setModalReasignacionOpen(true);
        } else if (noReasignables.length > 0) {
          setModalNoReasignableOpen(true);
        } else {
          alert(`Procesamiento exitoso:\n- ${procesados} registros procesados\n- ${capturas_insertadas} capturas creadas\n- ${incidencias.length} incidencias detectadas`);
        }
      } else {
        // No hay incidencias - todo procesado correctamente
        alert(`✅ Carga completada exitosamente:\n- ${procesados} registros procesados\n- ${capturas_insertadas} capturas creadas\n- Sin incidencias detectadas`);
      }
      setUploadResult(response.data);
    } catch (error) {
      console.error("Error al cargar el archivo:", error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Error al cargar el archivo";
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
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
        // OPCIÓN 1: Reasignar al nuevo líder
        // Con arquitectura de staging: crear nueva asignación + actualizar datos canónicos
        try {
          // Crear nueva asignación N:M con el nuevo líder
          await axios.post("https://backend-node-soft360-production.up.railway.app/asignaciones", {
            votante_identificacion: dup.identificacion,
            lider_identificacion: dup.lider_intentado
          });

          // Actualizar datos canónicos del votante si hay diferencias
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
        // OPCIÓN 2: Mantener líder actual
        // No se hace nada - la captura ya está registrada con la incidencia
        // El backend ya creó el registro en capturas_votante y la incidencia
        mantenidos++;
      }
    }

    if (!errorOccurred) {
      alert(`✅ Proceso completado:\n- ${reasignados} votante(s) reasignado(s)\n- ${mantenidos} votante(s) mantenido(s) sin cambios\n\nLas incidencias quedan registradas en el historial.`);
    } else {
      alert("⚠️ Ocurrió un error al procesar algunos duplicados. Revisa la consola para más detalles.");
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
          backgroundColor: "primary.main",
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
            backgroundColor: "background.subtle",
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
                border: "2px dashed",
                borderColor: "primary.main",
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
