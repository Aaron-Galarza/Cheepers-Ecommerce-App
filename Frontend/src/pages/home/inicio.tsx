import React, { useState, useEffect, useRef } from 'react';
import styles from './../css/inicio.module.css';
import { useNavigate } from 'react-router-dom';

// Asegúrate de que las rutas de las imágenes sean correctas
import baconcheep from '../../assets/images/hamburguesa big tasty.jpeg';
import barbacue from '../../assets/images/con queso con sesamo.jpeg';
import cheddar from '../../assets/images/papas fritas bacon.jpeg';
import conqueso from '../../assets/images/con queso.jpeg';
import lomo from '../../assets/images/lomito.jpeg'
import pizzas from '../../assets/images/pizzas.jpeg'
import lomo2 from '../../assets/images/lomito2.jpeg'
import lomo3 from '../../assets/images/lomito3.jpeg'
import promodia from '../../assets/images/promocion.jpg'
// Importar FaClock además de los otros iconos
import { FaWhatsapp, FaPhone, FaMapMarkerAlt, FaArrowRight, FaClock } from 'react-icons/fa';

// Definición de los elementos del banner
const bannerItems = [
  { 
    image: promodia, 
    title: 'PROMOCIÓN', 
    descriptionLine1: 'Aprovecha nuestra', 
    descriptionLine2: 'promo del día', 
    callToAction: '¡Mira nuestras promos!', 
    altText: 'Hamburguesa Big Tasty',
    targetRoute: '/promos' // 🔥 Nueva propiedad para la ruta específica
  },
  { 
    image: lomo, 
    title: 'LOMITO', 
    descriptionLine1: 'No te quedes sin', 
    descriptionLine2: 'probar', 
    callToAction: '¡Ya disponible!', 
    altText: 'Hamburguesa Big Tasty',
    targetRoute: '/menu' // 🔥 Mantener menu para los demás
  },
  { 
    image: lomo2, 
    title: 'LOMITO',
    descriptionLine1: 'Nuevo lomito',  
    callToAction: '¡Delicioso!',
    targetRoute: '/menu'
  },
  { 
    image: lomo3, 
    title: 'LOMITO',
    descriptionLine1: 'Lomito con papas incluidas', 
    callToAction: '¡Miralo en nuestro menú!',
    targetRoute: '/menu'
  },
  { 
    image: baconcheep, 
    title: 'BIG TASTY', 
    descriptionLine1: 'El sabor ahumado', 
    descriptionLine2: 'con bacon crujiente.', 
    callToAction: '¡Probala ahora!', 
    altText: 'Hamburguesa Big Tasty',
    targetRoute: '/menu'
  },
  { 
    image: barbacue, 
    title: 'CON QUESO', 
    descriptionLine1: 'Ketchup carne cebollita ', 
    descriptionLine2: 'cheddar y mostaza.', 
    callToAction: '¡Sabor inigualable!', 
    altText: 'Hamburguesa Con queso',
    targetRoute: '/menu'
  },
  { 
    image: cheddar, 
    title: 'PAPAS BACON', 
    descriptionLine1: 'Papas con cheddar ', 
    descriptionLine2: 'y bacon.', 
    callToAction: '¡Bien crocantes!', 
    altText: 'Papas con cheddar y bacon',
    targetRoute: '/menu'
  },
  { 
    image: pizzas, 
    title: 'PIZZAS', 
    descriptionLine1: 'Gran variedad de pizzas ', 
    descriptionLine2: 'No te quedes sin probar.', 
    callToAction: '¡Probalas!', 
    altText: 'Papas con cheddar y bacon',
    targetRoute: '/menu'
  },
  { 
    image: conqueso, 
    title: 'CALIDAD ÚNICA', 
    descriptionLine1: 'Mira nuestro menú completo', 
    callToAction: '¡Menú completo!', 
    altText: 'Mira nuestro menú completo',
    targetRoute: '/menu'
  },
];

