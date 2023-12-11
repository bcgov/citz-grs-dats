import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useAuthentication } from "./hooks/useAuthentication/useAuthentication";
// import { createTheme } from "@mui/material/styles";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes as appRoutes } from "./routes";
import Layout from "./components/layout/MainLayout";
import BCTheme from "./assets/styles/styles";

function App() {
  //const { KeycloakProvider } = useAuthentication();

  return (
    //<KeycloakProvider>
    <ThemeProvider theme={BCTheme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            {appRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
    //</KeycloakProvider>
  );
}

export default App;
