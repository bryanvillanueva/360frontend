import React from "react";
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";

const DrawerMenu = () => {
  return (
    <Drawer variant="permanent" anchor="left">
      <List>
        <ListItem button component={Link} to="/upload">
          <ListItemIcon>
            <PictureAsPdfIcon />
          </ListItemIcon>
          <ListItemText primary="Subir PDF" />
        </ListItem>
        <Divider />
        <ListItem button component={Link} to="/recomendados">
          <ListItemIcon>
            <PersonAddIcon />
          </ListItemIcon>
          <ListItemText primary="Crear Recomendado" />
        </ListItem>
        <Divider />
        <ListItem button component={Link} to="/lideres">
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Crear Líder" />
        </ListItem>
        <Divider />
        <ListItem button component={Link} to="/votantes">
          <ListItemIcon>
            <PersonAddIcon />
          </ListItemIcon>
          <ListItemText primary="Crear votantes" />
        </ListItem>
        <ListItem button component={Link} to="/cargarVotantes">
          <ListItemIcon>
            <PersonAddIcon />
          </ListItemIcon>
          <ListItemText primary="Cargar Votantes" />
        </ListItem>
        <Divider />
        <ListItem button component={Link} to="/votantesFiltro">
          <ListItemIcon>
            <PersonAddIcon />
          </ListItemIcon>
          <ListItemText primary="Ver Lista de Votantes" />
        </ListItem>
        <Divider />
      </List>
    </Drawer>
  );
};

export default DrawerMenu;
