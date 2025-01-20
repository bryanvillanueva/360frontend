import React, { useState } from "react";
import axios from "axios";
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Container,
    Paper,
} from "@mui/material";

const UploadPDF = () => {
    const [file, setFile] = useState(null);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null); // Limpiar error anterior
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Resetear errores
        setResults(null); // Resetear resultados
        setLoading(true); // Mostrar loader

        if (!file) {
            setError("Por favor selecciona un archivo PDF.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://127.0.0.1:5000/upload_pdf", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setResults(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "Error al conectar con el servidor");
        } finally {
            setLoading(false); // Ocultar loader
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, marginTop: "50px" }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
                    Procesar PDF E11
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Box
                        sx={{
                            border: "2px dashed #1976d2",
                            borderRadius: 2,
                            padding: 3,
                            textAlign: "center",
                            cursor: "pointer",
                            backgroundColor: "#f9f9f9",
                            transition: "background-color 0.2s",
                            '&:hover': {
                                backgroundColor: "#e3f2fd",
                            },
                        }}
                        onClick={() => document.getElementById("fileInput").click()}
                    >
                        <input
                            id="fileInput"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                        <Typography>
                            {file ? file.name : "Arrastra un archivo PDF o haz clic para seleccionar"}
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        fullWidth
                        sx={{
                            fontWeight: "bold",
                            padding: "12px",
                            textTransform: "none",
                            borderRadius: 1,
                            mt: 3,
                        }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Procesar PDF"}
                    </Button>
                </form>

                {/* Loader */}
                {loading && (
                    <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Error */}
                {error && (
                    <Typography color="error" sx={{ mt: 2 }} align="center">
                        {error}
                    </Typography>
                )}

                {/* Resultados */}
                {results && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Resultados:
                        </Typography>
                        <Typography>
                            <strong>Total de campos extraídos:</strong> {results.total_count}
                        </Typography>
                        <Typography component="pre" sx={{ whiteSpace: "pre-wrap", mt: 2 }}>
                            {results.highlighted_text}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default UploadPDF;
