import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { keepAliveService } from './services/keepAlive';

// Start keep-alive service for backend on free tier
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
if (import.meta.env.PROD) {
  // Only run keep-alive in production (when deployed)
  keepAliveService.start(apiBaseUrl);
  console.log('🔄 Keep-alive service started for:', apiBaseUrl);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);