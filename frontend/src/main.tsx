import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeProvider';
import { AppSettingsProvider } from './contexts/AppSettingsContext';
import './global.css';
import App from './App';

// Créer l'élément racine et rendre l'application
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}>
      <AppSettingsProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </AppSettingsProvider>
    </Router>
  </React.StrictMode>
);
