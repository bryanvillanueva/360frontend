import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDrawer } from "../../context/DrawerContext";

const HeaderContainer = styled(Box)(({ theme, isopen }) => ({
  background: theme.palette.background.paper,
  padding: isopen === "true" ? "4.8px" : "19px",
  color: theme.palette.text.primary,
  textAlign: "center",
  borderBottom: `2px solid ${theme.palette.border.main}`,
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
      <Typography variant="h5" sx={(theme) => ({ fontWeight: 700, fontSize: "2rem", letterSpacing: "2px", color: theme.palette.text.primary })}>
        {title}
      </Typography>
      {description && (
        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary, fontWeight: 400, mt: 1, display: "block" })}>
          {description}
        </Typography>
      )}
    </HeaderContainer>
  );
};

export default PageHeader;
