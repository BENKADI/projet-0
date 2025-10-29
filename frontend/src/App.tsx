import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DynamicThemeProvider } from './components/settings/DynamicThemeSettings';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import SettingsPage from './pages/SettingsPage';
import TestAuth from './pages/TestAuth';


function App() {
  // Enregistrer le Service Worker pour les notifications push
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker enregistré avec succès:', registration);
        })
        .catch((error) => {
          console.error('Erreur enregistrement Service Worker:', error);
        });
    }
  }, []);

  return (
    <DynamicThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/test-auth" element={<TestAuth />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected routes with Navbar */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="settings/*" element={<SettingsPage />} />
              <Route path="permissions" element={<Navigate to="/settings?tab=permissions" replace />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </DynamicThemeProvider>
  );
}

export default App;
