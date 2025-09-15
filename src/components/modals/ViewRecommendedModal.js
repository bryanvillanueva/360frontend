import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  IconButton,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from "@mui/material";
import {
  Close,
  Person,
  Group,
  TrendingUp,
  Assessment,
  LocationOn,
  Email,
  Phone,
  SupervisorAccount,
  HowToVote,
} from "@mui/icons-material";
import axios from "axios";

const API = "https://backend-node-soft360-production.up.railway.app";

const ViewRecommendedModal = ({ open, onClose, recommendedData }) => {
  const [recommendedDetails, setRecommendedDetails] = useState(null);
  const [groupInfo, setGroupInfo] = useState(null);
  const [leadersInfo, setLeadersInfo] = useState([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [leadersInCompliance, setLeadersInCompliance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && recommendedData) {
      fetchRecommendedDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recommendedData]);

  const fetchRecommendedDetails = async () => {
    if (!recommendedData) return;

    setLoading(true);
    setError(null);

    try {
      // 1) Datos base del recomendado (ya los tienes en recommendedData)
      setRecommendedDetails(recommendedData);

      // 2) Líderes asociados a este recomendado
      const leadersRes = await axios.get(`${API}/lideres`);
      const associatedLeaders = (leadersRes.data || []).filter(
        (leader) =>
          String(leader.recomendado_identificacion) ===
          String(recommendedData.identificacion)
      );

      // 3) Enriquecer líderes con sus votantes y tasa de cumplimiento
      const enrichedLeaders = [];
      let totalVotersCount = 0;
      let leadersCompliant = 0;

      for (const leader of associatedLeaders) {
        try {
          const votersRes = await axios.get(
            `${API}/votantes/por-lider-detalle?lider=${leader.lider_identificacion}`
          );
          const votersCount = votersRes.data?.votantes?.length || 0;
          totalVotersCount += votersCount;

          let complianceRate = 0;
          if (leader.lider_objetivo) {
            complianceRate = (votersCount / leader.lider_objetivo) * 100;
            if (complianceRate >= 80) leadersCompliant++;
          }

          enrichedLeaders.push({
            ...leader,
            votersCount,
            complianceRate: leader.lider_objetivo ? complianceRate : null,
          });
        } catch (err) {
          console.warn(
            `Error al obtener votantes del líder ${leader.lider_identificacion}:`,
            err
          );
          enrichedLeaders.push({
            ...leader,
            votersCount: 0,
            complianceRate: null,
          });
        }
      }

      setLeadersInfo(enrichedLeaders);
      setTotalVoters(totalVotersCount);
      setLeadersInCompliance(leadersCompliant);

      // 4) Grupo al que pertenece este recomendado
      //    Usamos /grupos y /grupos/:id/recomendados (más directo y confiable)
      try {
        const gruposResponse = await axios.get(`${API}/grupos`);
        const grupos = gruposResponse.data || [];

        let foundGroup = null;

        for (const grupo of grupos) {
          try {
            const recsRes = await axios.get(
              `${API}/grupos/${grupo.id}/recomendados`
            );
            const recs = Array.isArray(recsRes.data) ? recsRes.data : [];

            const belongs = recs.some(
              (r) =>
                String(r.identificacion) ===
                String(recommendedData.identificacion)
            );

            if (belongs) {
              foundGroup = {
                ...grupo,
                recomendadosCount: recs.length,
                totalRecomendados: recs,
              };
              break; // ¡listo!
            }
          } catch (err) {
            // Si falla un grupo, seguimos probando los demás
            console.warn(`Error consultando recomendados del grupo ${grupo.id}:`, err);
          }
        }

        if (foundGroup) {
          setGroupInfo({
            hasGroup: true,
            groupData: foundGroup,
            leadersCount: associatedLeaders.length,
          });
        } else {
          // No pertenece a ningún grupo
          setGroupInfo({
            hasGroup: false,
            leadersCount: associatedLeaders.length,
          });
        }
      } catch (err) {
        console.warn("Error al obtener información de grupos:", err);
        // ⚠️ Importante: si falla la API de grupos, NO asumimos que tiene grupo por tener líderes
        setGroupInfo({
          hasGroup: false,
          leadersCount: associatedLeaders.length,
        });
      }
    } catch (err) {
      console.error("Error al obtener detalles del recomendado:", err);
      setError("Error al cargar la información del recomendado");
    } finally {
      setLoading(false);
    }
  };

  const getComplianceRate = () => {
    if (leadersInfo.length === 0) return 0;
    return Math.round((leadersInCompliance / leadersInfo.length) * 100);
  };

  const getComplianceColor = (rate) => {
    if (rate >= 80) return "success";
    if (rate >= 60) return "warning";
    return "error";
  };

  if (!recommendedData) return null;

  const complianceRate = getComplianceRate();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Person />
          Información Detallada del Recomendado
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : recommendedDetails ? (
          <Grid container spacing={3}>
            {/* Información Personal */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#018da5", fontWeight: 600 }}>
                    Información Personal
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Identificación
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {recommendedDetails.identificacion}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nombre Completo
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {recommendedDetails.nombre} {recommendedDetails.apellido}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <Phone fontSize="small" color="action" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Celular
                      </Typography>
                      <Typography variant="body1">{recommendedDetails.celular}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Email fontSize="small" color="action" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">{recommendedDetails.email}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Dirección */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#018da5", fontWeight: 600 }}>
                    <LocationOn sx={{ mr: 1, verticalAlign: "middle" }} />
                    Dirección
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Departamento:</strong> {recommendedDetails.departamento || "No especificado"}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Ciudad:</strong> {recommendedDetails.ciudad || "No especificado"}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Barrio:</strong> {recommendedDetails.barrio || "No especificado"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1">
                      <strong>Dirección:</strong> {recommendedDetails.direccion || "No especificado"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Información del Grupo */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#018da5", fontWeight: 600 }}>
                    <Group sx={{ mr: 1, verticalAlign: "middle" }} />
                    Información del Grupo
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {groupInfo?.hasGroup && groupInfo?.groupData ? (
                    <Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Nombre del Grupo
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {groupInfo.groupData.nombre}
                        </Typography>
                      </Box>

                      {groupInfo.groupData.descripcion && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Descripción
                          </Typography>
                          <Typography variant="body2">
                            {groupInfo.groupData.descripcion}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                        <Chip
                          label={`${groupInfo.recomendadosCount ?? groupInfo.groupData.recomendadosCount ?? 0} recomendados`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={`${leadersInfo.length} líderes`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <Group sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No pertenece a ningún grupo
                      </Typography>
                      {leadersInfo.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                          Tiene {leadersInfo.length} líder{leadersInfo.length !== 1 ? "es" : ""} asociado{leadersInfo.length !== 1 ? "s" : ""}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Métricas de Liderazgo */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#018da5", fontWeight: 600 }}>
                    <Assessment sx={{ mr: 1, verticalAlign: "middle" }} />
                    Métricas de Liderazgo
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        <SupervisorAccount sx={{ mr: 0.5, fontSize: 16 }} />
                        Líderes Totales
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {leadersInfo.length}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        <TrendingUp sx={{ mr: 0.5, fontSize: 16 }} />
                        Líderes en Cumplimiento
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {leadersInCompliance} de {leadersInfo.length}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        <HowToVote sx={{ mr: 0.5, fontSize: 16 }} />
                        Total de Votantes
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {totalVoters}
                      </Typography>
                    </Box>

                    {leadersInfo.length > 0 && (
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Tasa de Cumplimiento del Grupo
                          </Typography>
                          <Chip
                            label={`${complianceRate}%`}
                            color={getComplianceColor(complianceRate)}
                            size="small"
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={complianceRate}
                          color={getComplianceColor(complianceRate)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Lista de Líderes */}
            {leadersInfo.length > 0 && (
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: "#018da5", fontWeight: 600 }}>
                      <SupervisorAccount sx={{ mr: 1, verticalAlign: "middle" }} />
                      Líderes Asociados
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <List>
                      {leadersInfo.map((leader, index) => (
                        <ListItem key={leader.lider_identificacion} divider={index < leadersInfo.length - 1}>
                          <Avatar sx={{ mr: 2, bgcolor: "#018da5" }}>
                            <SupervisorAccount />
                          </Avatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="subtitle1" fontWeight={500}>
                                  {leader.lider_nombre} {leader.lider_apellido}
                                </Typography>
                                {leader.complianceRate !== null && (
                                  <Chip
                                    label={`${leader.complianceRate.toFixed(0)}%`}
                                    size="small"
                                    color={
                                      leader.complianceRate >= 80 ? "success" :
                                      leader.complianceRate >= 60 ? "warning" : "error"
                                    }
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                  ID: {leader.lider_identificacion}
                                </Typography>
                                <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    <HowToVote sx={{ fontSize: 12, mr: 0.5 }} />
                                    Votantes: {leader.votersCount}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    <TrendingUp sx={{ fontSize: 12, mr: 0.5 }} />
                                    Expectativa: {leader.lider_objetivo || "No definida"}
                                  </Typography>
                                </Box>
                                {leader.complianceRate !== null && (
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(leader.complianceRate, 100)}
                                    color={
                                      leader.complianceRate >= 80 ? "success" :
                                      leader.complianceRate >= 60 ? "warning" : "error"
                                    }
                                    sx={{ mt: 1, height: 4, borderRadius: 2 }}
                                  />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewRecommendedModal;
