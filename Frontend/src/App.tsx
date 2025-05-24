import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';

import Header from './components/layout/header';
import HomePage from './pages/inicio';
import Menu from './pages/menu'; // ✅ Usamos el componente real del menú

// Otros placeholders (si querés los vas reemplazando más adelante)
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
      <h2>Página de Promos (WIP)</h2>
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

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#333',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        marginTop: 'auto',
      }}
    >
      <p>© 2025 Cheepers. Todos los derechos reservados.</p>
    </footer>
  );
}

function App() {
  return (
    <div className="app">
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<Menu />} /> {/* ✅ Ahora muestra el menú real */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/promos" element={<PromosPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
