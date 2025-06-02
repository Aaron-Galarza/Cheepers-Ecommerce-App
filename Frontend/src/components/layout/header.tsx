import React, { useState } from 'react';
// Importa NavLink en lugar de Link
import { NavLink } from 'react-router-dom';
import logo from '../../assets/images/logocheepers.png'; // Importa tu logo (ajusta la ruta si es necesario)
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi'; // Importa un icono de hamburguesa
import { useCart } from './cartcontext'; // Asegurate de esta ruta

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useCart(); // Obtenemos el carrito
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="logo">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "logo-link active-logo-link" : "logo-link"
          }
          end
        >
          <img src={logo} alt="Logo de Cheepers" className="logo-image" />
          <span className="logo-text">CHEEPERS</span>
        </NavLink>
      </div>

      <button className="mobile-menu-button" onClick={toggleMobileMenu}>
        <GiHamburgerMenu />
      </button>

      <nav className={`nav ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "navLink active-nav-link" : "navLink"
          }
          end
        >
          Inicio
        </NavLink>

        <NavLink
          to="/menu"
          className={({ isActive }) =>
            isActive ? "navLink active-nav-link" : "navLink"
          }
        >
          Menú
        </NavLink>

        <NavLink
          to="/promos"
          className={({ isActive }) =>
            isActive ? "navLink active-nav-link" : "navLink"
          }
        >
          Promos
        </NavLink>

        <NavLink
          to="/sobre-nosotros"
          className={({ isActive }) =>
            isActive ? "navLink active-nav-link" : "navLink"
          }
        >
          Sobre Nosotros
        </NavLink>
      </nav>

      <div className="navActions">
        <NavLink
          to="/carrito" // ahora enlaza a la página de carrito
          className={({ isActive }) =>
            isActive ? "actionButton active-action-button" : "actionButton"
          }
        >
          <FaShoppingCart />
          {totalItems > 0 && (
            <span className="badge">{totalItems}</span>
          )}
        </NavLink>
        <NavLink
          to="/admin/login"
          className={({ isActive }) =>
            isActive ? "actionButton active-action-button" : "actionButton"
          }
        >
          <FaUser />
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
