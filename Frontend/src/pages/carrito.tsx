import React from 'react';
import { useCart } from '../components/layout/cartcontext';
import styles from './carrito.module.css';

const CarritoPage: React.FC = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tu Carrito</h1>
      {cart.length === 0 ? (
        <p className={styles.empty}>El carrito está vacío.</p>
      ) : (
        <>
          <ul className={styles.list}>
            {cart.map(item => (
              <li key={item.id} className={styles.item}>
                <img src={item.image} alt={item.name} className={styles.image} />
                <div className={styles.info}>
                  <h2>{item.name}</h2>
                  <p>Cantidad: {item.quantity}</p>
                  <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    className={styles.remove}
                    onClick={() => removeFromCart(item.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.footer}>
            <p className={styles.total}>Total: ${total.toFixed(2)}</p>
            <button
              className={styles.checkout}
              onClick={() => alert('Iniciar compra')}
            >
              Iniciar Compra
            </button>
            <button className={styles.clear} onClick={clearCart}>
              Vaciar Carrito
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CarritoPage;
