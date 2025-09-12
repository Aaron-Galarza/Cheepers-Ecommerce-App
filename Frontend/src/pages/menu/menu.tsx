import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import styles from '../css/menu.module.css';
import { Product } from '../../components/layout/checkout/productlist';
import { useCart } from '../../components/layout/checkout/cartcontext';

// Importa los íconos de React Icons
import { GiHamburger, GiFrenchFries, GiPizzaSlice, GiBread } from 'react-icons/gi';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const MenuPage: React.FC = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Crea las referencias para cada sección
    const hamburgersRef = useRef<HTMLHeadingElement>(null);
    const friesRef = useRef<HTMLHeadingElement>(null);
    const pizzasRef = useRef<HTMLHeadingElement>(null);
    const lomosRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<Product[]>(`${API_BASE_URL}/api/products`);
                setProducts(response.data);
            } catch (err) {
                console.error('Error al cargar los productos:', err);
                setError('No se pudieron cargar los productos.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // ** Función de scroll mejorada para un desplazamiento más preciso **
    // CORRECCIÓN: Aceptar RefObject<HTMLHeadingElement | null>
    const scrollToSection = (ref: React.RefObject<HTMLHeadingElement | null>) => {
        if (ref.current) {
            const yOffset = -150;
            const y = ref.current.getBoundingClientRect().top + window.scrollY + yOffset;
            
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const hamburgers = products.filter((p) => p.category === 'Hamburguesas');
    const fries = products.filter((p) => p.category === 'Papas Fritas');
    const pizzas = products.filter((p) => p.category === 'Pizzas');
    const lomos = products.filter((p) => p.category === 'Lomos');

    // Verificar si hay productos en cada categoría
    const hasHamburgers = hamburgers.length > 0;
    const hasFries = fries.length > 0;
    const hasPizzas = pizzas.length > 0;
    const hasLomos = lomos.length > 0;

    if (loading) return <div className={styles.menuContainer}>Cargando productos...</div>;

    if (error) return <div className={styles.menuContainer} style={{ color: 'red' }}>{error}</div>;

    return (
        <>
            <nav className={styles.stickyNav}>
                <ul className={styles.navList}>
                    {hasHamburgers && (
                        <li>
                            <a onClick={() => scrollToSection(hamburgersRef)}>
                                <GiHamburger className={styles.navIcon} /> Hamburguesas
                            </a>
                        </li>
                    )}
                    {hasFries && (
                        <li>
                            <a onClick={() => scrollToSection(friesRef)}>
                                <GiFrenchFries className={styles.navIcon} /> Papas
                            </a>
                        </li>
                    )}
                    {hasPizzas && (
                        <li>
                            <a onClick={() => scrollToSection(pizzasRef)}>
                                <GiPizzaSlice className={styles.navIcon} /> Pizzas
                            </a>
                        </li>
                    )}
                    {hasLomos && (
                        <li>
                            <a onClick={() => scrollToSection(lomosRef)}>
                                <GiBread className={styles.navIcon} /> Lomos
                            </a>
                        </li>
                    )}
                </ul>
            </nav>
            
            <div className={styles.menuContainer}>
                {/* Hamburguesas */}
                {hasHamburgers && (
                    <>
                        <h1 id="hamburguesas" className={styles.sectionTitle} ref={hamburgersRef}>
                            HAMBURGUESAS
                        </h1>
                        <div className={styles.grid}>
                            {hamburgers.map((p) => (
                                <div key={p._id} className={styles.card}>
                                    <img src={p.imageUrl || '/default-image.jpg'} alt={p.name} className={styles.image} />
                                    <div className={styles.info}>
                                        <h2 className={styles.title}>{p.name}</h2>
                                        <p className={styles.description}>{p.description}</p>
                                        <p className={styles.price}>${p.price?.toFixed(2) || 'N/A'}</p>
                                        <button className={styles.button} onClick={() => addToCart(p)}>Agregar al carrito</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Papas Fritas */}
                {hasFries && (
                    <>
                        <h1 id="papas-fritas" className={styles.sectionTitle} ref={friesRef}>
                            PAPAS FRITAS
                        </h1>
                        <div className={styles.grid}>
                            {fries.map((p) => (
                                <div key={p._id} className={styles.card}>
                                    <img src={p.imageUrl || '/default-image.jpg'} alt={p.name} className={styles.image} />
                                    <div className={styles.info}>
                                        <h2 className={styles.title}>{p.name}</h2>
                                        <p className={styles.description}>{p.description}</p>
                                        <p className={styles.price}>${p.price?.toFixed(2) || 'N/A'}</p>
                                        <button className={styles.button} onClick={() => addToCart(p)}>Agregar al carrito</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Pizzas */}
                {hasPizzas && (
                    <>
                        <h1 id="pizzas" className={styles.sectionTitle} ref={pizzasRef}>
                            PIZZAS
                        </h1>
                        <div className={styles.grid}>
                            {pizzas.map((p) => (
                                <div key={p._id} className={styles.card}>
                                    <img src={p.imageUrl || '/default-image.jpg'} alt={p.name} className={styles.image} />
                                    <div className={styles.info}>
                                        <h2 className={styles.title}>{p.name}</h2>
                                        <p className={styles.description}>{p.description}</p>
                                        <p className={styles.price}>${p.price?.toFixed(2) || 'N/A'}</p>
                                        <button className={styles.button} onClick={() => addToCart(p)}>Agregar al carrito</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Lomos - Solo se muestra si hay productos */}
                {hasLomos && (
                    <>
                        <h1 id="lomos" className={styles.sectionTitle} ref={lomosRef}>
                            LOMOS
                        </h1>
                        <div className={styles.grid}>
                            {lomos.map((p) => (
                                <div key={p._id} className={styles.card}>
                                    <img src={p.imageUrl || '/default-image.jpg'} alt={p.name} className={styles.image} />
                                    <div className={styles.info}>
                                        <h2 className={styles.title}>{p.name}</h2>
                                        <p className={styles.description}>{p.description}</p>
                                        <p className={styles.price}>${p.price?.toFixed(2) || 'N/A'}</p>
                                        <button className={styles.button} onClick={() => addToCart(p)}>Agregar al carrito</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default MenuPage;