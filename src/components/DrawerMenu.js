import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Typography,
  IconButton,
  ListSubheader,
  Collapse,
  Box,
  Avatar,
  Tooltip,
  Fade,
  alpha,
  useMediaQuery,
} from "@mui/material";
import { DrawerProvider } from "../context/DrawerContext";
import { Link, useLocation } from "react-router-dom";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ListIcon from "@mui/icons-material/List";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RecommendIcon from "@mui/icons-material/Recommend";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import FilterListIcon from "@mui/icons-material/FilterList";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { styled } from "@mui/system";

// Estilos mejorados para el Drawer
const DrawerContainer = styled(Drawer)(({ theme, open }) => ({
  width: open ? 280 : 70,
  flexShrink: 0,
  transition: "width 0.3s",
  "& .MuiDrawer-paper": {
    width: open ? 280 : 70,
    background: "#fff",
    color: theme.palette.text.primary,
    border: "none",
    boxShadow: "4px 0 15px rgba(0,0,0,0.1)",
    overflowX: "hidden",
    transition: "width 0.3s",
  },
}));

// Estilo mejorado del logo
const LogoContainer = styled(Box)(({ theme, isopen }) => ({
  padding: theme.spacing(2),
  paddingTop: isopen === "true" ? theme.spacing(2) : theme.spacing(8),
  textAlign: "center",
  background: theme.palette.background.paper,
  borderBottom: `2px solid ${theme.palette.border.main}`,
  marginBottom: theme.spacing(2),
}));

const LogoText = styled(Typography)(({ theme, align }) => ({
  fontSize: "2rem",
  color: theme.palette.text.primary,
  fontWeight: 800,
  letterSpacing: "2px",
  textAlign: align || "center",
}));

// Perfil de usuario
const UserProfile = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(2),
  margin: theme.spacing(2),
  transition: "all 0.3s",
  cursor: "pointer",
  "&:hover": {
    background: theme.palette.background.subtle,
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
  background: isActive ? theme.palette.background.subtle : "transparent",
  "&:before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: isActive ? "4px" : "0px",
    height: "70%",
    background: theme.palette.primary.main,
    borderRadius: "0 4px 4px 0",
    transition: "width 0.3s",
  },
  "&:hover": {
    background: theme.palette.background.subtle,
    transform: "translateX(8px)",
    "& .MuiListItemText-primary": {
      color: theme.palette.primary.main,
    },
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
    "&:before": {
      width: "4px",
      background: theme.palette.primary.main,
    },
  },
}));

const ListItemTextStyled = styled(ListItemText)(({ theme, isActive }) => ({
  "& .MuiListItemText-primary": {
    color: theme.palette.text.primary,
    fontWeight: isActive ? 600 : 500,
    fontSize: "0.95rem",
  },
}));

const ListItemIconStyled = styled(ListItemIcon)(({ theme, isActive }) => ({
  color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
  minWidth: 42,
  "& .MuiSvgIcon-root": {
    fontSize: "1.3rem",
  },
}));

// Divider mejorado
const StyledDivider = styled(Divider)(({ theme }) => ({
  background: "rgba(0,0,0,0.1)",
  margin: theme.spacing(1, 2),
}));

// Botón flotante mejorado
const FloatingMenuButton = styled(IconButton)(({ theme }) => ({
  position: "fixed",
  top: 20,
  left: 20,
  background: theme.palette.primary.main,
  color: "#fff",
  boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
  zIndex: 1300,
  transition: "all 0.3s",
  "&:hover": {
    background: theme.palette.primary.dark,
    transform: "rotate(90deg) scale(1.1)",
  },
}));

