import React from 'react';
// Importa el componente Link de react-router-dom para la navegación
import { Link } from 'react-router-dom';

// Importa los estilos donde definimos las clases del Header (.header, .nav, etc.)
// !!! RUTA CORREGIDA: './../App.css' significa "sube un nivel (a components/), luego busca App.css" !!!
// Alternativamente, puedes usar '../App.css' que es lo mismo
import '../../App.css'; // <--- RUTA CORREGIDA AQUÍ

// Si prefieres tener estilos específicos SOLO para el Header:
// 1. Crea un archivo src/components/Layout/Header.css
// 2. Mueve todas las reglas CSS de .header, .logo, .nav, .navLink, .navActions, .actionButton, .logo-text de App.css a Header.css
// 3. Importa './Header.css' aquí en lugar de '../App.css'

function Header() {
  return (
    // Usamos la etiqueta <header> semántica y la clase CSS .header
    <header className="header">

      {/* Contenedor para el logo o el nombre de la marca */}
      <div className="logo"> {/* Clase CSS .logo */}
        {/*
          Usamos el componente Link para que al hacer clic en el logo/nombre,
          vuelva a la página principal (path="/").
          className="logo-text" será para dar estilos específicos al texto "CHEEPERS".
          Puedes reemplazar el texto "CHEEPERS" por un <img> si tienes un archivo de logo.
        */}
        <Link to="/">
          {/*
            Aquí va el nombre de la marca "CHEEPERS".
            Usa una etiqueta (ej. <span>, <h1>) y una clase para darle estilo grande y buena fuente.
          */}
          <span className="logo-text">CHEEPERS</span> {/* Clase CSS .logo-text */}
          {/* O si usas una imagen de logo: */}
          {/* <img src="/public/cheepers-logo.png" alt="Logo Cheepers" style={{ height: '45px' }} /> */}
        </Link>
      </div>

      {/* Menú de navegación principal */}
      {/* La clase CSS .nav se ocultará automáticamente en mobile gracias a los media queries en App.css */}
      <nav className="nav"> {/* Clase CSS .nav */}
        {/*
          Usamos el componente Link de react-router-dom para cada enlace de navegación.
          Esto permite la navegación SPA sin recargar la página.
          Aplica la clase CSS .navLink a cada enlace.
        */}
        <Link to="/" className="navLink">Inicio</Link>
        <Link to="/catalogo" className="navLink">Menú</Link> {/* O "/menu" si esa es la ruta */}
        <Link to="/contacto" className="navLink">Contacto</Link>
        <Link to="/sobre-nosotros" className="navLink">Sobre Nosotros</Link> {/* O "/nosotros" */}
        {/* Añade otros enlaces si los necesitas, ej: Promos */}
        {/* <Link to="/promociones" className="navLink">Promos</Link> */}
      </nav>

      {/* Botones de acción (Carrito y Login Admin) */}
      <div className="navActions"> {/* Clase CSS .navActions */}
        {/* Botón de Carrito */}
        {/* Usamos un <button> simple con la clase CSS .actionButton. Puedes poner un ícono SVG aquí. */}
        <button className="actionButton">🛒</button> {/* Reemplaza 🛒 por un ícono real si usas react-icons */}

        {/* Botón/Enlace de Login Admin */}
        {/* Usamos un Link con la clase CSS .actionButton si es un enlace a otra página */}
        <Link to="/admin/login" className="actionButton">🔑</Link> {/* O usa un ícono de usuario si tienes react-icons */}
      </div>

      {/*
        OPCIONAL: Aquí podrías añadir un botón de "hamburguesa"
        que aparezca SOLO en mobile para abrir/cerrar un menú lateral o desplegable.
        Necesitarías lógica JavaScript/React (estado, manejadores de eventos)
        y estilos CSS adicionales para este menú mobile. Por ahora, el .nav simplemente se oculta.
      */}

    </header>
  );
}

// Exporta el componente para poder usarlo en App.tsx
export default Header;