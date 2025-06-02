import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

import Header from './components/layout/header';
import HomePage from './pages/inicio';
import MenuPage from './pages/menu';
import CarritoPage from './pages/carrito';
import PromosPage from './pages/promos';
import SobreNosotrosPage from './pages/sobrenosotros';
import AdminLoginPage from './pages/login';

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#333',
        color: '#fff',
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
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/promos" element={<PromosPage />} />
          <Route path="/sobre-nosotros" element={<SobreNosotrosPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
