// src/pages/carrito.tsx
import React from 'react';
import { useCart } from '../components/layout/cartcontext'; // Asegúrate de que esta ruta sea correcta
import styles from './carrito.module.css'; // Importa tu CSS Module
import { useNavigate } from 'react-router-dom';
import Button from '../components/layout/button'; // Importa el componente Button desde su ubicación
// import { GiHamburger } from 'react-icons/gi'; // Solo si usas este ícono aquí, si no, puedes eliminarlo

const CarritoPage: React.FC = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tu Carrito</h1>
      {cart.length === 0 ? (
        <p className={styles.empty}>El carrito está vacío.</p>
      ) : (
        <>
          <ul className={styles.list}>
            {cart.map(item => (
              <li key={item._id} className={styles.item}>
                <img src={item.imageUrl} alt={item.name} className={styles.image} />
                <div className={styles.info}>
                  <h2 className={styles.itemName}>{item.name}</h2>
                  <p className={styles.itemQuantity}>Cantidad: {item.quantity}</p>
                  <p className={styles.itemSubtotal}>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                  <Button className={styles.removeButton} onClick={() => removeFromCart(item._id)}>Eliminar</Button>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.footer}>
            <p className={styles.total}>Total: ${total.toFixed(2)}</p>
            <div className={styles.buttonsContainer}>
                {/* Usamos el componente Button importado y le aplicamos clases del módulo */}
                <Button className={styles.checkoutButton} onClick={() => navigate('/checkout')}>Confirmar pedido</Button>
                <Button className={styles.clearCartButton} onClick={clearCart}>Vaciar Carrito</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CarritoPage;
