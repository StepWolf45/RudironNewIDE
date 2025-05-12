// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Главный компонент приложения
import 'antd/dist/reset.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);