const Inicio: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const navigate = useNavigate();
    const [touchStart, setTouchStart] = useState(0);

    // Usamos useRef para mantener una referencia al intervalo que no cambia en cada render
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const transitionRef = useRef<NodeJS.Timeout | null>(null);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Función para reiniciar el temporizador
    const startAutoSlide = () => {
        // Limpia cualquier temporizador existente
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        // Crea un nuevo temporizador
        intervalRef.current = setInterval(() => {
            setIsTransitioning(true);
            setCurrentIndex((prevIndex) => 
                prevIndex === bannerItems.length - 1 ? 0 : prevIndex + 1
            );
            
            // Limpiar transición después de que se complete
            if (transitionRef.current) {
                clearTimeout(transitionRef.current);
            }
            transitionRef.current = setTimeout(() => {
                setIsTransitioning(false);
            }, 600); // Tiempo que debe coincidir con la duración de la transición CSS
        }, 6000);
    };

    // El useEffect ahora solo llama a startAutoSlide una vez y lo limpia al desmontar
    useEffect(() => {
        startAutoSlide();
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (transitionRef.current) {
                clearTimeout(transitionRef.current);
            }
        };
    }, []);

    // Función para cambiar el slide manualmente
    const goToSlide = (index: number) => {
        if (isTransitioning) return;
        
        setIsTransitioning(true);
        setCurrentIndex(index);
        
        // Limpiar timeout existente
        if (transitionRef.current) {
            clearTimeout(transitionRef.current);
        }
        
        transitionRef.current = setTimeout(() => {
            setIsTransitioning(false);
        }, 600);
        
        startAutoSlide(); // Reinicia el temporizador al hacer clic en los puntos
    };

    // ----- Nuevas funciones de manejo de eventos táctiles para deslizar -----
    const handleTouchStart = (e: React.TouchEvent) => {
        // Detiene el auto-slide
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEnd = e.changedTouches[0].clientX;
        const minSwipeDistance = 75;
        
        if (isTransitioning) return;
        
        // Compara la distancia total del deslizamiento
        if (Math.abs(touchStart - touchEnd) > minSwipeDistance) {
            setIsTransitioning(true);
            
            if (touchStart - touchEnd > 0) {
                // Deslizamiento a la izquierda
                setCurrentIndex((prevIndex) => 
                    prevIndex === bannerItems.length - 1 ? 0 : prevIndex + 1
                );
            } else {
                // Deslizamiento a la derecha
                setCurrentIndex((prevIndex) =>
                    prevIndex === 0 ? bannerItems.length - 1 : prevIndex - 1
                );
            }
            
            // Limpiar timeout existente
            if (transitionRef.current) {
                clearTimeout(transitionRef.current);
            }
            
            transitionRef.current = setTimeout(() => {
                setIsTransitioning(false);
            }, 600);
        }
        
        // Resetea los valores táctiles y reinicia el auto-slide
        setTouchStart(0);
        startAutoSlide();
    };
    
    // 🔥 Función del botón modificada para manejar rutas específicas
    const handleButtonClick = (targetRoute: string) => {
        navigate(targetRoute);
    }

    const whatsappPedidoMessage = 'Hola! Quisiera hacer un pedido.';
    const whatsappConsultaMessage = 'Hola! Tengo una consulta.';

    // URL corregida para abrir la ubicación específica de Cheepers en Google Maps
    const mapsUrl = "https://www.google.com/maps?q=Cheepers,Corrientes+1200,Resistencia,Chaco&ll=-27.439181,-58.997090&z=17";

    return (
        <div className={styles.inicioContainer}>
            <section 
                className={styles.heroSection}
                onTouchStart={handleTouchStart}
                onTouchMove={(e) => { e.preventDefault() }}
                onTouchEnd={handleTouchEnd}
            >
                {bannerItems.map((item, index) => (
                    <div
                        key={index}
                        className={`${styles.heroSlide} ${index === currentIndex ? styles.active : ''} ${isTransitioning ? styles.transitioning : ''}`}
                    >
                        <div className={styles.heroImageContainer}>
                            <img src={item.image} alt={item.altText} className={styles.heroImage}/>
                        </div>
                        <div className={styles.heroContent}>
                            <h1 className={styles.heroTitle}>{item.title}</h1>
                            <p className={styles.heroText}>
                                {item.descriptionLine1}<br />
                                {item.descriptionLine2}
                            </p>
                            {/* 🔥 Botón con ruta específica para cada slide */}
                            <button
                                className={styles.heroCallToAction}
                                onClick={() => handleButtonClick(item.targetRoute)}
                            >
                                {item.callToAction}
                            </button>
                        </div>
                    </div>
                ))}

                <div className={styles.bannerDots}>
                    {bannerItems.map((_, index) => (
                        <span
                            key={index}
                            className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
                            onClick={() => goToSlide(index)}
                        ></span>
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

                <div className={styles.mapEmbedContainer}>

                    <div className={styles.contactInfoBlock}>
                        <h3 className={styles.contactTitle}>Contáctanos</h3>

                        <div className={styles.contactItem}>
                            <span className={styles.contactIconWrapper}>
                                <FaPhone/>
                            </span>
                            <p className={styles.contactText}>
                                Consultas y pedidos <a href="tel:+543624063011">+54 3624063011</a>
                                <br />
                                <a href={`https://wa.me/543624063011?text=${encodeURIComponent(whatsappPedidoMessage)}`} target="_blank" rel="noopener noreferrer">
                                    Enviar WhatsApp (Pedidos)
                                </a>
                            </p>
                        </div>

                        <div className={styles.contactItem}>
                            <span className={styles.contactIconWrapper}>
                                <FaClock/>
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
                                <FaMapMarkerAlt/>
                            </span>
                            <p className={styles.contactText}>
                                Ubicados en Corrientes 1200, Resistencia - Chaco
                                {' '} (<a href={mapsUrl} target="_blank" rel="noopener noreferrer">Ver en Mapa</a>)
                            </p>
                        </div>
                    </div>

                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.965667751859!2d-58.99709008998274!3d-27.439180676238557!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94450d001ef242d1%3A0x52378bc04033ee5a!2sCheepers!5e0!3m2!1ses!2sar!4v1747468372361!5m2!1ses!2sar1"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ubicación de Cheepers en Google Maps"
                    ></iframe>

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

            <main>
            </main>

        </div>
    );
};

export default Inicio;