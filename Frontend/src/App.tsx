
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

import Header from './components/layout/header';
import HomePage from './pages/inicio';
import MenuPage from './pages/menu';
import CarritoPage from './pages/carrito';
import PromosPage from './pages/promos';
import AdminLoginPage from './pages/login';
import Dashboard from './components/layout/dashboard';
import CheckoutPage from './pages/checkout';
import OrderConfirmationPage from './components/layout/ordenconfirmation';

// Importa el nuevo ProtectedRoute
import ProtectedRoute from './components/layout/protectedroute'; // CAMBIO AQUÍ

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
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          {/* Protege la ruta del Dashboard */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute> {/* Envuelve el Dashboard con ProtectedRoute */}
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
