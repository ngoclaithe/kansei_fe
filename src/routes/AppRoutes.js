import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

import ManageConstructionPage from '../pages/ManageConstructionPage';
import ManageShiftPage from '../pages/ManageShiftPage';
import ManageBookingPage from '../pages/ManageBookingPage';
import ManageCustomerPage from '../pages/ManageCustomerPage';
import ManageUserPage from '../pages/ManageUserPage';

import GuestBookingPage from '../pages/GuestBookingPage';
import HistoryBookingPage from '../pages/HistoryBookingPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />


      <Route path="/manager/booking" element={<ManageBookingPage/>} />
      <Route path="/manager/construction" element={<ManageConstructionPage/>} />
      <Route path="/manager/shift" element={<ManageShiftPage/>} />
      <Route path="/manager/customer" element={<ManageCustomerPage/>} />
      <Route path="/manager/user" element={<ManageUserPage/>} />


      <Route path="/guest/booking" element={<GuestBookingPage/>} />
      <Route path="/guest/historybooking" element={<HistoryBookingPage/>} />

      
      {/* <Route path="/dashboard" element={<DashboardPage/>} />
      <Route path="/manage-import" element={<ManageImportPage/>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
      <Route path="/activity" element={<ManageActivityPage/>} />
      <Route path="/manage-customer" element={<ManageCustomerPage/>} /> */}

      
      {/* <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />  */}

      
    </Routes>
  );
};

export default AppRoutes;