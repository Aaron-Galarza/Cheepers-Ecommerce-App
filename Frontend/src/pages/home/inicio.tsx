import React, { useState, useEffect, useRef } from 'react';
import styles from './../css/inicio.module.css';
import { useNavigate } from 'react-router-dom';

// IMÁGENES (Asegurate de que las rutas sean las que tenés en tu proyecto)
import cheddar from '../../assets/images/papasba.jpg';
import pizzas from '../../assets/images/hamburguesa-cristal.jpg';
import sandwichVacio from '../../assets/images/Lomito.jpg'
import SandwichMilanesa from '../../assets/images/pizzafu.jpg'
import { FaPhone, FaMapMarkerAlt, FaArrowRight, FaClock, FaWhatsapp } from 'react-icons/fa';

const TRANSITION_MS = 900;
const AUTOSLIDE_MS = 6000;

// DATOS REALES DE CONTACTO
const PHONE_DISPLAY = "+54 9 362 401-3698";
const PHONE_LINK = "5493624013698"; // Formato para tel: y wa.me
const WHATSAPP_MSG = "Hola Cristal Bar! Quisiera hacer un pedido.";
const ADDRESS = "Juan Domingo Perón 402, Resistencia - Chaco";
const MAPS_LINK = "https://goo.gl/maps/TuLinkRealAqui"; // Poné el link corto de google maps si lo tenés

const bannerItems = [
  { image: SandwichMilanesa,  title: 'PIZZA FUGA',    descriptionLine1: 'Sabrosa pizza fugazzeta con masa casera', callToAction: '¡Pedilo ahora!', altText: 'Lomito', targetRoute: '/menu' },
  { image: sandwichVacio,  title: 'LOMO BACON',  descriptionLine1: 'En Pan ciabatta con panceta y cheddar', callToAction: '¡Probala ahora!', altText: 'Lomito', targetRoute: '/menu' },
  { image: cheddar,    title: 'PAPAS BACON', descriptionLine1: 'Papas con cheddar ', descriptionLine2: 'y bacon.', callToAction: '¡Bien crocantes!', altText: 'Papas con cheddar y bacon', targetRoute: '/menu' },
  { image: pizzas,     title: 'BURGUER CRISTAL', descriptionLine1: 'carne, mozzarella, Roquefort, tomate, rúcula aderezos ', callToAction: '¡Probalas!', altText: 'Pizzas', targetRoute: '/menu' },
];

