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
  Box,
  Avatar,
  Tooltip,
  Fade,
  alpha,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
import ListIcon from "@mui/icons-material/List";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RecommendIcon from "@mui/icons-material/Recommend";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { styled } from "@mui/system";

// Tema personalizado mejorado con nueva paleta
const theme = createTheme({
  palette: {
    primary: {
      main: "#018da5",
      dark: "#016b7a",
      light: "#80daeb",
    },
    secondary: {
      main: "#0b9b8a",
      light: "#67ddab",
    },
    background: {
      default: "#f5f5f5",
    },
    grey: {
      500: "#909090",
    },
  },
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
    h6: {
      fontWeight: "bold",
    },
  },
});

// Estilos mejorados para el Drawer
const DrawerContainer = styled(Drawer)(({ theme }) => ({
  width: 280,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: 280,
    background: "linear-gradient(180deg, #018da5 0%, #0b9b8a 100%)",
    color: "#fff",
    border: "none",
    boxShadow: "4px 0 15px rgba(0,0,0,0.1)",
    overflowX: "hidden",
  },
}));

// Estilo mejorado del logo
const LogoContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  marginBottom: theme.spacing(2),
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  color: "#fff",
  fontWeight: 800,
  letterSpacing: "2px",
  textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
  background: "linear-gradient(45deg, #fff 30%, #80daeb 90%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
}));

// Perfil de usuario
const UserProfile = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  background: "rgba(255,255,255,0.05)",
  borderRadius: theme.spacing(2),
  margin: theme.spacing(2),
  transition: "all 0.3s",
  cursor: "pointer",
  "&:hover": {
    background: "rgba(255,255,255,0.1)",
    transform: "translateX(5px)",
  },
}));

// Estilos mejorados para los elementos de la lista
const StyledListItem = styled(ListItem)(({ theme, isActive }) => ({
  borderRadius: theme.spacing(1.5),
  margin: theme.spacing(0.5, 1),
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  background: isActive
    ? "linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)"
    : "transparent",
  "&:before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: isActive ? "4px" : "0px",
    height: "70%",
    background: "#fff",
    borderRadius: "0 4px 4px 0",
    transition: "width 0.3s",
  },
  "&:hover": {
    background: "linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
    transform: "translateX(8px)",
    "&:before": {
      width: "4px",
    },
  },
}));

const ListItemTextStyled = styled(ListItemText)(({ theme }) => ({
  "& .MuiListItemText-primary": {
    color: "#fff",
    fontWeight: 500,
    fontSize: "0.95rem",
  },
}));

const ListItemIconStyled = styled(ListItemIcon)(({ theme }) => ({
  color: "#fff",
  minWidth: 42,
  "& .MuiSvgIcon-root": {
    fontSize: "1.3rem",
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
  },
}));

// Divider mejorado
const StyledDivider = styled(Divider)(({ theme }) => ({
  background: "rgba(255,255,255,0.1)",
  margin: theme.spacing(1, 2),
}));

// Botón flotante mejorado
const FloatingMenuButton = styled(IconButton)(({ theme }) => ({
  position: "fixed",
  top: 20,
  left: 20,
  background: "linear-gradient(135deg, #018da5 0%, #0b9b8a 100%)",
  color: "#fff",
  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  zIndex: 1300,
  transition: "all 0.3s",
  "&:hover": {
    background: "linear-gradient(135deg, #0b9b8a 0%, #018da5 100%)",
    transform: "rotate(90deg) scale(1.1)",
  },
}));

