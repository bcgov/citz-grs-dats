import React from "react";
import { Route, Navigate, RouteProps } from "react-router-dom";

type ProtectedRouteProps = RouteProps;

const ProtectedRoute: React.FC<ProtectedRouteProps> = (props) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to your authentication route if the token is null
    return <Navigate to="http://localhost:5000/auth" />;
  }

  return <Route {...props} />;
};
export default ProtectedRoute;
