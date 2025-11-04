import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../../assets/images/logocheepers.webp';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';
import { useCart } from '../checkout/cartcontext';
import styles from './../css/header.module.css';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles['logo-container']}>
        <NavLink to="/" className={styles['logo-link']} end>
          <img src={logo} alt="Logo de Cheepers" className={styles['logo-image']} />
          <span className={styles['logo-text']}>CHEEPERS</span>
        </NavLink>
      </div>

      <nav className={`${styles['nav-links']} ${isMobileMenuOpen ? styles.open : ''}`}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          onClick={() => setIsMobileMenuOpen(false)} // Cierra el menú al hacer clic
        >
          Inicio
        </NavLink>
        <NavLink
          to="/menu"
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          onClick={() => setIsMobileMenuOpen(false)} // Cierra el menú al hacer clic
        >
          Menú
        </NavLink>
        <NavLink
          to="/promos"
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          onClick={() => setIsMobileMenuOpen(false)} // Cierra el menú al hacer clic
        >
          Promos
        </NavLink>
      </nav>

      {/* Unificamos los botones de acción y el toggle de menú en un solo contenedor */}
      <div className={styles['header-actions']}>
        <NavLink
          to="/carrito"
          className={({ isActive }) =>
            isActive ? `${styles['action-button']} ${styles.active}` : styles['action-button']
          }
        >
          <FaShoppingCart />
          {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
        </NavLink>
        {/* El botón de usuario solo se muestra en desktop, se oculta en móvil vía CSS */}
        <NavLink
          to="/admin/login"
          className={({ isActive }) =>
            isActive ? `${styles['action-button']} ${styles.active} ${styles['user-button-desktop']}` : `${styles['action-button']} ${styles['user-button-desktop']}`
          }
        >
          <FaUser />
        </NavLink>
        <button className={styles['menu-toggle']} onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
          <GiHamburgerMenu />
        </button>
      </div>
    </header>
  );
};

export default Header;