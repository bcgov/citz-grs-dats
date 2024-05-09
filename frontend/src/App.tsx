import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { bcGovTheme } from "./assets/themes/bcGovTheme";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import { routes as appRoutes } from "./routes";
import Layout from "./components/layout/MainLayout"
import Callback from "./Callback";
import TokenReceived from "./TokenReceived";
import useAuthCheck from "./utils/checkAuthentication";
//import { bcGovTheme } from "./assets/themes/bcGovTheme";

function App() {
  return (
<ThemeProvider theme={bcGovTheme}>
      <CssBaseline />
      <Router>
        <div>
          <nav>
          <button onClick={() => window.location.href = 'http://localhost:5000/login'}>Login</button>
          <button >Logout</button>
          </nav>
          <Routes>
          <Route path="/" />
          <Route path="/callback" element={<Callback />} />
          <Route path="/tokenReceived" element={<TokenReceived />} />
          <Route path="/home" element={<ProtectedPageWrapper />} />
        </Routes>

        </div>
      </Router>
    </ThemeProvider>
  );
}

function ProtectedPageWrapper() {
  useAuthCheck();
  return (
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
                      <route.component />
                    )
                  ) : (
              
                    <route.component />
                  )
                }
              />
            ))}
          </Routes>
        </Layout>
  );
} 

export default App;