const Inicio: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const navigate = useNavigate();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const endTransitionSafely = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsTransitioning(false));
    });
  };

  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev === bannerItems.length - 1 ? 0 : prev + 1);
      if (transitionRef.current) clearTimeout(transitionRef.current);
      transitionRef.current = setTimeout(endTransitionSafely, TRANSITION_MS);
    }, AUTOSLIDE_MS);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (transitionRef.current) clearTimeout(transitionRef.current);
    };
  }, []);

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    if (transitionRef.current) clearTimeout(transitionRef.current);
    transitionRef.current = setTimeout(endTransitionSafely, TRANSITION_MS);
    startAutoSlide();
  };

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
      transitionRef.current = setTimeout(endTransitionSafely, TRANSITION_MS);
    }
    setTouchStart(0);
    startAutoSlide();
  };

  return (
    <div className={styles.inicioContainer}>
      <section className={styles.heroSection} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {bannerItems.map((item, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={index}
              className={`${styles.heroSlide} ${isActive ? styles.active : ''} ${isTransitioning ? styles.transitioning : ''}`}
              aria-hidden={!isActive}
              style={{
                position: 'absolute', inset: 0,
                visibility: isActive ? 'visible' : 'hidden', opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? 'auto' : 'none',
                transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)',
                backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                willChange: 'opacity, transform',
                transition: `opacity ${TRANSITION_MS}ms ease`,
              }}
            >
              <div className={styles.heroImageContainer}>
                <img src={item.image} alt={item.altText} className={styles.heroImage} />
              </div>
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>{item.title}</h1>
                <p className={styles.heroText}>{item.descriptionLine1}<br />{item.descriptionLine2}</p>
                <button className={styles.heroCallToAction} onClick={() => navigate(item.targetRoute)}>
                  {item.callToAction}
                </button>
              </div>
            </div>
          );
        })}
        <div className={styles.bannerDots}>
          {bannerItems.map((_, index) => (
            <span key={index} className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`} onClick={() => goToSlide(index)} />
          ))}
        </div>
      </section>

      {/* SECCIÓN INFO */}
      <section className={styles.aboutContactSection}>
        <div className={styles.aboutContent}>
          <h2 className={styles.aboutMainTitle}>Bienvenidos a Cristal Bar, acá se cocina con el corazón</h2>
<p className={styles.aboutParagraph}>
            Ubicados en el corazón de la ciudad (Juan Domingo Perón 402), <strong>Cristal Bar</strong> se ha consolidado como un clásico indiscutido para los ciudadanos de Resistencia. 
            No somos solo un lugar para comer; somos ese rincón familiar donde el día empieza con un buen café y termina con una cena abundante entre amigos.
          </p>

          <p className={styles.aboutParagraph}>
            Nuestra cocina se define por una sola premisa: <strong>sabor casero y generosidad</strong>. 
            Lejos de las modas pasajeras, apostamos a los platos que reconfortan el alma. Desde nuestras legendarias milanesas y lomitos
            hasta nuestras pizzas y minutas, cada plato sale de la cocina con el cariño de quien cocina para su propia familia.
          </p>

          <h3 className={styles.aboutSubTitle}>Nuestro compromiso</h3>

       <p className={styles.aboutParagraph}>
            En tiempos donde todo se achica, nosotros mantenemos nuestra esencia: porciones que satisfacen y una calidad que no se negocia. 
            Ya sea que vengas a las 7 de la mañana o a las 1 de la madrugada, nuestro compromiso es recibirte con una sonrisa, 
            un ambiente cálido y esa comida honesta que nos convirtió en tu lugar elegido.
          </p>
          
          <p className={styles.aboutParagraph}>
            Queremos que te sientas como en casa. Ya sea que vengas a disfrutar de una cena con amigos, 
            una cerveza bien fría o una comida rápida al paso, en Cristal siempre vas a encontrar 
            un ambiente amigable y una atención dedicada. ¡Gracias por elegirnos!
          </p>
        </div>

        {/* COLUMNA DERECHA: MAPA Y CONTACTO */}
        <div className={styles.mapEmbedContainer}>
          <div className={styles.contactInfoBlock}>
            <h3 className={styles.contactTitle}>Contáctanos</h3>

            <div className={styles.contactItem}>
              <span className={styles.contactIconWrapper}><FaWhatsapp /></span>
              <p className={styles.contactText}>
                <a href={`https://wa.me/${PHONE_LINK}?text=${encodeURIComponent(WHATSAPP_MSG)}`} target="_blank" rel="noopener noreferrer">
                  {PHONE_DISPLAY}
                </a>
              </p>
            </div>

            <div className={styles.contactItem}>
              <span className={styles.contactIconWrapper}><FaClock /></span>
              <div className={styles.contactText}>
                <p><strong>Lunes a Sábados:</strong> 07:00 - 14:30 / 18:00 - 01:00</p>
                <p><strong>Domingos:</strong> 19:00 - 01:00</p>
              </div>
            </div>

            <div className={styles.contactItem}>
              <span className={styles.contactIconWrapper}><FaMapMarkerAlt /></span>
              <p className={styles.contactText}>
                {ADDRESS} <br/>
                <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" style={{fontSize: '0.9em'}}>
                  (Ver en Mapa)
                </a>
              </p>
            </div>
          </div>

          {/* MAPA MÁS COMPACTO (Height reducido a 250px) */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.6373741258244!2d-58.99171270000001!3d-27.449409799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94450c8af31cd81f%3A0x378eca0c1653d0!2sCristal%20Bar!5e0!3m2!1ses-419!2sar!4v1767829046937!5m2!1ses-419!2sar" 
            width="100%" 
            height="250" 
            style={{ border: 0, borderRadius: '8px' }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de Cristal Bar"
          />
          
          <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className={styles.openInMapsButton} style={{marginTop: '15px'}}>
            Abrir en Google Maps <FaArrowRight />
          </a>
        </div>
      </section>

      <main />
    </div>
  );
};

export default Inicio;