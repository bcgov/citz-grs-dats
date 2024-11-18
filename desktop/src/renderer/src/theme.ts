import { createTheme } from "@mui/material/styles";
import "@bcgov/bc-sans/css/BC_Sans.css";

export const theme = createTheme({
	palette: {
		primary: {
			// colour palette for main view area of app
			main: "#ececec",
			light: "#f9f9f9",
			dark: "#d3d3d3",
		},
		secondary: {
			// colour palette for side nav
			main: "#fcfcfc",
			light: "#fffff",
			dark: "#c9c9c9",
		},
	},
	typography: {
		fontFamily: "BC Sans, Calibri, Arial, sans-serif",
		h4: {
			// stylings for side nav text
			fontWeight: 500,
			fontSize: "0.9rem",
		},
	},
});
