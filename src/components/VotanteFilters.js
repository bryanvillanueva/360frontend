import React from "react";
import { Box, TextField, MenuItem } from "@mui/material";

const VotanteFilters = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
      <TextField
        select
        label="Filtrar por"
        name="tipo"
        value={filters.tipo}
        onChange={handleChange}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="todos">Todos</MenuItem>
        <MenuItem value="lider">Líder</MenuItem>
        <MenuItem value="recomendado">Recomendado</MenuItem>
        <MenuItem value="grupo">Grupo</MenuItem>
      </TextField>

      {filters.tipo !== "todos" && (
        <TextField
          label={`ID de ${filters.tipo}`}
          name="valor"
          value={filters.valor}
          onChange={handleChange}
        />
      )}
    </Box>
  );
};

export default VotanteFilters;
