import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../css/menu.module.css';
import { Product } from '../../components/layout/checkout/productlist';
import { useCart } from '../../components/layout/checkout/cartcontext';
import { PROMO_CATEGORIES, isPromoCategory } from '../../lib/promoCategories';

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
                setProducts(
                    response.data.filter(
                        p => p.isActive && isPromoCategory(p.category)
                    )
                );
            } catch (err) {
                console.error('Error al cargar las promos:', err);
                setError('No se pudieron cargar las promos.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const tagToTitleMap: Record<string, string> = {
        'promo-normal': 'PROMOCIONES',
        'pizza-promo': 'PROMOS DE PIZZA',
        'lunes-a-jueves': 'PROMOS LUNES A JUEVES',
    };

    const categoryToTitleMap: Record<string, string> = {
        'Promos del patio': 'PROMOS DEL PATIO',
    };

    const groupedPromosByCategory = PROMO_CATEGORIES.reduce((categoryAcc, category) => {
        const categoryProducts = products.filter(p => p.category === category);

        categoryAcc[category] = categoryProducts.reduce((tagAcc, promo) => {
            const tag = (promo.tags && promo.tags.length > 0) ? promo.tags[0] : 'promo-normal';

            if (!tagAcc[tag]) {
                tagAcc[tag] = [];
            }

            tagAcc[tag].push(promo);
            return tagAcc;
        }, {} as Record<string, Product[]>);

        return categoryAcc;
    }, {} as Record<string, Record<string, Product[]>>);

    if (loading) return <div className={styles.menuContainer}>Cargando promos...</div>;
    if (error) return <div className={styles.menuContainer} style={{ color: 'red' }}>{error}</div>;

    const hasPromos = PROMO_CATEGORIES.some(category => {
        const groupedPromos = groupedPromosByCategory[category];
        return groupedPromos && Object.keys(groupedPromos).length > 0;
    });

    return (
        <div className={styles.menuContainer}>
            {!hasPromos && !loading && !error ? (
                <p>No hay promociones disponibles.</p>
            ) : (
                PROMO_CATEGORIES.map(category => {
                    const groupedPromos = groupedPromosByCategory[category];
                    const isNormalPromosCategory = category === 'Promos Solo en Efectivo';
                    const flattenedPromos = Object.values(groupedPromos || {}).flat();

                    if (!groupedPromos || Object.keys(groupedPromos).length === 0) {
                        return null;
                    }

                    return (
                        <div key={category}>
                            {!isNormalPromosCategory && (
                                <h1 className={styles.promoSectionTitle}>
                                    {categoryToTitleMap[category] || category.toUpperCase()}
                                </h1>
                            )}

                            {isNormalPromosCategory ? (
                                Object.keys(groupedPromos).map(tag => (
                                    <div key={`${category}-${tag}`}>
                                        <h1 className={styles.promoSectionTitle}>
                                            {tagToTitleMap[tag] || tag.toUpperCase()}
                                        </h1>
                                        <div className={styles.grid}>
                                            {groupedPromos[tag].map((p) => (
                                                <div key={p._id} className={styles.card}>
                                                    <img src={p.imageUrl || '/default-image.jpg'} alt={p.name} className={styles.image} />
                                                    <div className={styles.info}>
                                                        <h2 className={styles.title}>{p.name}</h2>
                                                        <p className={styles.description}>{p.description}</p>
                                                        <p className={styles.price}>${p.price?.toFixed(2) || 'N/A'}</p>
                                                        <button className={styles.button} onClick={() => addToCart(p)}>
                                                            Agregar al carrito
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.grid}>
                                    {flattenedPromos.map((p) => (
                                        <div key={p._id} className={styles.card}>
                                            <img src={p.imageUrl || '/default-image.jpg'} alt={p.name} className={styles.image} />
                                            <div className={styles.info}>
                                                <h2 className={styles.title}>{p.name}</h2>
                                                <p className={styles.description}>{p.description}</p>
                                                <p className={styles.price}>${p.price?.toFixed(2) || 'N/A'}</p>
                                                <button className={styles.button} onClick={() => addToCart(p)}>
                                                    Agregar al carrito
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default PromosPage;
