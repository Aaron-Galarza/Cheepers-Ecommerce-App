import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../../assets/images/cristal logo.jpg';
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
          <img src={logo} alt="Logo de Cristal Bar" className={styles['logo-image']} />
          <div className={styles['logo-wrapper']}>
            <span className={styles['logo-text']}>CRISTAL BAR</span>
            <span className={styles['logo-slogan']}>Est. 1973</span>
          </div>
        </NavLink>
      </div>

      <nav className={`${styles['nav-links']} ${isMobileMenuOpen ? styles.open : ''}`}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Inicio
        </NavLink>
        <NavLink
          to="/menu"
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Menú
        </NavLink>
        <NavLink
          to="/promos"
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Promos
        </NavLink>
      </nav>

      <div className={styles['header-actions']}>
        <NavLink
          to="/carrito"
          className={({ isActive }) =>
            isActive ? `${styles['action-button']} ${styles.active}` : styles['action-button']
          }
          aria-label="Carrito de compras"
        >
          <FaShoppingCart />
          {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
        </NavLink>
        <NavLink
          to="/admin/login"
          className={({ isActive }) =>
            isActive ? `${styles['action-button']} ${styles.active} ${styles['user-button-desktop']}` : `${styles['action-button']} ${styles['user-button-desktop']}`
          }
          aria-label="Cuenta de usuario"
        >
          <FaUser />
        </NavLink>
        <button 
          className={styles['menu-toggle']} 
          onClick={toggleMobileMenu} 
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <GiHamburgerMenu />
        </button>
      </div>
    </header>
  );
};

export default Header;