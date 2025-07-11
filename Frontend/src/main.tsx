// src/main.tsx o src/index.tsx
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import { BrowserRouter } from 'react-router-dom'; // <--- ¡Importa esto!
    import App from './App';
    import './index.css'; // O './App.css' si es tu archivo CSS principal

    // Importa tu CartProvider
    import { CartProvider } from './components/layout/cartcontext'; // Asegúrate de que la ruta sea correcta

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        {/* ¡ESTO ES LO MÁS IMPORTANTE! BrowserRouter DEBE ENVOLVER TODO */}
        <BrowserRouter>
          {/* El CartProvider también debe estar dentro de BrowserRouter */}
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
      </React.StrictMode>,
    );
    