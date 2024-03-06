import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
// import { createTheme } from "@mui/material/styles";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { routes as appRoutes } from "./routes";
import Layout from "./components/layout/MainLayout";
import BCTheme from "./assets/styles/styles";
import GetAuthentication from "./utils/getAuthentication";

function App() {
  return (
    <ThemeProvider theme={BCTheme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            {appRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.path}
                element={
                  route.requiresAuth ? (
                    localStorage.getItem("token") ? (
                      <route.component />
                    ) : (
                      <GetAuthentication />
                    )
                  ) : (
                    <route.component />
                  )
                }
              />
            ))}
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
