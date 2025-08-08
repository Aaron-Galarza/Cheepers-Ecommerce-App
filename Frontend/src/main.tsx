// src/main.tsx o src/index.tsx
import React, { useEffect } from 'react'; // Importa useEffect
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './global/App';
import './global/index.css';

// Importa tu CartProvider
import { CartProvider } from './components/layout/checkout/cartcontext';

// Importa ToastContainer y toast para las advertencias
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      [key: string]: any;
    };
  }
}


// === INICIO: Código para desactivar React DevTools en producción (ya lo tenías) ===
if (import.meta.env.PROD) {
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    for (const prop in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      if (prop.startsWith('__')) {
        delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop];
      }
    }
  }
}
// === FIN: Código para desactivar React DevTools en producción ===

const RootApp: React.FC = () => {
  // === INICIO: Lógica para la detección de DevTools ===
  useEffect(() => {
    // Variable para saber si ya mostramos la advertencia
    let hasWarned = false;

    // Método 1: Basado en el tamaño de la ventana.
    // Las DevTools a menudo redimensionan la ventana visible del navegador.
    // Esto es un heurística y puede tener falsos positivos.
    const threshold = 160; // Umbral de cambio de ancho/alto para considerar DevTools
    const checkSize = () => {
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        if (!hasWarned) {
          toast.warn('¡Detectamos que las herramientas de desarrollo están abiertas! no hagas un mal uso 🧐', {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          hasWarned = true;
        }
      } else {
        // Reiniciar la advertencia si las DevTools se cierran
        if (hasWarned) {
          hasWarned = false;
        }
      }
    };

    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', checkSize);

    // Ejecutar una primera vez al cargar
    checkSize();


    return () => {
      window.removeEventListener('resize', checkSize);
      // clearInterval(interval); // Si usas el método 2
    };
  }, []); // Se ejecuta solo una vez al montar el componente
  // === FIN: Lógica para la detección de DevTools ===

  return (
    <React.StrictMode>
      {/* ToastContainer debe estar presente en un componente accesible para que los toasts se muestren */}
      <ToastContainer />
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<RootApp />);