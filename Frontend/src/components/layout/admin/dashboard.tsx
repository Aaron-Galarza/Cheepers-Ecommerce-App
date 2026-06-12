import React, { useState, useEffect } from 'react';
import styles from '../css/dashboard.module.css';
import { FaHamburger, FaPizzaSlice, FaImages, FaChartBar, FaSignOutAlt, FaThLarge, FaClipboardList, FaFire } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';
import ProductManagement from '../../../pages/management/productmanagement';
import OrdersManagement from '../../../pages/management/ordersmanagement'; 
import PromoManagement from '../../../pages/management/promomanagement'; 
import VentasManagement from '../../../pages/management/ventasmanagement'; 
import authService from '../../../services/authservice'; 
import AdminGallery from '../../../pages/management/galeria/AdminGallery';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('welcome');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin/login');
    }
    document.body.classList.add('dashboardPage');
    return () => {
      document.body.classList.remove('dashboardPage');
    };
  }, [navigate]);

  const handleLogout = () => {
    authService.logout(); 
    navigate('/admin/login'); 
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'products': return <ProductManagement />;
      case 'promos': return <PromoManagement />;
      case 'sales': return <VentasManagement />;
      case 'orders': return <OrdersManagement />;
      case 'gallery': return <AdminGallery/>;
      case 'welcome':
      default:
        return (
          <>
            <h1>Bienvenido al Panel de Administración</h1>
            <p>Desde aquí podés gestionar tus productos, promociones y más.</p>
            <div className={styles.cardsContainer}>
              <div className={styles.card}>
                <h3>Productos</h3>
                <p>Gestión de hamburguesas, papas, bebidas, etc.</p>
              </div>
              <div className={styles.card}>
                <h3>Promociones</h3>
                <p>Agregá, editá o eliminá promociones destacadas.</p>
              </div>
              <div className={styles.card}>
                <h3>Pedidos</h3>
                <p>Visualizá y gestioná los pedidos realizados por los clientes.</p>
              </div>
              <div className={styles.card}>
                <h3>Estadísticas</h3>
                <p>Revisá el rendimiento de tu negocio.</p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>CHEEPERS <span className={styles.admin}>ADMIN</span></h2>
        <nav className={styles.nav}>
          <a href="#" className={styles.navItem} onClick={(e) => { e.preventDefault(); setActiveSection('welcome'); }}>
            <span><FaThLarge /></span> Panel
          </a>
          <a href="#" className={styles.navItem} onClick={(e) => { e.preventDefault(); setActiveSection('products'); }}>
            <span><FaHamburger /></span> Productos
          </a>
          <a href="#" className={styles.navItem} onClick={(e) => { e.preventDefault(); setActiveSection('promos'); }}>
            <span><FaPizzaSlice /></span> Promos
          </a>
          <a href="#" className={styles.navItem} onClick={(e) => { e.preventDefault(); setActiveSection('sales'); }}>
            <span><FaChartBar /></span> Ventas
          </a>
          <a href="#" className={styles.navItem} onClick={(e) => { e.preventDefault(); setActiveSection('orders'); }}>
            <span><FaClipboardList /></span> Pedidos
          </a>
          <a href="#" className={styles.navItem} onClick={(e) => { e.preventDefault(); setActiveSection('gallery'); }}>
            <span><FaImages /></span> Galería
          </a>

          {/* BOTÓN PARA IR A LA COCINA CORREGIDO (SIN DIV) */}
         {/* BOTÓN DE COCINA COMPACTO */}
          <a 
            href="#" 
            className={styles.navItem} 
            onClick={(e) => { e.preventDefault(); navigate('/kitchen'); }}
            style={{ 
              color: '#fca311', 
              fontWeight: 'bold',
              marginTop: '5px', /* Le bajamos de 30px a 5px */
              borderTop: '1px solid rgba(255,255,255,0.1)', 
              paddingTop: '8px' 
            }}
          >
            <span><FaFire /></span> Vista Cocina
          </a>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <span className={styles.logoutIcon}><FaSignOutAlt /></span>
          Cerrar Sesión
        </button>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;