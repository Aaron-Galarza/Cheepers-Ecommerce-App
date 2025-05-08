import React from 'react';
// Importa SOLO los componentes y hooks necesarios para USAR el ruteo (NO BrowserRouter aquí)
import { Routes, Route } from 'react-router-dom'; // Importamos Routes y Route para definir las rutas

// Importa los archivos CSS adaptados (index.css ya está importado en main.tsx)
import './App.css';

// !!! IMPORTA EL COMPONENTE HEADER DESDE SU UBICACIÓN CORRECTA !!!
// Asegúrate de que la ruta './components/Layout/Header' sea correcta desde src/
import Header from './components/layout/header';

// --- Componentes Placeholder (ELIMINA ESTOS CUANDO CREES LOS ARCHIVOS Y COMPONENTES REALES) ---
// Si ya creaste el archivo HomePage.tsx, descomenta la línea de importación arriba
// y elimina esta función placeholder. Haz lo mismo para las demás páginas.
function HomePage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Página Principal (WIP)</h2>
      <p>Contenido del Hero, Destacados, etc. irán aquí.</p>
    </div>
  );
}

function CatalogPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Página de Catálogo (WIP)</h2>
      <p>Lista completa de productos.</p>
    </div>
  );
}

function CheckoutPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Página de Checkout (WIP)</h2>
      <p>Formulario para finalizar pedido.</p>
    </div>
  );
}

function PromosPage() { 
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Página de Promos (WIP)</h2> {/* Y el título */}
      <p>Info de promos y descuentos.</p>
    </div>
  );
}

function AdminLoginPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Página de Login Admin (WIP)</h2>
      <p>Formulario para administradores.</p>
    </div>
  );
}

// Mantén este Placeholder Footer si aún no creaste Footer.tsx en ./components/Layout/
function Footer() {
  return (
    // Pie de página simple con estilos inline (puedes usar clases CSS después)
    <footer style={{ backgroundColor: '#333', color: 'white', padding: '20px', textAlign: 'center', marginTop: 'auto' }}>
      <p>© 2025 Cheepers. Todos los derechos reservados.</p>
      {/* Aquí podrías añadir enlaces rápidos, redes sociales, etc. */}
    </footer>
  );
}
// --- FIN Componentes Placeholder ---


// --- Componente Principal de la Aplicación ---
function App() {
  return (
    // Contenedor principal de la app con la clase CSS .app
    // Define la estructura general que contendrá el Header, el Contenido de la Página y el Footer
    <div className="app">

      {/* Renderiza el componente Header importado */}
      {/* Ya NO es la función placeholder definida aquí. */}
      <Header />

      {/*
        El componente <Routes> de react-router-dom.
        Define qué componente de "página" se renderiza
        basándose en la URL actual (path).
      */}
      {/*
        Un contenedor <main> para el contenido principal de la página.
        flexGrow: 1 en inline style (o en CSS) ayuda a que el footer se vaya al fondo si .app es flex column.
      */}
      <main style={{ flexGrow: 1 }}>
        <Routes>
          {/*
            Define cada <Route>.
            path: la URL de la página.
            element: el componente React que se debe renderizar para esa URL.
          */}
          {/* Ruta para la página principal */}
          <Route path="/" element={<HomePage />} /> {/* Usando el Placeholder HomePage */}

          {/* Rutas para las otras páginas de la aplicación */}
          <Route path="/catalogo" element={<CatalogPage />} /> {/* Usando el Placeholder CatalogPage */}
          <Route path="/checkout" element={<CheckoutPage />} /> {/* Usando el Placeholder CheckoutPage */}
          <Route path="/promos" element={<PromosPage />} /> {/* Usando el Placeholder PromosPage */}

          {/* Rutas de la sección de Administración */}
          <Route path="/admin/login" element={<AdminLoginPage />} /> {/* Usando el Placeholder AdminLoginPage */}
          {/* !!! Agrega rutas para Admin Products, Admin Orders, etc. aquí cuando crees esas páginas !!! */}
          {/* <Route path="/admin/productos" element={<AdminProductsPage />} /> */}
          {/* <Route path="/admin/pedidos" element={<AdminOrdersPage />} /> */}


          {/*
            Ruta para manejar URLs no encontradas (opcional).
            Asegúrate de crear un componente <NotFoundPage /> y descomenta la línea.
          */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </main>


      {/* Renderiza el componente Footer (o su contenido directo) */}
      {/* Si creaste un componente Footer.tsx, úsalo aquí: <Footer /> */}
      <Footer /> {/* Usando el Placeholder Footer por ahora */}

    </div>
  );
}

// Exporta el componente App para que main.tsx pueda usarlo
export default App;
