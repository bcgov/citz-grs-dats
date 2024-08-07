import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useSSO } from '@bcgov/citz-imb-sso-react';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useSSO();    
  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
