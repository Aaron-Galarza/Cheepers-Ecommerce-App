import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logocheepers.png'; // Importa tu logo (ajusta la ruta si es necesario)
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi'; // Importa un icono de hamburguesa

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      {/* Contenedor para el logo y el nombre de la marca */}
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Logo de Cheepers" className="logo-image" />
          <span className="logo-text">CHEEPERS</span>
        </Link>
      </div>

      {/* Botón para el menú desplegable en pantallas pequeñas */}
      <button className="mobile-menu-button" onClick={toggleMobileMenu}>
        <GiHamburgerMenu />
      </button>

      {/* Contenedor para la navegación, se mostrará/ocultará en móviles */}
      <nav className={`nav ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <Link to="/" className="navLink">Inicio</Link>
        <Link to="/menu" className="navLink">Menú</Link>
        <Link to="/promos" className="navLink">Promos</Link>
        <Link to="/sobre-nosotros" className="navLink">Sobre Nosotros</Link>
      </nav>

      <div className="navActions">
        <Link to="/checkout" className="actionButton">
          <FaShoppingCart />
        </Link>
        <Link to="/admin/login" className="actionButton">
          <FaUser />
        </Link>
      </div>
    </header>
  );
};

export default Header;