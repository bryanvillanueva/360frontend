import React from "react";
import {
  Table, TableHead, TableRow, TableCell,
  TableBody, Paper, TableContainer, Button
} from "@mui/material";

const VotanteList = ({ votantes }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Identificación</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Apellido</TableCell>
            <TableCell>Líder</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {votantes.length > 0 ? (
            votantes.map((v) => (
              <TableRow key={v.identificacion}>
                <TableCell>{v.identificacion}</TableCell>
                <TableCell>{v.nombre}</TableCell>
                <TableCell>{v.apellido}</TableCell>
                <TableCell>
                  {v.lider_nombre ? `${v.lider_nombre} ${v.lider_apellido || ""}` : "-"}
                </TableCell>
                <TableCell>
                  <Button size="small">Editar</Button>
                  <Button size="small" color="error">Eliminar</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No se encontraron votantes
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VotanteList;
