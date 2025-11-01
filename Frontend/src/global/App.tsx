import { Routes, Route } from 'react-router-dom';
import './App.css';
import React, { FC } from 'react';

import Header from '../components/layout/design/header';
import HomePage from '../pages/home/inicio';
import MenuPage from '../pages/menu/menu';
import CarritoPage from '../pages/checkout/carrito';
import PromosPage from '../pages/menu/promos';
import AdminLoginPage from '../pages/admin/login';
import Dashboard from '../components/layout/admin/dashboard';
import CheckoutPage from '../pages/checkout/checkout';
import OrderConfirmationPage from '../pages/checkout/ordenconfirmation';
import ScrollToTop from '../lib/ScrollToTop';
import PremiosPage from '../pages/prize/premios';

// Importa el componente ProtectedRoute
import ProtectedRoute from '../components/layout/admin/protectedroute';

// Importa el nuevo componente ManagementLayout
import ManagementLayout from '../pages/management/ManagementLayout'; // Asegúrate de que esta ruta sea correcta

import { FaFacebook, FaInstagram, FaWhatsapp, FaEnvelope  } from 'react-icons/fa';

const Footer: FC = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Columna Izquierda */}
        <div className="footer-column footer-left">
          <p className="copyright-text">Redes Sociales</p>
          <div className="social-media-icons">
            <a href="https://www.facebook.com/CheepersTBH" target="_blank" rel="noopener noreferrer" className="icon-link">
              <FaFacebook size={20} />
            </a>
            <a href="https://www.instagram.com/cheeperstbh" target="_blank" rel="noopener noreferrer" className="icon-link">
              <FaInstagram size={20} />
            </a>
            <a href="https://wa.me/543624063011" target="_blank" rel="noopener noreferrer" className="icon-link">
              <FaWhatsapp size={20} />
            </a>
          </div>
                 
              <span>+54 3624063011</span>
        </div>

        {/* Columna Central */}
        <div className="footer-column footer-center">
          <p className="footer-text">Todos los derechos reservados. <br /> © 2025 Cheepers TBH</p>
        </div>

        {/* Columna Derecha */}
        <div className="footer-column footer-right">
          <p className="footer-title">Acerca de la Plataforma</p>
          <p className="footer-developer">Desarrollada por AFdevelopers:</p>
          <p className="footer-support-title">Contacto:</p>
          <div className="contact-links">
          <p className="footer-contact">+54 3624250501</p>
            <a href="mailto:AFdevelopers12@gmail.com" className="contact-link">
              <FaEnvelope size={16} />
              <span>AFdevelopers12@gmail.com</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};


function App() {
  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <ScrollToTop /> {/* <-- COLOCA EL COMPONENTE AQUÍ */}
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/promos" element={<PromosPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/premios" element={<PremiosPage />} />

<Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          {/* Rutas Protegidas */}
          {/* Protege el Dashboard (si es una ruta independiente) */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/*
            Protege TODAS las rutas que comienzan con '/management/'.
            Cualquier ruta como /management/ventas, /management/products, etc.,
            pasará por ProtectedRoute y luego será manejada por ManagementLayout.
          */}
          <Route
            path="/management/*"
            element={
              <ProtectedRoute>
                <ManagementLayout />
              </ProtectedRoute>
            }
          />

          {/* Ruta para cualquier otra URL no encontrada */}
          <Route path="*" element={<h1>404: Página no encontrada</h1>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;