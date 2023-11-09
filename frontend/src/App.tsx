import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AdminLayout from "./components/layout/AdminLayout";
import "./scss/style.scss";
const App: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="*" element={<AdminLayout />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
