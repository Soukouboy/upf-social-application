/**
 * Point d'entrée principal — UPF Social Network
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// import { startMockApi } from './mocks/mockApi';
// if (import.meta.env.DEV) {
//   // startMockApi();
// }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
