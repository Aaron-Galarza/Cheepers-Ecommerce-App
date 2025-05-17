// src/pages/Inicio.tsx
import React from "react";
import Carousel from "../components/layout/carousel";
import sucursal from "../assets/images/sucursal.jpg";
import styles from "./inicio.module.css";

const Inicio: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* Carrusel */}
      <Carousel />

      {/* Sobre Nosotros */}
      <section className={styles.section}>
        <h2 className={styles.title}>Sobre Nosotros</h2>
        <p className={styles.text}>
          En <span className="font-semibold text-red-600">Cheepers</span>, nos enorgullece
          ofrecer las hamburguesas más deliciosas y artesanales de la ciudad. Desde el
          año <span className="font-medium">2025</span>, hemos crecido junto a nuestros
          clientes, perfeccionando cada receta y seleccionando los mejores ingredientes
          para llevar el sabor a otro nivel. Vení a conocernos y disfrutá de una
          experiencia única.
        </p>
      </section>

      {/* Nuestra Sucursal */}
      <section className={styles.section}>
        <h2 className={styles.title}>Nuestra Sucursal</h2>
        <div className={`${styles.grid} ${styles.gridCols}`}>
          <div className={styles.imageContainer}>
            <img
              src={sucursal}
              alt="Sucursal Cheepers"
              className={styles.image}
            />
          </div>
          <div className={styles.info}>
            <h3 className={styles.subtitle}>Dirección</h3>
            <p className={styles.text}>Avenida Siempreviva 742, Springfield</p>
            <a
              href="https://maps.google.com/?q=Avenida+Siempreviva+742,+Springfield"
              target="_blank"
              rel="noreferrer"
              className={styles.button}
            >
              Ver en Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Inicio;
