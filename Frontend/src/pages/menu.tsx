// C:\Users\Usuario\Desktop\Aaron\front-facu\Cheepers-Ecommerce-App\Frontend\src\pages\menu.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Aseg\u00FArate de haber instalado axios: npm install axios
import styles from './menu.module.css';
import { Product } from '../components/layout/productlist';
import { useCart } from '../components/layout/cartcontext'; // Aseg\u00FArate de que la ruta a cartcontext sea correcta

const API_BASE_URL = 'http://localhost:5000/api'; // URL de tu backend

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
        // Realiza la petici\u00F3n GET a tu backend
        const response = await axios.get<Product[]>(`${API_BASE_URL}/products`);
        setProducts(response.data);
      } catch (err) {
        console.error('Error al cargar los productos:', err);
        setError('No se pudieron cargar los productos. Intenta de nuevo m\u00E1s tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // El array vac\u00EDo asegura que esto se ejecute solo una vez al montar el componente

  // Filtra los productos por categor\u00EDa. Las categor\u00EDas deben coincidir EXACTAMENTE
  // con los valores de 'category' en tu JSON de productos en MongoDB Atlas.
  const hamburgers = products.filter((p) => p.category === 'Hamburguesas');
  const fries = products.filter((p) => p.category === 'Papas Fritas');
  const promos = products.filter((p) => p.category === 'Promos Solo en Efectivo');
  const pizzas = products.filter((p) => p.category === 'Pizzas');
  // Puedes a\u00F1adir m\u00E1s categor\u00EDas si tienes.

  if (loading) {
    return <div className={styles.menuContainer}>Cargando productos...</div>;
  }

  if (error) {
    return <div className={styles.menuContainer} style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className={styles.menuContainer}>
      {/* Secci\u00F3n de Hamburguesas */}
      <h1 className={styles.sectionTitle}>HAMBURGUESAS</h1>
      <div className={styles.grid}>
        {hamburgers.map((p: Product) => (
          <div key={p._id} className={styles.card}>
            {/* Si p.imageUrl es null o undefined, se muestra una imagen por defecto. */}
            {/* Aseg\u00FArate de tener un archivo 'default-image.jpg' en tu carpeta 'public' o ajusta la ruta. */}
            <img 
                src={p.imageUrl || '/default-image.jpg'} 
                alt={p.name} 
                className={styles.image}
            />
            <div className={styles.info}>
              <h2 className={styles.title}>{p.name}</h2>
              <p className={styles.description}>{p.description}</p>
              {/* toFixed(2) para mostrar 2 decimales, y 'N/A' si el precio es null/undefined */}
              <p className={styles.price}>${p.price ? p.price.toFixed(2) : 'N/A'}</p>
              <button className={styles.button} onClick={() => addToCart(p)}>Agregar al carrito</button>
            </div>
          </div>
        ))}
      </div>

      {/* Secci\u00F3n de Papas Fritas */}
      <h1 className={styles.sectionTitle}>PAPAS FRITAS</h1>
      <div className={styles.grid}>
        {fries.map((p: Product) => (
          <div key={p._id} className={styles.card}>
            <img 
                src={p.imageUrl || '/default-image.jpg'} 
                alt={p.name} 
                className={styles.image}
            />
            <div className={styles.info}>
              <h2 className={styles.title}>{p.name}</h2>
              <p className={styles.description}>{p.description}</p>
              <p className={styles.price}>${p.price ? p.price.toFixed(2) : 'N/A'}</p>
              <button className={styles.button} onClick={() => addToCart(p)}>Agregar al carrito</button>
            </div>
          </div>
        ))}
      </div>

      {/* Secci\u00F3n de Promos Solo en Efectivo */}
      <h1 className={styles.sectionTitle}>PROMOS SOLO EN EFECTIVO</h1>
      <div className={styles.grid}>
        {promos.map((p: Product) => (
          <div key={p._id} className={styles.card}>
            <img 
                src={p.imageUrl || '/default-image.jpg'} 
                alt={p.name} 
                className={styles.image}
            />
            <div className={styles.info}>
              <h2 className={styles.title}>{p.name}</h2>
              <p className={styles.description}>{p.description}</p>
              <p className={styles.price}>${p.price ? p.price.toFixed(2) : 'N/A'}</p>
              <button className={styles.button} onClick={() => addToCart(p)}>Agregar al carrito</button>
            </div>
          </div>
        ))}
      </div>

      {/* Secci\u00F3n de Pizzas */}
      <h1 className={styles.sectionTitle}>PIZZAS</h1>
      <div className={styles.grid}>
        {pizzas.map((p: Product) => (
          <div key={p._id} className={styles.card}>
            <img 
                src={p.imageUrl || '/default-image.jpg'} 
                alt={p.name} 
                className={styles.image}
            />
            <div className={styles.info}>
              <h2 className={styles.title}>{p.name}</h2>
              <p className={styles.description}>{p.description}</p>
              <p className={styles.price}>${p.price ? p.price.toFixed(2) : 'N/A'}</p>
              <button className={styles.button} onClick={() => addToCart(p)}>Agregar al carrito</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;