import React from 'react';
import styles from './dashboard.module.css'; // Asegúrate de que esta ruta sea correcta
import { FaHamburger, FaPizzaSlice, FaUserShield, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken'); // CAMBIO: sessionStorage -> localStorage
    navigate('/admin/login');
  };

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>CHEEPERS <span className={styles.admin}>ADMIN</span></h2>
        <nav className={styles.nav}>
          <a href="#" className={styles.navItem}><span><FaHamburger /></span> Productos</a>
          <a href="#" className={styles.navItem}><span><FaPizzaSlice /></span> Promos</a>
          <a href="#" className={styles.navItem}><span><FaChartBar /></span> Ventas</a>
          <a href="#" className={styles.navItem}><span><FaUserShield /></span> Clientes</a>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.mainHeader}>
          <h1>Bienvenido al Panel de Administración</h1>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <span className={styles.logoutIcon}>
              <FaSignOutAlt />
            </span>
            Cerrar Sesión
          </button>
        </div>
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
      </main>
    </div>
  );
};

export default Dashboard;