import React from 'react'; // Importa React
import ReactDOM from 'react-dom/client'; // Importa ReactDOM para renderizar en el DOM
import App from './App.tsx'; // Importa tu componente principal App
import './index.css'; // Importa los estilos globales (incluye variables y base)

// Importa BrowserRouter para el ruteo en la aplicación
// Este es el componente que habilita el ruteo en toda la app.
import { BrowserRouter } from 'react-router-dom';


// Obtiene el elemento del DOM donde se montará la app (el <div id="root"> en index.html)
const rootElement = document.getElementById('root');

// Asegura que el elemento exista antes de intentar crear la raíz
if (rootElement) {
  // Crea la raíz de React 18+
  const root = ReactDOM.createRoot(rootElement);

  // Renderiza la aplicación
  root.render(
    // React.StrictMode es útil para detectar problemas en desarrollo
    <React.StrictMode>
      {/* Envuelve tu componente App con BrowserRouter para habilitar el ruteo */}
      {/* BrowserRouter DEBE envolver tu componente raíz (App) AQUI, no dentro de App.tsx */}
      <BrowserRouter>
        <App /> {/* Renderiza el componente App principal */}
      </BrowserRouter>
    </React.StrictMode>,
  );
} else {
  // Muestra un error si el elemento root no se encuentra
  console.error('No se encontró el elemento con ID "root". Asegúrate de que tu index.html tenga <div id="root"></div>');
}