import React, { useState } from "react";
import { Box, Button, Typography, CircularProgress, Card, CardContent, Paper } from "@mui/material";
import axios from "axios";

const UploadVotantes = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Por favor selecciona un archivo");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/votantes/upload_csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message);
    } catch (error) {
      console.error("Error al cargar el archivo:", error);
      alert("Error al cargar el archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 5 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Cargar Votantes
          </Typography>

          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Suba un archivo Excel (.xls, .xlsx) con la información de los votantes
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
  );
};

export default UploadVotantes;
