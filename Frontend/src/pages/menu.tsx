import React from 'react';
import styles from './menu.module.css';
import { products } from '../components/layout/productlist';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const MenuPage: React.FC = () => {
  const hamburgers = products.filter((p: Product) => p.category === 'hamburguesa');
  const fries = products.filter((p: Product) => p.category === 'papas');

  return (
    <div className={styles.menuContainer}>
      <h1 className={styles.sectionTitle}>HAMBURGUESAS</h1>
      <div className={styles.grid}>
        {hamburgers.map((product: Product) => (
          <div key={product.id} className={styles.card}>
            <img src={product.image} alt={product.name} className={styles.image} />
            <div className={styles.info}>
              <h2 className={styles.title}>{product.name}</h2>
              <p className={styles.description}>{product.description}</p>
              <p className={styles.price}>${product.price.toFixed(2)}</p>
              <button className={styles.button}>Agregar al carrito</button>
            </div>
          </div>
        ))}
      </div>

      <h1 className={styles.sectionTitle}>PAPAS FRITAS</h1>
      <div className={styles.grid}>
        {fries.map((product: Product) => (
          <div key={product.id} className={styles.card}>
            <img src={product.image} alt={product.name} className={styles.image} />
            <div className={styles.info}>
              <h2 className={styles.title}>{product.name}</h2>
              <p className={styles.description}>{product.description}</p>
              <p className={styles.price}>${product.price.toFixed(2)}</p>
              <button className={styles.button}>Agregar al carrito</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
