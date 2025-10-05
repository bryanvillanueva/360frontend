import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDrawer } from "../../context/DrawerContext";

const HeaderContainer = styled(Box)(({ theme, isopen }) => ({
  background: "linear-gradient(135deg, #0b9b8a 0%, #018da5 100%)",
  padding: isopen === "true" ? "4.8px" : "19px",
  color: "#fff",
  textAlign: "center",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  marginLeft: "-20px",
  marginRight: "-20px",
  marginTop: "-20px",
  marginBottom: theme.spacing(3),
  transition: "padding 0.3s",
}));

const PageHeader = ({ title, description }) => {
  const { drawerOpen } = useDrawer();

  return (
    <HeaderContainer isopen={drawerOpen ? "true" : "false"}>
      <Typography variant="h5" sx={{ fontWeight: 700, fontSize: "2rem", letterSpacing: "2px", textShadow: "2px 2px 4px rgba(0,0,0,0.2)" }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 400, mt: 1, display: "block" }}>
          {description}
        </Typography>
      )}
    </HeaderContainer>
  );
};

export default PageHeader;
