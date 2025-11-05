import React, { useState, useEffect, useRef } from 'react';
import styles from './../css/inicio.module.css';
import { useNavigate } from 'react-router-dom';

import baconcheep from '../../assets/images/hamburguesa-big-tasty.webp';
import barbacue from '../../assets/images/con-queso-con-sesamo.webp';
import cheddar from '../../assets/images/papas fritas bacon.webp';
import conqueso from '../../assets/images/con-queso.webp'
import pizzas from '../../assets/images/pizzas.webp';
import sandwichVacio from '../../assets/images/hamburguesa pan arabe.webp'
import { FaPhone, FaMapMarkerAlt, FaArrowRight, FaClock } from 'react-icons/fa';

// ======== Duraciones sincronizadas ========
const TRANSITION_MS = 900;   // ← más lenta (podés subirla a 1000–1200 si querés)
const AUTOSLIDE_MS = 6000;   // auto-avance

// Definición de los elementos del banner
const bannerItems = [
  { image: sandwichVacio,  title: 'BURGUER PAN ARABE',    descriptionLine1: 'Sabrosa hamburguesa en pan arabe de 18cm', callToAction: '¡Probala ahora!', altText: 'Lomito', targetRoute: '/menu' },
  { image: baconcheep, title: 'BIG TASTY', descriptionLine1: 'El sabor ahumado', descriptionLine2: 'con bacon crujiente.', callToAction: '¡Probala ahora!', altText: 'Hamburguesa Big Tasty', targetRoute: '/menu' },
  { image: barbacue,   title: 'CON QUESO', descriptionLine1: 'Ketchup carne cebollita ', descriptionLine2: 'cheddar y mostaza.', callToAction: '¡Sabor inigualable!', altText: 'Hamburguesa Con queso', targetRoute: '/menu' },
  { image: cheddar,    title: 'PAPAS BACON', descriptionLine1: 'Papas con cheddar ', descriptionLine2: 'y bacon.', callToAction: '¡Bien crocantes!', altText: 'Papas con cheddar y bacon', targetRoute: '/menu' },
  { image: pizzas,     title: 'PIZZAS', descriptionLine1: 'Gran variedad de pizzas ', descriptionLine2: 'No te quedes sin probar.', callToAction: '¡Probalas!', altText: 'Pizzas', targetRoute: '/menu' },
  { image: conqueso,   title: 'CALIDAD ÚNICA', descriptionLine1: 'Mira nuestro menú completo', callToAction: '¡Menú completo!', altText: 'Menú completo', targetRoute: '/menu' },
];

