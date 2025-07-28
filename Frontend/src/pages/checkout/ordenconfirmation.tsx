// src/components/layout/orderconfirmation.tsx
import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Comentamos o eliminamos esto
import { useCart } from '../../components/layout/checkout/cartcontext';
import { FaCheckCircle } from 'react-icons/fa';
import Button from '../../components/layout/design/button';
import styles from './../css/ordenconfirmation.module.css';

const OrderConfirmationPage: React.FC = () => {
  // const navigate = useNavigate(); // Ya no lo necesitamos si usamos window.location
  const { clearCart } = useCart();

  useEffect(() => {
    console.log('OrderConfirmationPage mounted. Clearing cart...');
    clearCart();
  }, [clearCart]);

  const handleGoHome = () => {
    console.log('Attempting to navigate to / using window.location.href');
    window.location.href = '/'; // Navegación directa forzada
  };

  const handleViewMenu = () => {
    console.log('Attempting to navigate to /menu using window.location.href');
    window.location.href = '/menu'; // Navegación directa forzada
  };

  return (
    <div className={styles.container}>
      <span className={styles.icon}>
        <FaCheckCircle />
      </span>
      <h1 className={styles.title}>¡Pedido Finalizado!</h1>
      <p className={styles.message}>
        Gracias por tu compra. Recibirás una confirmación en tu correo electrónico.
      </p>
      <div className={styles.buttonsContainer}>
        <Button className={styles.buttonDefault} onClick={handleGoHome}>
          Volver al Inicio
        </Button>
        <Button className={styles.buttonOutline} onClick={handleViewMenu}>
          Ver Menú
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
