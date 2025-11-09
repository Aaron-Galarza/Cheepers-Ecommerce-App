import React, { useState, useEffect } from 'react';
import styles from '../css/dashboard.module.css';
import { FaHamburger, FaPizzaSlice, FaImages, FaChartBar, FaSignOutAlt, FaThLarge, FaClipboardList,FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ProductManagement from '../../../pages/management/productmanagement';
import OrdersManagement from '../../../pages/management/ordersmanagement'; // Importa el componente OrdersManagement
import PromoManagement from '../../../pages/management/promomanagement'; // Gestión de promociones
import VentasManagement from '../../../pages/management/ventasmanagement'; // Importa el componente VentasManagement
import authService from '../../../services/authservice'; // Servicio de autenticación
import AdminGallery from '../../../pages/management/galeria/AdminGallery'
import Puntosmanagement from '../../../pages/management/puntos/puntosmanagement';
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('welcome');

  useEffect(() => {
    // Verifica la autenticación al montar el componente
    if (!authService.isAuthenticated()) {
      navigate('/admin/login');
    }

    // Añade la clase 'dashboardPage' al body para estilos específicos
    document.body.classList.add('dashboardPage');
    // Función de limpieza para remover la clase cuando el componente se desmonte
    return () => {
      document.body.classList.remove('dashboardPage');
    };
  }, [navigate]); // Dependencia 'navigate' para asegurar que el efecto se ejecute si cambia

  const handleLogout = () => {
    authService.logout(); // Usa el servicio de autenticación para cerrar sesión
    navigate('/admin/login'); // Redirige al login después de cerrar sesión
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'products':
        return <ProductManagement />;
      case 'promos':
        return <PromoManagement />; // Renderiza el componente de gestión de promociones
      case 'sales':
        return <VentasManagement />; // ¡Aquí se renderiza VentasManagement!
      case 'orders': // Caso para la gestión de pedidos
        return <OrdersManagement />; {/* Renderiza el componente OrdersManagement */}
        case 'gallery': // Caso para la gestión de pedidos
        return <AdminGallery/>; {/* Renderiza el componente OrdersManagement */}
        case 'points':
        return <Puntosmanagement/>; {/* Renderiza el componente OrdersManagement */}
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
          <a href="#" className={styles.navItem} onClick={() => setActiveSection('welcome')}>
            <span><FaThLarge /></span> Panel
          </a>
          <a href="#" className={styles.navItem} onClick={() => setActiveSection('products')}>
            <span><FaHamburger /></span> Productos
          </a>
          <a href="#" className={styles.navItem} onClick={() => setActiveSection('promos')}>
            <span><FaPizzaSlice /></span> Promos
          </a>
          <a href="#" className={styles.navItem} onClick={() => setActiveSection('sales')}>
            <span><FaChartBar /></span> Ventas
          </a>
          <a href="#" className={styles.navItem} onClick={() => setActiveSection('orders')}>
            <span><FaClipboardList /></span> Pedidos
          </a>
          <a href="#" className={styles.navItem} onClick={() => setActiveSection('gallery')}>
            <span><FaImages /></span> Galeria
          </a>
            <a href="#" className={styles.navItem} onClick={() => setActiveSection('points')}>
            <span><FaStar /></span> Puntos
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
