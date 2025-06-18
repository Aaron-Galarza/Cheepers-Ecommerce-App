// src/pages/promos.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './menu.module.css';
import { Product } from '../components/layout/productlist';
import { useCart } from '../components/layout/cartcontext';

const API_BASE_URL = 'http://localhost:5000/api';

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
        const response = await axios.get<Product[]>(`${API_BASE_URL}/products`);
        setProducts(response.data);
      } catch (err) {
        console.error('Error al cargar las promos:', err);
        setError('No se pudieron cargar las promos.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const promos = products.filter((p) => p.category === 'Promos Solo en Efectivo');

  if (loading) return <div className={styles.menuContainer}>Cargando promos...</div>;

  if (error) return <div className={styles.menuContainer} style={{ color: 'red' }}>{error}</div>;

  return (
    <div className={styles.menuContainer}>
      <h1 className={styles.sectionTitle}>PROMOS SOLO EN EFECTIVO</h1>
      <div className={styles.grid}>
        {promos.map((p) => (
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

export default PromosPage;
