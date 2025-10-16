import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Permissions from './pages/Permissions';
import SettingsPage from './pages/SettingsPage';


function App() {
  return (
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Protected routes with Navbar */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/*"
              element={<Layout />}
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="permissions" element={<Permissions />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
  );
}

export default App;