const Inicio: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const navigate = useNavigate();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cierre “seguro” de transición para Safari (doble RAF)
  const endTransitionSafely = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsTransitioning(false));
    });
  };

  // Auto-slide
  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex(prev =>
        prev === bannerItems.length - 1 ? 0 : prev + 1
      );

      if (transitionRef.current) clearTimeout(transitionRef.current);
      transitionRef.current = setTimeout(endTransitionSafely, TRANSITION_MS); // 👈 sincronizado
    }, AUTOSLIDE_MS);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (transitionRef.current) clearTimeout(transitionRef.current);
    };
  }, []);

  // Ir a un slide puntual
  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);

    if (transitionRef.current) clearTimeout(transitionRef.current);
    transitionRef.current = setTimeout(endTransitionSafely, TRANSITION_MS); // 👈

    startAutoSlide();
  };

  // Gestos táctiles (sin preventDefault en move → iOS feliz)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const minSwipeDistance = 75;

    if (!isTransitioning && Math.abs(touchStart - touchEnd) > minSwipeDistance) {
      setIsTransitioning(true);

      if (touchStart - touchEnd > 0) {
        setCurrentIndex(prev => (prev === bannerItems.length - 1 ? 0 : prev + 1));
      } else {
        setCurrentIndex(prev => (prev === 0 ? bannerItems.length - 1 : prev - 1));
      }

      if (transitionRef.current) clearTimeout(transitionRef.current);
      transitionRef.current = setTimeout(endTransitionSafely, TRANSITION_MS); // 👈
    }

    setTouchStart(0);
    startAutoSlide();
  };

  const handleButtonClick = (targetRoute: string) => navigate(targetRoute);

  const whatsappPedidoMessage = 'Hola! Quisiera hacer un pedido.';
  const mapsUrl =
    'https://www.google.com/maps?q=Cheepers,Corrientes+1200,Resistencia,Chaco&ll=-27.439181,-58.997090&z=17';

  return (
    <div className={styles.inicioContainer}>
      <section
        className={styles.heroSection}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {bannerItems.map((item, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={index}
              className={`${styles.heroSlide} ${isActive ? styles.active : ''} ${isTransitioning ? styles.transitioning : ''}`}
              aria-hidden={!isActive}
              style={{
                position: 'absolute',
                inset: 0,
                visibility: isActive ? 'visible' : 'hidden',
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? 'auto' : 'none',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                willChange: 'opacity, transform',
                transition: `opacity ${TRANSITION_MS}ms ease`, // 👈 sincronizado
              }}
            >
              <div className={styles.heroImageContainer}>
                <img src={item.image} alt={item.altText} className={styles.heroImage} />
              </div>

              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>{item.title}</h1>
                <p className={styles.heroText}>
                  {item.descriptionLine1}<br />
                  {item.descriptionLine2}
                </p>
                <button
                  className={styles.heroCallToAction}
                  onClick={() => handleButtonClick(item.targetRoute)}
                >
                  {item.callToAction}
                </button>
              </div>
            </div>
          );
        })}

        <div className={styles.bannerDots}>
          {bannerItems.map((_, index) => (
            <span
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* SECCIÓN: SOBRE NOSOTROS / CONTACTO CON MAPA Y WHATSAPP */}
      <section className={styles.aboutContactSection}>
        <div className={styles.aboutContent}>
          <h2 className={styles.aboutMainTitle}>
            Bienvenidos a Cheepers The Burger House, la mejor calidad y los mejores precios
          </h2>

          <p className={styles.aboutParagraph}>
            Fundado en 2019 por Ricardo Salas, Cheepers nació con una idea clara: ofrecer
            comida rápida rica, accesible y sin vueltas. Inspirados en grandes cadenas,
            apostamos por un modelo propio con identidad local.
          </p>

          <p className={styles.aboutParagraph}>
            Actualmente contamos con una sucursal en Resistencia, Chaco, y aunque el camino no
            siempre fue fácil, seguimos avanzando con determinación. Este año apostamos fuerte
            por nuestro crecimiento, y por eso lanzamos esta nueva página web: como parte de una
            estrategia renovada que nos permita dar finalmente el salto que tanto deseamos.
            Nuestra filosofía es simple: alta calidad a precios bajos. Creemos firmemente que
            disfrutar de una buena hamburguesa no debería ser un lujo.
          </p>

          <h3 className={styles.aboutSubTitle}>¿Y el nombre Cheepers?</h3>

          <p className={styles.aboutParagraph}>
            Es una de las preguntas que más nos hacen. La verdad es que no tiene una historia
            compleja, pero sí mucha personalidad. Surge de una mezcla casual de palabras:
            "cheep", una variación de chips (papas fritas en inglés), terminó evolucionando hasta
            convertirse en Cheepers. Nos gustó cómo sonaba... y se quedó.
          </p>
        </div>

        <div className={styles.mapEmbedContainer}>
          <div className={styles.contactInfoBlock}>
            <h3 className={styles.contactTitle}>Contáctanos</h3>

            <div className={styles.contactItem}>
              <span className={styles.contactIconWrapper}>
                <FaPhone />
              </span>
              <p className={styles.contactText}>
                Consultas y pedidos <a href="tel:+543624063011">+54 3624063011</a>
                <br />
                <a
                  href={`https://wa.me/543624063011?text=${encodeURIComponent(whatsappPedidoMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enviar WhatsApp (Pedidos)
                </a>
              </p>
            </div>

            <div className={styles.contactItem}>
              <span className={styles.contactIconWrapper}>
                <FaClock />
              </span>
              <div className={styles.contactText}>
                <p><strong>Horario de Atención:</strong></p>
                <p>Lunes a Domingo: 20:00 - 23:00 hs</p>
                <p>Viernes: hasta las 23:30</p>
                <p>Sabados: hasta las 00:00</p>
              </div>
            </div>

            <div className={styles.contactItem}>
              <span className={styles.contactIconWrapper}>
                <FaMapMarkerAlt />
              </span>
              <p className={styles.contactText}>
                Ubicados en Corrientes 1200, Resistencia - Chaco{' '}
                (<a href={mapsUrl} target="_blank" rel="noopener noreferrer">Ver en Mapa</a>)
              </p>
            </div>
          </div>

          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.965667751859!2d-58.99709008998274!3d-27.439180676238557!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94450d001ef242d1%3A0x52378bc04033ee5a!2sCheepers!5e0!3m2!1ses!2sar!4v1747468372361!5m2!1ses!2sar1"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de Cheepers en Google Maps"
          />
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.openInMapsButton}
          >
            Abrir en Maps <FaArrowRight />
          </a>
        </div>
      </section>

      <main />
    </div>
  );
};

export default Inicio;
