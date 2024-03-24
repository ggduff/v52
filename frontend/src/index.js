// index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Note the change here
import './index.css';
import App from './App';

// Use createRoot to manage the root of your app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);