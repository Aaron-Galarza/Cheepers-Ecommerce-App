import React, { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import { FaHamburger, FaPizzaSlice, FaUserShield, FaChartBar, FaSignOutAlt, FaThLarge } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ProductManagement from './productmanagement';
import authService from '../../services/authservice'; // Ruta correcta según tu estructura

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('welcome');

  // 🔐 Verifica autenticación al cargar
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
      case 'products':
        return <ProductManagement />;
      case 'promos':
        return (
          <div>
            <h2>Gestión de Promociones</h2>
            <p>Aquí podrás agregar, editar y eliminar promociones.</p>
          </div>
        );
      case 'sales':
        return (
          <div>
            <h2>Reportes de Ventas</h2>
            <p>Aquí podrás ver las estadísticas de ventas.</p>
          </div>
        );
      case 'clients':
        return (
          <div>
            <h2>Gestión de Clientes</h2>
            <p>Aquí podrás ver y gestionar la información de tus clientes.</p>
          </div>
        );
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
                <h3>Clientes</h3>
                <p>Registro de los clientes que realizaron pedidos.</p>
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
          <a href="#" className={styles.navItem} onClick={() => setActiveSection('clients')}>
            <span><FaUserShield /></span> Clientes
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