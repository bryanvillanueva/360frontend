import React, { useState } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import axios from "axios";

const UploadVotantes = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Por favor selecciona un archivo CSV");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:5000/votantes/upload_csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert(response.data.message);
    } catch (error) {
      console.error("Error al cargar archivo:", error);
      alert(error.response?.data?.error || "Error al cargar archivo");
    } finally {
      setLoading(false);
      setFile(null); // Reiniciar el archivo seleccionado
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        Cargar Votantes desde CSV
      </Typography>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ marginBottom: "20px" }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ width: "100%" }}
        >
          {loading ? <CircularProgress size={24} /> : "Cargar Archivo"}
        </Button>
      </form>
    </Box>
  );
};

export default UploadVotantes;
