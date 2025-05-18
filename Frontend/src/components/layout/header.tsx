import React, { useState } from 'react';
// Importa NavLink en lugar de Link
import { NavLink } from 'react-router-dom';
import logo from '../../assets/images/logocheepers.png'; // Importa tu logo (ajusta la ruta si es necesario)
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi'; // Importa un icono de hamburguesa

// Si estás usando CSS Modules para el header, importa los estilos así:
// import styles from './header.module.css';
// Si usas clases globales en App.css o index.css, no necesitas importar 'styles' aquí.

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    // Asumo que las clases como "header", "logo", "nav", etc. están definidas en un CSS global (App.css/index.css)
    // Si usas CSS Modules, cambia className="clase" por className={styles.clase}
    <header className="header">
      {/* Contenedor para el logo y el nombre de la marca */}
      <div className="logo">
        {/* Usamos NavLink para el logo si es un enlace a la página de inicio */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "logo-link active-logo-link" : "logo-link" // Clases globales de ejemplo
          }
          end // Asegura que solo esté activo en la ruta exacta '/'
        >
          <img src={logo} alt="Logo de Cheepers" className="logo-image" />
          <span className="logo-text">CHEEPERS</span>
        </NavLink>
      </div>

      {/* Botón para el menú desplegable en pantallas pequeñas */}
      <button className="mobile-menu-button" onClick={toggleMobileMenu}>
        <GiHamburgerMenu />
      </button>

      {/* Contenedor para la navegación, se mostrará/ocultará en móviles */}
      {/* Las clases 'nav' y 'mobile-menu-open' son para el menú móvil, mantente como las tengas */}
      <nav className={`nav ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        {/* Usamos NavLink para cada enlace de navegación */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "navLink active-nav-link" : "navLink" // Aplica 'active-nav-link' si está activo
          }
          end // Asegura que solo esté activo en la ruta exacta '/'
        >
          Inicio
        </NavLink>

        <NavLink
          to="/menu"
          className={({ isActive }) =>
            isActive ? "navLink active-nav-link" : "navLink" // Aplica 'active-nav-link' si está activo
          }
        >
          Menú
        </NavLink>

        <NavLink
          to="/promos"
          className={({ isActive }) =>
            isActive ? "navLink active-nav-link" : "navLink" // Aplica 'active-nav-link' si está activo
          }
        >
          Promos
        </NavLink>

        <NavLink
          to="/sobre-nosotros" // Asegúrate de que la ruta coincida con tu App.tsx
          className={({ isActive }) =>
            isActive ? "navLink active-nav-link" : "navLink" // Aplica 'active-nav-link' si está activo
          }
        >
          Sobre Nosotros
        </NavLink>

        {/* Si tienes más enlaces de navegación, conviértelos a NavLink de manera similar */}

      </nav>

      {/* Iconos de acción (Carrito, Usuario) - Usamos NavLink si son enlaces */}
      <div className="navActions">
         <NavLink
           to="/checkout" // Asegúrate de que la ruta coincida con tu App.tsx
           className={({ isActive }) =>
             isActive ? "actionButton active-action-button" : "actionButton" // Aplica 'active-action-button' si está activo
           }
         >
           <FaShoppingCart />
         </NavLink>
         <NavLink
           to="/admin/login" // Asegúrate de que la ruta coincida con tu App.tsx
           className={({ isActive }) =>
             isActive ? "actionButton active-action-button" : "actionButton" // Aplica 'active-action-button' si está activo
           }
         >
           <FaUser />
         </NavLink>
      </div>
    </header>
  );
};

export default Header;