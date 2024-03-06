import { createTheme } from "@mui/material/styles";
//import "@bcgov/bc-sans/css/BC_Sans.css";

const BCTheme = createTheme({
  typography: {
    fontFamily: ["BC Sans", "Noto Sans", "Verdana", "Arial", "sans-serif"].join(
      ","
    ),
  },
  palette: {
    primary: {
      main: "#003366",
    },
    warning: {
      main: "#FCBA19",
    },
  },
});

export default BCTheme;
