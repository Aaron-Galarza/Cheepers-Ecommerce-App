import React, { useState } from 'react';
import styles from './inicio.module.css';

import baconcheep from '../assets/images/baconcheep.jpg';
import barbacue from '../assets/images/cheddar.jpg';
import cheddar from '../assets/images/barbacue.jpg';

import { FaWhatsapp, FaPhone, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';

const bannerItems = [
  { image: baconcheep, title: 'BACON CHEEP', descriptionLine1: 'El sabor ahumado', descriptionLine2: 'con bacon crujiente.', callToAction: '¡Pruébala ahora!', altText: 'Hamburguesa Bacon Cheep' },
  { image: barbacue, title: 'BARBACUE DELUXE', descriptionLine1: 'Con nuestra salsa', descriptionLine2: 'barbacoa casera.', callToAction: '¡Sabor inigualable!', altText: 'Hamburguesa Barbacue Deluxe' },
  { image: cheddar, title: 'CHEDDAR EXPLOSION', descriptionLine1: 'Doble carne y', descriptionLine2: 'extra queso cheddar.', callToAction: '¿Te animas a tanto queso?', altText: 'Hamburguesa Cheddar Explosion' },
];

const Inicio: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstItem = currentIndex === 0;
    const newIndex = isFirstItem ? bannerItems.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastItem = currentIndex === bannerItems.length - 1;
    const newIndex = isLastItem ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const currentItem = bannerItems[currentIndex];

  const whatsappPedidosNumber = 'NUMERO_PEDIDOS'; // <-- ¡CAMBIA ESTO!
  const whatsappConsultasNumber = 'NUMERO_CONSULTAS'; // <-- ¡CAMBIA ESTO!
  const whatsappPedidoMessage = 'Hola! Quisiera hacer un pedido.';
  const whatsappConsultaMessage = 'Hola! Tengo una consulta.';


  return (
    <div className={styles.inicioContainer}>
      {/* Sección del Banner Principal */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{currentItem.title}</h1>
          <p className={styles.heroText}>
            {currentItem.descriptionLine1}<br />
            {currentItem.descriptionLine2}
          </p>
          <h2 className={styles.heroCallToAction}>{currentItem.callToAction}</h2>
        </div>
        <div className={styles.heroImageContainer}>
          <img src={currentItem.image} alt={currentItem.altText} className={styles.heroImage}/>
        </div>
        <button onClick={goToPrevious} className={`${styles.bannerButton} ${styles.bannerButtonLeft}`}>❮</button>
        <button onClick={goToNext} className={`${styles.bannerButton} ${styles.bannerButtonRight}`}>❯</button>
      </section>

      {/* SECCIÓN: SOBRE NOSOTROS / CONTACTO CON MAPA Y WHATSAPP */}
      <section className={styles.aboutContactSection}>

        {/* Contenido Principal de Texto (IZQUIERDA en Desktop - YA NO INCLUYE INFO DE CONTACTO) */}
        <div className={styles.aboutContent}>

          <h2 className={styles.aboutMainTitle}>
             Bienvenidos a Cheepers The Burger House, donde la calidad y el precio van de la mano.
          </h2>

          <p className={styles.aboutParagraph}>
             Fundado en 2019 por Ricardo Salas, Cheepers nació con una idea clara: ofrecer
             comida rápida rica, accesible y sin vueltas. Inspirados en grandes cadenas,
             apostamos por un modelo propio con identidad local.
          </p>

          <p className={styles.aboutParagraph}>
             Actualmente contamos con una sucursal en Resistencia, Chaco, y aunque el camino no
             siempre fue fácil, seguimos avanzando con determinación.
             Este año apostamos fuerte por nuestro crecimiento, y por eso
             lanzamos esta nueva página web: como parte de una
             estrategia renovada que nos permita dar finalmente el
             salto que tanto deseamos. Nuestra filosofía es simple:
             alta calidad a precios bajos. Creemos firmemente que
             disfrutar de una buena hamburguesa no debería ser
             un lujo.
          </p>

           <h3 className={styles.aboutSubTitle}>
             ¿Y el nombre Cheepers?
           </h3>

          <p className={styles.aboutParagraph}>
             Es una de las preguntas que más nos hacen. La verdad es que no tiene
             una historia compleja, pero sí mucha personalidad. Surge de una
             mezcla casual de palabras: "cheep", una variación de chips (papas
             fritas en inglés), terminó evolucionando hasta convertirse en
             Cheepers. Nos gustó cómo sonaba... y se quedó.
          </p>

        </div>

        {/* Columna del Mapa Embebido (DERECHA en Desktop - AHORA INCLUYE INFO DE CONTACTO ARRIBA DEL MAPA) */}
        <div className={styles.mapEmbedContainer}>

           {/* Bloque de Información de Contacto / Ubicación - MOVIDO AQUÍ */}
           <div className={styles.contactInfoBlock}>
              <h3 className={styles.contactTitle}>Contáctanos</h3>

              {/* Contacto Item: Teléfono/WhatsApp */}
              <div className={styles.contactItem}>
                 <span className={styles.contactIconWrapper}>
                   <FaPhone/>
                 </span>
                 <p className={styles.contactText}>
                    Consultas y turnos al <a href="tel:+5491123152163">+54 911 23 152163</a> {/* **REEMPLAZAR NÚMERO** */}
                    {' '} (<a href={`https://wa.me/${'5491123152163'}?text=${encodeURIComponent('Hola! Quisiera hacer un pedido.')}`} target="_blank" rel="noopener noreferrer">Enviar WhatsApp</a>) {/* **REEMPLAZAR NÚMERO Y MENSAJE** */}
                 </p>
              </div>

              {/* Contacto Item: Ubicación */}
              <div className={styles.contactItem}>
                 <span className={styles.contactIconWrapper}>
                    <FaMapMarkerAlt/>
                 </span>
                 <p className={styles.contactText}>
                    Ubicados en Av. Rep Argentina y Humberto Primo, Resistencia - Chaco {/* **REEMPLAZAR DIRECCIÓN** */}
                    {' '} (<a href="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.965667751859!2d-58.99709008998274!3d-27.439180676238557!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94450d001ef242d1%3A0x52378bc04033ee5a!2sCheepers!5e0!3m2!1ses!2sar!4v1747468372361!5m2!1ses!2sar" target="_blank" rel="noopener noreferrer">Ver en Mapa</a>) {/* URL para abrir en Maps app/site */}
                 </p>
              </div>
           </div> {/* Fin contactInfoBlock - MOVIDO AQUÍ */}


           {/* IFRAME REAL DEL MAPA */}
           <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.965667751859!2d-58.99709008998274!3d-27.439180676238557!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94450d001ef242d1%3A0x52378bc04033ee5a!2sCheepers!5e0!3m2!1ses!2sar!4v1747468372361!5m2!1ses!2sar" // <-- Tu URL específica
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de Cheepers en Google Maps"
          ></iframe>

           {/* Botón "Abrir en Maps" */}
            <a
             href="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.965667751859!2d-58.99709008998274!3d-27.439180676238557!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94450d001ef242d1%3A0x52378bc04033ee5a!2sCheepers!5e0!3m2!1ses!2sar!4v1747468372361!5m2!1ses!2sar" // **REEMPLAZAR** con URL para abrir en Maps app/site
             target="_blank"
             rel="noopener noreferrer"
             className={styles.openInMapsButton}
           >
             Abrir en Maps <FaArrowRight />
           </a>
        </div> {/* Fin mapEmbedContainer */}

      </section>

      <main>
      </main>

    </div>
  );
};

export default Inicio;