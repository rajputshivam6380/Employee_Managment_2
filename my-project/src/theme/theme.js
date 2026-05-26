import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6366F1",
    },

    secondary: {
      main: "#EC4899",
    },

    background: {
      default: "#F9FAFB",
    },
  },

  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

export default theme;
