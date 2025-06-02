import React from 'react';
import styles from './menu.module.css';
import { products, Product } from '../components/layout/productlist';
import { useCart } from '../components/layout/cartcontext';

const MenuPage: React.FC = () => {
  const { addToCart } = useCart();
  const hamburgers = products.filter((p) => p.category === 'hamburguesa');
  const fries      = products.filter((p) => p.category === 'papas');

  return (
    <div className={styles.menuContainer}>
      <h1 className={styles.sectionTitle}>HAMBURGUESAS</h1>
      <div className={styles.grid}>
        {hamburgers.map((p: Product) => (
          <div key={p.id} className={styles.card}>
            <img src={p.image} alt={p.name} className={styles.image} />
            <div className={styles.info}>
              <h2 className={styles.title}>{p.name}</h2>
              <p className={styles.description}>{p.description}</p>
              <p className={styles.price}>${p.price.toFixed(2)}</p>
              <button
                className={styles.button}
                onClick={() => addToCart(p)}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        ))}
      </div>

      <h1 className={styles.sectionTitle}>PAPAS FRITAS</h1>
      <div className={styles.grid}>
        {fries.map((p: Product) => (
          <div key={p.id} className={styles.card}>
            <img src={p.image} alt={p.name} className={styles.image} />
            <div className={styles.info}>
              <h2 className={styles.title}>{p.name}</h2>
              <p className={styles.description}>{p.description}</p>
              <p className={styles.price}>${p.price.toFixed(2)}</p>
              <button
                className={styles.button}
                onClick={() => addToCart(p)}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