const DrawerMenu = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFiltros, setOpenFiltros] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const location = useLocation();
  const isLaptopOrBelow = useMediaQuery('(max-width:1440px)');

  useEffect(() => {
    setDrawerOpen(!isLaptopOrBelow);
  }, [isLaptopOrBelow]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: <DashboardIcon />,
    },
    {
      title: "Grupos",
      path: "/grupos",
      icon: <GroupIcon />,
    },
    {
      title: "Recomendados",
      path: "/crear/recomendados",
      icon: <RecommendIcon />,
    },
    {
      title: "Líderes",
      path: "/crear/lideres",
      icon: <SupervisorAccountIcon />,
    },
    {
      title: "Votantes",
      path: "/crear/votantes",
      icon: <HowToVoteIcon />,
    },
  ];

  const drawerContent = (
    <Fade in={true} timeout={500}>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Botón para retraer/expandir drawer */}
        <IconButton
          onClick={toggleDrawer}
          sx={(theme) => ({
            position: "absolute",
            top: 16,
            left: drawerOpen ? "auto" : "50%",
            right: drawerOpen ? 16 : "auto",
            transform: drawerOpen ? "none" : "translateX(-50%)",
            background: "#fff",
            color: theme.palette.primary.main,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            "&:hover": {
              background: theme.palette.background.subtle,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            },
            transition: "all 0.3s",
            zIndex: 1201,
          })}
        >
          {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>

        <LogoContainer isopen={drawerOpen ? "true" : "false"} sx={{ textAlign: drawerOpen ? "left" : "center", pl: drawerOpen ? 2 : 0 }}>
          {drawerOpen ? (
            <LogoText align="left">SOFT 360</LogoText>
          ) : (
            <LogoText sx={{ fontSize: "1.2rem" }}>360</LogoText>
          )}
        </LogoContainer>

        {/* Perfil de usuario */}
        {drawerOpen && (
          <UserProfile>
            <Avatar sx={(theme) => ({ bgcolor: theme.palette.background.subtle, color: theme.palette.primary.main })}>
              <AccountCircleIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={(theme) => ({ color: theme.palette.text.primary, fontWeight: 600 })}>
                Administrador
              </Typography>
              <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                admin@soft360.com
              </Typography>
            </Box>
          </UserProfile>
        )}

        {!drawerOpen && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <Avatar sx={(theme) => ({ bgcolor: theme.palette.background.subtle, color: theme.palette.primary.main })}>
              <AccountCircleIcon />
            </Avatar>
          </Box>
        )}

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
                  justifyContent: drawerOpen ? "initial" : "center",
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
                <ListItemIconStyled isActive={isActive(item.path)} sx={{ minWidth: drawerOpen ? 42 : "auto" }}>
                  <Box sx={(theme) => ({
                    color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
                    transition: "color 0.3s",
                  })}>
                    {item.icon}
                  </Box>
                </ListItemIconStyled>
                {drawerOpen && <ListItemTextStyled isActive={isActive(item.path)} primary={item.title} />}
                {isActive(item.path) && drawerOpen && (
                  <Box sx={(theme) => ({
                    position: "absolute",
                    right: "7%",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: theme.palette.primary.main,
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%": {
                        boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.7)}`,
                      },
                      "70%": {
                        boxShadow: `0 0 0 10px ${alpha(theme.palette.primary.main, 0)}`,
                      },
                      "100%": {
                        boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
                      },
                    },
                  })} />
                )}
              </StyledListItem>
            </Tooltip>
          ))}

          <StyledDivider sx={{ my: 2 }} />

          {/* Grupo "Filtros y Reportes" */}
          <StyledListItem
            button
            onClick={() => drawerOpen && setOpenFiltros(!openFiltros)}
            sx={(theme) => ({
              background: openFiltros && drawerOpen ? theme.palette.background.subtle : "transparent",
              justifyContent: drawerOpen ? "initial" : "center",
              cursor: drawerOpen ? "pointer" : "default",
            })}
          >
            <ListItemIconStyled sx={{ minWidth: drawerOpen ? 42 : "auto" }}>
              <FilterListIcon />
            </ListItemIconStyled>
            {drawerOpen && (
              <>
                <ListItemTextStyled primary="Filtros y Reportes" />
                {openFiltros ? <ExpandLess sx={{ color: "text.primary" }} /> : <ExpandMore sx={{ color: "text.primary" }} />}
              </>
            )}
          </StyledListItem>
          {drawerOpen && (
            <Collapse in={openFiltros} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <StyledListItem
                  button
                  sx={{ pl: 6 }}
                  component={Link}
                  to="/filtros/votantes"
                  isActive={isActive("/filtros/votantes")}
                >
                  <ListItemIconStyled isActive={isActive("/filtros/votantes")}>
                    <ListIcon fontSize="small" />
                  </ListItemIconStyled>
                  <ListItemTextStyled isActive={isActive("/filtros/votantes")} primary="Ver Lista de Votantes" />
                </StyledListItem>
              </List>
            </Collapse>
          )}
        </List>

        {/* Footer del drawer */}
        <Box sx={(theme) => ({
          p: 2,
          background: theme.palette.background.paper,
          borderTop: `2px solid ${theme.palette.border.main}`,
          textAlign: "center",
        })}>
          {drawerOpen && (
            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
              © 2026 SOFT 360
            </Typography>
          )}
          {!drawerOpen && (
            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary, fontSize: "0.6rem" })}>
              © 2026
            </Typography>
          )}
        </Box>
      </Box>
    </Fade>
  );

  return (
    <DrawerProvider value={{ drawerOpen }}>
      <Box sx={{ display: "flex" }}>
        {/* Drawer fijo para escritorio */}
        <DrawerContainer
          variant="permanent"
          anchor="left"
          open={drawerOpen}
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
          sx={(theme) => ({
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              width: 280,
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
            },
          })}
        >
          <IconButton
            onClick={handleDrawerToggle}
            sx={(theme) => ({
              position: "absolute",
              top: 16,
              right: 16,
              color: theme.palette.text.primary,
              zIndex: 1201,
              background: theme.palette.background.subtle,
              "&:hover": {
                background: theme.palette.primary.light,
              },
            })}
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

        {/* Contenedor principal para el contenido */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            padding: "20px",
            marginLeft: { xs: 0, sm: 0 },
            transition: "margin 0.3s",
            width: { xs: "100%", sm: `calc(100% - ${drawerOpen ? 280 : 70}px)` },
          }}
        >
          {children}
        </Box>
      </Box>
    </DrawerProvider>
  );
};

export default DrawerMenu;
