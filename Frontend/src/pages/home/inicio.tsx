import React, { useState, useEffect, useRef } from 'react';
import styles from './../css/inicio.module.css';
import { useNavigate } from 'react-router-dom';

// Asegúrate de que las rutas de las imágenes sean correctas
import baconcheep from '../../assets/images/baconcheep.jpg';
import barbacue from '../../assets/images/cheddar.jpg';
import cheddar from '../../assets/images/barbacue.jpg';

// Importar FaClock además de los otros iconos
import { FaWhatsapp, FaPhone, FaMapMarkerAlt, FaArrowRight, FaClock } from 'react-icons/fa';

// Definición de los elementos del banner
const bannerItems = [
    { image: baconcheep, title: 'BACON CHEEP', descriptionLine1: 'El sabor ahumado', descriptionLine2: 'con bacon crujiente.', callToAction: '¡Pruébala ahora!', altText: 'Hamburguesa Bacon Cheep' },
    { image: barbacue, title: 'BARBACUE', descriptionLine1: 'Con nuestra salsa', descriptionLine2: 'barbacoa casera.', callToAction: '¡Sabor inigualable!', altText: 'Hamburguesa Barbacue Deluxe' },
    { image: cheddar, title: 'CHEDDAR', descriptionLine1: 'Ketchup carne y', descriptionLine2: 'queso cheddar.', callToAction: '¡Con Mucho queso!', altText: 'Hamburguesa Cheddar Explosion' },
];

const Inicio: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    // Usamos useRef para mantener una referencia al intervalo que no cambia en cada render
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Función para reiniciar el temporizador
    const startAutoSlide = () => {
        // Limpia cualquier temporizador existente
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        // Crea un nuevo temporizador
        intervalRef.current = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === bannerItems.length - 1 ? 0 : prevIndex + 1
            );
        }, 6000);
    };

    // El useEffect ahora solo llama a startAutoSlide una vez y lo limpia al desmontar
    useEffect(() => {
        startAutoSlide();
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Función para cambiar el slide manualmente
    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        startAutoSlide(); // Reinicia el temporizador al hacer clic en los puntos
    };

    // ----- Nuevas funciones de manejo de eventos táctiles para deslizar -----
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
        if (intervalRef.current) {
            clearInterval(intervalRef.current); // Detiene el auto-slide mientras se desliza
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        // Verifica que haya un deslizamiento significativo para evitar conflictos con clics
        if (Math.abs(touchStart - touchEnd) > 75) {
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
        }
        setTouchStart(0);
        setTouchEnd(0);
        startAutoSlide(); // Reinicia el temporizador después de soltar el dedo
    };

    const whatsappPedidoMessage = 'Hola! Quisiera hacer un pedido.';
    const whatsappConsultaMessage = 'Hola! Tengo una consulta.';

    return (
        <div className={styles.inicioContainer}>
            <section 
                className={styles.heroSection}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {bannerItems.map((item, index) => (
                    <div
                        key={index}
                        className={`${styles.heroSlide} ${index === currentIndex ? styles.active : ''}`}
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
                            <button
                                className={styles.heroCallToAction}
                                onClick={() => navigate('/menu')}
                                onTouchEnd={(e) => {
                                    e.stopPropagation();
                                    navigate('/menu');
                                }}
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
                                <p>Sabados: hasta las 00:00</p>
                            </div>
                        </div>

                        <div className={styles.contactItem}>
                            <span className={styles.contactIconWrapper}>
                                <FaMapMarkerAlt/>
                            </span>
                            <p className={styles.contactText}>
                                Ubicados en Corrientes 1200, Resistencia - Chaco
                                {' '} (<a href="https://maps.app.goo.gl/QppqFpF3aGCp6tnq9" target="_blank" rel="noopener noreferrer">Ver en Mapa</a>)
                            </p>
                        </div>
                    </div>

                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.965667751859!2d-58.99709008998274!3d-27.439180676238557!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94450d001ef242d1%3A0x52378bc04033ee5a!2sCheepers!5e0!3m2!1ses!2sar!4v1747468372361!5m2!1ses!2sar"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ubicación de Cheepers en Google Maps"
                    ></iframe>

                    <a
                        href="https://maps.app.goo.gl/QppqFpF3aGCp6tnq9"
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