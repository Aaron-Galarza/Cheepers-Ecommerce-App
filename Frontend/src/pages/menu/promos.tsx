import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../css/menu.module.css';
import { Product } from '../../components/layout/checkout/productlist'; 
import { useCart } from '../../components/layout/checkout/cartcontext';

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

const PromosPage: React.FC = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<Product[]>(`${API_BASE_URL}/api/products`);
                setProducts(response.data.filter(p => p.isActive && p.category === 'Promos Solo en Efectivo'));
            } catch (err) {
                console.error('Error al cargar las promos:', err);
                setError('No se pudieron cargar las promos.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []); 

    const groupedPromos = products
        .filter(p => p.category === 'Promos Solo en Efectivo') 
        .reduce((acc, promo) => {
            const tag = (promo.tags && promo.tags.length > 0) ? promo.tags[0] : 'promo-normal'; 
            
            if (!acc[tag]) {
                acc[tag] = [];
            }
            acc[tag].push(promo);
            return acc;
        }, {} as Record<string, Product[]>);

    const tagToTitleMap: Record<string, string> = {
        'promo-normal': 'PROMOCIONES',
        'pizza-promo': 'PROMOS DE PIZZA',
        'lunes-a-jueves': 'PROMOS LUNES A JUEVES',
    };

    if (loading) return <div className={styles.menuContainer}>Cargando promos...</div>;
    if (error) return <div className={styles.menuContainer} style={{ color: 'red' }}>{error}</div>;

    return (
        <div className={styles.menuContainer}>
            {Object.keys(groupedPromos).length === 0 && !loading && !error ? (
                <p>No hay promociones disponibles.</p>
            ) : (
                Object.keys(groupedPromos).map(tag => (
                    <div key={tag}>
                        <h1 className={styles.promoSectionTitle}>{tagToTitleMap[tag] || tag.toUpperCase()}</h1> 
                        <div className={styles.grid}>
                            {groupedPromos[tag].map((p) => (
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
                    </div>
                ))
            )}
        </div>
    );
};

export default PromosPage;