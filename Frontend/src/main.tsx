import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './global/App';
import './global/index.css'; // O './App.css' si es tu archivo CSS principal

// Importa tu CartProvider
import { CartProvider } from './components/layout/checkout/cartcontext'; // Asegúrate de que la ruta sea correcta

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      [key: string]: any; // Permite cualquier propiedad en el hook
    };
  }
}

if (import.meta.env.PROD) {
  // Comprueba si el hook global de React DevTools existe
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    // Itera sobre las propiedades del hook y las elimina.
    // Las propiedades de DevTools suelen empezar con '__'.
    for (const prop in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      if (prop.startsWith('__')) {
        // Elimina la propiedad para evitar que DevTools se conecte
        delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop];
      }
    }
  }
}
// === FIN: Código para desactivar React DevTools en producción ===

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