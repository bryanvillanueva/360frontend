import React, { useState } from "react";
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Divider, Typography, CssBaseline, ThemeProvider, createTheme, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu"; // Ícono del menú (3 líneas)
import CloseIcon from "@mui/icons-material/Close"; // Ícono de cerrar
import { styled } from '@mui/system';

// Crear un tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',  // color principal (puedes cambiar este color)
    },
    secondary: {
      main: '#03e8ff61',  // color secundario (puedes cambiar este color)
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h6: {
      fontWeight: 'bold',
    },
  },
});

// Estilo del Drawer
const DrawerContainer = styled(Drawer)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: 240,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    border: 'none', // Sin borde adicional
  },
}));

// Estilo del logo
const LogoContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: theme.palette.secondary.main,
}));

// Estilo del texto del logo
const LogoText = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
}));

// Estilo de los elementos de la lista
const ListItemTextStyled = styled(ListItemText)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
}));

const ListItemIconStyled = styled(ListItemIcon)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
}));

const DrawerMenu = () => {
  const [open, setOpen] = useState(false);  // Estado para abrir/cerrar el Drawer en móviles

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline aplica el tema global y normaliza los estilos */}
      <CssBaseline />
      
      {/* Botón de menú para pantallas pequeñas */}
      <IconButton 
        onClick={() => setOpen(true)} 
        sx={{ display: { xs: 'block', sm: 'none' }, position: 'absolute', top: 16, left: 16 }}
      >
        <MenuIcon />
      </IconButton>

      <DrawerContainer
        variant="permanent" // Este es el comportamiento por defecto (fijo en escritorio)
        anchor="left"
        sx={{
          display: { xs: "none", sm: "block" }, // Fijo en pantallas grandes
        }}
      >
        {/* Logo o Título del Drawer */}
        <LogoContainer>
          <LogoText>SOFT 360</LogoText>
        </LogoContainer>

        <List>
          <ListItem button component={Link} to="/upload">
            <ListItemIconStyled>
              <PictureAsPdfIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Subir PDF" />
          </ListItem>
          <Divider />

          <ListItem button component={Link} to="/recomendados">
            <ListItemIconStyled>
              <PersonAddIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Crear Recomendado" />
          </ListItem>
          <Divider />

          <ListItem button component={Link} to="/lideres">
            <ListItemIconStyled>
              <PeopleIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Crear Líder" />
          </ListItem>
          <Divider />

          <ListItem button component={Link} to="/votantes">
            <ListItemIconStyled>
              <PersonAddIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Crear Votantes" />
          </ListItem>
          <Divider />

          <ListItem button component={Link} to="/cargarVotantes">
            <ListItemIconStyled>
              <PersonAddIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Cargar Votantes" />
          </ListItem>
          <Divider />

          <ListItem button component={Link} to="/votantesFiltro">
            <ListItemIconStyled>
              <PersonAddIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Ver Lista de Votantes" />
          </ListItem>
          <Divider />
        </List>
      </DrawerContainer>


      {/* Drawer Responsivo para móviles */}
      <Drawer
        variant="temporary" // Variará al modo temporal para móviles
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{
          keepMounted: true, // Ayuda a la transición en dispositivos móviles
        }}
        sx={{
          display: { xs: "block", sm: "none" }, // Aparece solo en pantallas pequeñas
          "& .MuiDrawer-paper": {
            backgroundColor: theme.palette.primary.main, // Mantener el mismo color de fondo
            color: theme.palette.primary.contrastText, // Mantener el mismo color de texto
            paddingTop: theme.spacing(2),
          },
        }}
      >
        {/* Cerrar ícono (X) fuera del Drawer flotando en la esquina derecha */}
        <IconButton 
          onClick={() => setOpen(false)} 
          sx={{ 
            position: 'fixed', 
            top: 16, 
            right: 16, 
            color: theme.palette.primary.contrastText,
            zIndex: 1201, // Para asegurarse de que esté sobre el Drawer
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Logo del Drawer en la versión móvil */}
        <LogoContainer>
          <LogoText>SOFT-360</LogoText>
        </LogoContainer>

        <List>
          <ListItem button component={Link} to="/upload">
            <ListItemIconStyled>
              <PictureAsPdfIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Subir PDF" />
          </ListItem>
          <Divider />

          <ListItem button component={Link} to="/recomendados">
            <ListItemIconStyled>
              <PersonAddIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Crear Recomendado" />
          </ListItem>
          <Divider />

          <ListItem button component={Link} to="/lideres">
            <ListItemIconStyled>
              <PeopleIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Crear Líder" />
          </ListItem>
          <Divider />

          <ListItem button component={Link} to="/votantes">
            <ListItemIconStyled>
              <PersonAddIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Crear Votantes" />
          </ListItem>
          <Divider />

          <ListItem button component={Link} to="/cargarVotantes">
            <ListItemIconStyled>
              <PersonAddIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Cargar Votantes" />
          </ListItem>
          <Divider />

          <ListItem button component={Link} to="/votantesFiltro">
            <ListItemIconStyled>
              <PersonAddIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Ver Lista de Votantes" />
          </ListItem>
          <Divider />
        </List>
      </Drawer>
    </ThemeProvider>
  );
};

export default DrawerMenu;
