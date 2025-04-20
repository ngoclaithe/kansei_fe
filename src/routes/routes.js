import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
// import ManagerRides from '../pages/ManagerRides';
import PrivateRoute from './PrivateRoute'; 
import { useAuth } from '../context/AuthContext';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    navigate('/');
  }, [navigate, logout]);

  return null;
};

export const routes = [
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute allowedRoles={[1]}>
        <Dashboard />
      </PrivateRoute>
    ),
  },
//   {
//     path: '/manage-rides', 
//     element: (
//       <PrivateRoute allowedRoles={['admin']}>
//         <ManagerRides />
//       </PrivateRoute>
//     ),
//   },
  {
    path: '/logout',
    element: <Logout />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];