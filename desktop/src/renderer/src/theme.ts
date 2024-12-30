import { createTheme } from "@mui/material/styles";
import "@bcgov/bc-sans/css/BC_Sans.css";

export const theme = createTheme({
	palette: {
		warning: {
			main: "#f7d219",
			light: "#f9dc4a",
			dark: "#d6b307",
		},
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
		h1: {
			fontWeight: 500,
			fontSize: "2rem",
		},
		h2: {
			fontWeight: 700,
			fontSize: "1.6rem",
			color: "#474543",
		},
		h3: {
			fontWeight: 700,
			fontSize: "1.2rem",
			color: "#474543",
		},
		h4: {
			fontWeight: 700,
			fontSize: "0.9rem",
			color: "#474543",
		},
		h5: {
			fontWeight: 500,
			fontSize: "0.8rem",
		},
		h6: {
			fontWeight: 500,
			fontSize: "0.7rem",
		},
	},
	components: {
		MuiLink: {
			styleOverrides: {
				root: {
					color: "#1976d2", // Custom link color
					textDecoration: "none", // Remove underline by default
					"&:hover": {
						textDecoration: "underline", // Add underline on hover
					},
				},
			},
		},
		MuiTypography: {
			styleOverrides: {
				root: {
					a: {
						color: "#1976d2", // Ensure link color applies to Typography links
						textDecoration: "none",
						"&:hover": {
							textDecoration: "underline",
						},
					},
				},
			},
		},
	},
});
