import React from 'react';
import styles from './dashboard.module.css';
import { FaHamburger, FaPizzaSlice, FaUserShield, FaChartBar } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>CHEEPERS <span className={styles.admin}>ADMIN</span></h2>
        <nav className={styles.nav}>
          <a href="#" className={styles.navItem}><FaHamburger /> Productos</a>
          <a href="#" className={styles.navItem}><FaPizzaSlice /> Promos</a>
          <a href="#" className={styles.navItem}><FaChartBar /> Ventas</a>
          <a href="#" className={styles.navItem}><FaUserShield /> Clientes</a>
        </nav>
      </aside>

      <main className={styles.mainContent}>
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
      </main>
    </div>
  );
};

export default Dashboard;
