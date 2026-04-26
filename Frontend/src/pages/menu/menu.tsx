import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import styles from '../css/menu.module.css';
import { Product } from '../../components/layout/checkout/productlist';
import { useCart } from '../../components/layout/checkout/cartcontext';
import { PromoFormatter } from '../../lib/markdownFormatter';

import { GiHamburger, GiFrenchFries, GiPizzaSlice, GiSteak, GiSodaCan, GiStarFormation,GiDumpling} from 'react-icons/gi';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// 1. EL DICCIONARIO DE ÍCONOS
const categoryIcons: Record<string, React.ElementType> = {
    'Hamburguesas': GiHamburger,
    'Papas Fritas': GiFrenchFries,
    'Pizzas': GiPizzaSlice,
    'Milanesas': GiSteak,
    'Bebidas': GiSodaCan,
    'Empanadas': GiDumpling
};

// 2. LA "WHITELIST" (LISTA VIP)
// Solo estas categorías van a aparecer en la página y exactamente en este orden. 
// Chau promos raras, chau lomos fantasma.
const CATEGORIAS_PERMITIDAS = [
    'Hamburguesas', 
    'Papas Fritas', 
    'Pizzas', 
    'Milanesas', 
    'Bebidas',
    'Empanadas'
];

const MenuPage: React.FC = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const sectionRefs = useRef<{ [key: string]: HTMLHeadingElement | null }>({});

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

    const scrollToCategory = (category: string) => {
        const ref = sectionRefs.current[category];
        if (ref) {
            const yOffset = -150;
            const y = ref.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    // 3. LA MAGIA FILTRADA: 
    // Comparamos nuestra Lista VIP con lo que viene de la base de datos.
    // Solo creamos la sección si la categoría está en la lista Y tiene productos adentro.
    const activeCategories = CATEGORIAS_PERMITIDAS.filter(categoryName => 
        products.some(p => p.category === categoryName)
    );

    if (loading) return <div className={styles.menuContainer}>Cargando productos...</div>;
    if (error) return <div className={styles.menuContainer} style={{ color: 'red' }}>{error}</div>;

    return (
        <>
            <nav className={styles.stickyNav}>
                <ul className={styles.navList}>
                    {activeCategories.map((category) => {
                        const IconComponent = categoryIcons[category] || GiStarFormation;
                        return (
                            <li key={`nav-${category}`}>
                                <a onClick={() => scrollToCategory(category)}>
                                    <IconComponent className={styles.navIcon} /> {category}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            
            <div className={styles.menuContainer}>
                {activeCategories.map((category) => {
                    const categoryProducts = products.filter(p => p.category === category);

                    return (
                        <React.Fragment key={`section-${category}`}>
                            <h1 
                                id={`section-${category.toLowerCase().replace(/\s+/g, '-')}`} 
                                className={styles.sectionTitle} 
                                ref={(el) => { sectionRefs.current[category] = el; }}
                            >
                                {category.toUpperCase()}
                            </h1>
                            
                            <div className={styles.grid}>
                                {categoryProducts.map((p) => (
                                    <div key={p._id} className={styles.card}>
                                        <img src={p.imageUrl || '/default-image.jpg'} alt={p.name} className={styles.image} />
                                        <div className={styles.info}>
                                            <h2 className={styles.title}>{p.name}</h2>
                                            <p className={styles.description}>{p.description}</p>
                                            <p className={styles.price}>${p.price?.toFixed(2) || 'N/A'}</p>
                                            {p.promotionalLabel && (
                                                <p className={styles.promotionalLabel}>
                                                    <PromoFormatter text={p.promotionalLabel} className={styles.promotionalLabel} />                                            
                                                </p>
                                            )}
                                            <button className={styles.button} onClick={() => addToCart(p)}>
                                                Agregar al carrito
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </>
    );
};

export default MenuPage;