const DrawerMenu = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCargas, setOpenCargas] = useState(false);
  const [openFiltros, setOpenFiltros] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: <DashboardIcon />,
      color: "#80daeb",
    },
    {
      title: "Grupos",
      path: "/grupos",
      icon: <GroupIcon />,
      color: "#67ddab",
    },
    {
      title: "Recomendados",
      path: "/crear/recomendados",
      icon: <RecommendIcon />,
      color: "#0b9b8a",
    },
    {
      title: "Líderes",
      path: "/crear/lideres",
      icon: <SupervisorAccountIcon />,
      color: "#909090",
    },
    {
      title: "Votantes",
      path: "/crear/votantes",
      icon: <HowToVoteIcon />,
      color: "#018da5",
    },
  ];

  const drawerContent = (
    <Fade in={true} timeout={500}>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <LogoContainer>
          <LogoText>SOFT 360</LogoText>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}>
            Sistema de Gestión Electoral
          </Typography>
        </LogoContainer>

        {/* Perfil de usuario */}
        <UserProfile>
          <Avatar sx={{ bgcolor: "#fff", color: "#018da5" }}>
            <AccountCircleIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 600 }}>
              Administrador
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              admin@soft360.com
            </Typography>
          </Box>
        </UserProfile>

        <StyledDivider />

        <List sx={{ flexGrow: 1, py: 1 }}>
          {/* Menú principal */}
          {menuItems.map((item, index) => (
            <Tooltip
              key={item.path}
              title={item.title}
              placement="right"
              arrow
              enterDelay={500}
            >
              <StyledListItem
                button
                component={Link}
                to={item.path}
                isActive={isActive(item.path)}
                sx={{
                  animation: `fadeInLeft 0.3s ease ${index * 0.1}s both`,
                  "@keyframes fadeInLeft": {
                    from: {
                      opacity: 0,
                      transform: "translateX(-20px)",
                    },
                    to: {
                      opacity: 1,
                      transform: "translateX(0)",
                    },
                  },
                }}
              >
                <ListItemIconStyled>
                  <Box sx={{
                    color: isActive(item.path) ? item.color : "#fff",
                    transition: "color 0.3s",
                  }}>
                    {item.icon}
                  </Box>
                </ListItemIconStyled>
                <ListItemTextStyled primary={item.title} />
                {isActive(item.path) && (
                  <Box sx={{
                    position: "absolute",
                    right: 10,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: item.color,
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%": {
                        boxShadow: `0 0 0 0 ${alpha(item.color, 0.7)}`,
                      },
                      "70%": {
                        boxShadow: `0 0 0 10px ${alpha(item.color, 0)}`,
                      },
                      "100%": {
                        boxShadow: `0 0 0 0 ${alpha(item.color, 0)}`,
                      },
                    },
                  }} />
                )}
              </StyledListItem>
            </Tooltip>
          ))}

          <StyledDivider sx={{ my: 2 }} />

          {/* Grupo "Cargas" */}
          <StyledListItem
            button
            onClick={() => setOpenCargas(!openCargas)}
            sx={{
              background: openCargas ? "rgba(255,255,255,0.05)" : "transparent",
            }}
          >
            <ListItemIconStyled>
              <CloudUploadIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Cargas" />
            {openCargas ? <ExpandLess sx={{ color: "#fff" }} /> : <ExpandMore sx={{ color: "#fff" }} />}
          </StyledListItem>
          <Collapse in={openCargas} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <StyledListItem
                button
                component={Link}
                to="/cargas/recomendados"
                sx={{ pl: 6 }}
                isActive={isActive("/cargas/recomendados")}
              >
                <ListItemIconStyled>
                  <UploadIcon fontSize="small" />
                </ListItemIconStyled>
                <ListItemTextStyled primary="Cargar Recomendados" />
              </StyledListItem>
              <StyledListItem
                button
                component={Link}
                to="/cargas/lideres"
                sx={{ pl: 6 }}
                isActive={isActive("/cargas/lideres")}
              >
                <ListItemIconStyled>
                  <UploadIcon fontSize="small" />
                </ListItemIconStyled>
                <ListItemTextStyled primary="Cargar Líderes" />
              </StyledListItem>
              <StyledListItem
                button
                component={Link}
                to="/cargas/votantes"
                sx={{ pl: 6 }}
                isActive={isActive("/cargas/votantes")}
              >
                <ListItemIconStyled>
                  <UploadIcon fontSize="small" />
                </ListItemIconStyled>
                <ListItemTextStyled primary="Cargar Votantes" />
              </StyledListItem>
            </List>
          </Collapse>

          <StyledDivider />

          {/* Grupo "Filtros y Reportes" */}
          <StyledListItem
            button
            onClick={() => setOpenFiltros(!openFiltros)}
            sx={{
              background: openFiltros ? "rgba(255,255,255,0.05)" : "transparent",
            }}
          >
            <ListItemIconStyled>
              <FilterListIcon />
            </ListItemIconStyled>
            <ListItemTextStyled primary="Filtros y Reportes" />
            {openFiltros ? <ExpandLess sx={{ color: "#fff" }} /> : <ExpandMore sx={{ color: "#fff" }} />}
          </StyledListItem>
          <Collapse in={openFiltros} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <StyledListItem
                button
                sx={{ pl: 6 }}
                component={Link}
                to="/filtros/votantes"
                isActive={isActive("/filtros/votantes")}
              >
                <ListItemIconStyled>
                  <ListIcon fontSize="small" />
                </ListItemIconStyled>
                <ListItemTextStyled primary="Ver Lista de Votantes" />
              </StyledListItem>
            </List>
          </Collapse>
        </List>

        {/* Footer del drawer */}
        <Box sx={{
          p: 2,
          background: "rgba(0,0,0,0.2)",
          textAlign: "center",
        }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
            © 2024 SOFT 360
          </Typography>
        </Box>
      </Box>
    </Fade>
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
            width: 280,
            background: "linear-gradient(180deg, #018da5 0%, #0b9b8a 100%)",
            color: "#fff",
          },
        }}
      >
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "#fff",
            zIndex: 1201,
            background: "rgba(255,255,255,0.1)",
            "&:hover": {
              background: "rgba(255,255,255,0.2)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
        {drawerContent}
      </Drawer>

      {/* Botón de menú para móviles */}
      <FloatingMenuButton
        onClick={handleDrawerToggle}
        sx={{
          display: { xs: "block", sm: "none" },
        }}
      >
        <MenuIcon />
      </FloatingMenuButton>
    </ThemeProvider>
  );
};

export default DrawerMenu;