import React, { useState } from "react";
import { Box, Button, Typography, TextField, CircularProgress } from "@mui/material";
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
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        Cargar Votantes
      </Typography>
      <input
        type="file"
        accept=".xls, .xlsx" // Permitir solo archivos Excel
        onChange={handleFileChange}
        style={{ marginBottom: "20px" }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={loading}
        sx={{ width: "100%" }}
      >
        {loading ? <CircularProgress size={24} /> : "Subir"}
      </Button>
    </Box>
  );
};

export default UploadVotantes;
