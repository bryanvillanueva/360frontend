import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Typography,
  CssBaseline,
  ThemeProvider,
  createTheme,
  IconButton,
  ListSubheader,
  Collapse,
} from "@mui/material";
import { Link } from "react-router-dom";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
import ListIcon from "@mui/icons-material/List";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/system";

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#03e8ff61",
    },
  },
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
    h6: {
      fontWeight: "bold",
    },
  },
});

// Estilos para el Drawer fijo
const DrawerContainer = styled(Drawer)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: 240,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    border: "none",
  },
}));

// Estilo del logo
const LogoContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  backgroundColor: theme.palette.secondary.main,
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  color: theme.palette.primary.contrastText,
  fontWeight: "bold",
}));

// Estilos para los elementos de la lista
const ListItemTextStyled = styled(ListItemText)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
}));

const ListItemIconStyled = styled(ListItemIcon)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
}));

const DrawerMenu = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCrear, setOpenCrear] = useState(false);
  const [openCargas, setOpenCargas] = useState(false);
  const [openFiltros, setOpenFiltros] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <>
      <LogoContainer>
        <LogoText>SOFT 360</LogoText>
      </LogoContainer>
      <List>
        {/* Dashboard */}
        <ListItem button component={Link} to="/">
          <ListItemIconStyled>
            <PeopleIcon />
          </ListItemIconStyled>
          <ListItemTextStyled primary="Dashboard" />
        </ListItem>
        <Divider />

        {/* Grupo "Crear" */}
        <ListItem button onClick={() => setOpenCrear(!openCrear)}>
          <ListItemTextStyled primary="Crear" />
          {openCrear ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openCrear} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              to="/crear/recomendados"
              sx={{ pl: 4 }}
            >
              <ListItemIconStyled>
                <PersonAddIcon />
              </ListItemIconStyled>
              <ListItemTextStyled primary="Crear Recomendado" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/crear/lideres"
              sx={{ pl: 4 }}
            >
              <ListItemIconStyled>
                <PersonAddIcon />
              </ListItemIconStyled>
              <ListItemTextStyled primary="Crear Líder" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/crear/votantes"
              sx={{ pl: 4 }}
            >
              <ListItemIconStyled>
                <PersonAddIcon />
              </ListItemIconStyled>
              <ListItemTextStyled primary="Crear Votante" />
            </ListItem>
          </List>
        </Collapse>
        <Divider />

        {/* Grupo "Cargas" */}
        <ListItem button onClick={() => setOpenCargas(!openCargas)}>
          <ListItemTextStyled primary="Cargas" />
          {openCargas ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openCargas} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* Los siguientes módulos se desarrollarán posteriormente */}
            <ListItem button sx={{ pl: 4 }} component={Link} to="/cargas/recomendados">
              <ListItemIconStyled>
                <UploadIcon />
              </ListItemIconStyled>
              <ListItemTextStyled primary="Cargar Recomendados" />
            </ListItem>
            <ListItem button sx={{ pl: 4 }} component={Link} to="/cargas/lideres">
              <ListItemIconStyled>
                <UploadIcon />
              </ListItemIconStyled>
              <ListItemTextStyled primary="Cargar Líderes" />
            </ListItem>
            <ListItem button sx={{ pl: 4 }} component={Link} to="/cargas/votantes">
              <ListItemIconStyled>
                <UploadIcon />
              </ListItemIconStyled>
              <ListItemTextStyled primary="Cargar Votantes" />
            </ListItem>
          </List>
        </Collapse>
        <Divider />

        {/* Grupo "Filtros y Reportes" */}
        <ListItem button onClick={() => setOpenFiltros(!openFiltros)}>
          <ListItemTextStyled primary="Filtros y Reportes" />
          {openFiltros ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openFiltros} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button sx={{ pl: 4 }} component={Link} to="/filtros/votantes">
              <ListItemIconStyled>
                <ListIcon />
              </ListItemIconStyled>
              <ListItemTextStyled primary="Ver Lista de Votantes" />
            </ListItem>
           

            {/*desabilitado temporalmente */}
            {/*<ListItem button sx={{ pl: 4 }} component={Link} to="/filtros/pdf">
              <ListItemIconStyled>
                <PictureAsPdfIcon />
              </ListItemIconStyled>
              <ListItemTextStyled primary="Subir PDF E11" />
            </ListItem>*/}

          </List>
        </Collapse>
        <Divider />
      </List>
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Drawer fijo para escritorio */}
      <DrawerContainer
        variant="permanent"
        anchor="left"
        sx={{
          display: { xs: "none", sm: "block" },
        }}
      >
        {drawerContent}
      </DrawerContainer>
      {/* Drawer temporal para móviles */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            paddingTop: theme.spacing(2),
          },
        }}
      >
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
            color: theme.palette.primary.contrastText,
            zIndex: 1201,
          }}
        >
          <CloseIcon />
        </IconButton>
        {drawerContent}
      </Drawer>
      {/* Botón de menú para móviles */}
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          display: { xs: "block", sm: "none" },
          position: "absolute",
          top: 16,
          left: 16,
        }}
      >
        <MenuIcon />
      </IconButton>
    </ThemeProvider>
  );
};

export default DrawerMenu;
