// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './lib/i18n';

// Import the AuthProvider
import { AuthProvider } from './contexts/AuthContext.jsx';
// 1. Import the NotificationsProvider
import { NotificationsProvider } from './contexts/NotificationsContext.jsx';

// React 18 root API mounts your whole app.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <React.Suspense fallback={null}>
      <AuthProvider>
        {/* 2. Wrap the App component with the NotificationsProvider */}
        {/* This ensures any component inside App can access notification data */}
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </AuthProvider>
    </React.Suspense>
  </React.StrictMode>,
);