import React from "react";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import AppSidebar from "./AppSidebar";
import AppContent from "./AppContent";

const AdminLayout = () => {
  return (
    <div>
      {/* <AppSidebar /> */}
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  );
};

export default AdminLayout;
