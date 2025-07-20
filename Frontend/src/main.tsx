// src/main.tsx o src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <--- ¡Esto es fundamental!
import App from './App';
import './index.css'; // O './App.css' si es tu archivo CSS principal

// Importa tu CartProvider
import { CartProvider } from './components/layout/cartcontext'; // Asegúrate de que la ruta sea correcta

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* BrowserRouter DEBE ENVOLVER TODO el árbol de componentes que usará rutas */}
    <BrowserRouter>
      {/* CartProvider también debe estar dentro de BrowserRouter para que el contexto funcione en las rutas */}
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
);