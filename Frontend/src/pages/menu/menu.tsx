// src/pages/menu.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../css/menu.module.css';
import { Product } from '../../components/layout/checkout/productlist';
import { useCart } from '../../components/layout/checkout/cartcontext';

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

const MenuPage: React.FC = () => {
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

  const hamburgers = products.filter((p) => p.category === 'Hamburguesas');
  const fries = products.filter((p) => p.category === 'Papas Fritas');
  const pizzas = products.filter((p) => p.category === 'Pizzas');

  if (loading) return <div className={styles.menuContainer}>Cargando productos...</div>;

  if (error) return <div className={styles.menuContainer} style={{ color: 'red' }}>{error}</div>;

  return (
    <div className={styles.menuContainer}>
      <h1 className={styles.sectionTitle}>HAMBURGUESAS</h1>
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

      <h1 className={styles.sectionTitle}>PAPAS FRITAS</h1>
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

      <h1 className={styles.sectionTitle}>PIZZAS</h1>
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
    </div>
  );
};

export default MenuPage;
