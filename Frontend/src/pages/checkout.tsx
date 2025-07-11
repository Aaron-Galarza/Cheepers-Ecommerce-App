// src/pages/checkout.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/layout/cartcontext'; // Asegúrate de que esta ruta sea correcta
import styles from './checkout.module.css'; // Importa tu CSS Module
import Button from '../components/layout/button'; // Importa el componente Button desde su ubicación
import { FaUser, FaPhone, FaEnvelope, FaMoneyBillWave } from 'react-icons/fa'; // Iconos de Font Awesome

const CheckoutPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [metodo, setMetodo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleConfirm = () => {
    if (!email || !name || !phone || !metodo) {
      setErrorMessage('Por favor, completá todos los campos.');
      return;
    }
    setErrorMessage('');
    clearCart();
    navigate('/order-confirmation');
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Confirmar Pedido</h1>

      <div className={styles.gridContainer}>
        {/* Formulario de Datos */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.iconWrapper}><FaUser /></span> Datos Generales
          </h2>
          {errorMessage && (
            <div className={styles.errorMessage} role="alert">
              <strong className={styles.errorMessageStrong}>¡Error!</strong>
              <span className={styles.errorMessageSpan}> {errorMessage}</span>
            </div>
          )}
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><FaEnvelope /></span>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={styles.inputField}
              />
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><FaUser /></span>
              <input
                type="text"
                placeholder="Nombre y apellido"
                value={name}
                onChange={e => setName(e.target.value)}
                className={styles.inputField}
              />
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><FaPhone /></span>
              <input
                type="tel"
                placeholder="Número de teléfono"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={styles.inputField}
              />
            </div>
          </div>

          <h3 className={styles.sectionTitle}>
            <span className={styles.iconWrapper}><FaMoneyBillWave /></span> Forma de Pago
          </h3>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="efectivo"
                checked={metodo === 'efectivo'}
                onChange={() => setMetodo('efectivo')}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>Efectivo</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="mercadopago"
                checked={metodo === 'mercadopago'}
                onChange={() => setMetodo('mercadopago')}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>Mercado Pago</span>
            </label>
          </div>

          <div className={styles.formButtons}>
            <Button className={styles.backButton} onClick={() => navigate('/carrito')}>
              Atrás
            </Button>
            <Button className={styles.confirmButton} onClick={handleConfirm}>
              Confirmar pedido
            </Button>
          </div>
        </div>

        {/* Resumen del Pedido */}
        <div className={styles.summarySection}>
          <h2 className={styles.summaryTitle}>Mi Pedido</h2>
          <div className={styles.summaryItems}>
            {cart.length === 0 ? (
              <p className={styles.summaryEmpty}>No hay productos en el carrito.</p>
            ) : (
              cart.map(item => (
                <div key={item._id} className={styles.summaryItem}>
                  <p className={styles.summaryItemName}><strong>{item.name}</strong> (x{item.quantity})</p>
                  <p className={styles.summaryItemPrice}>${item.price.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
          <hr className={styles.summaryDivider} />
          <div className={styles.summaryTotalRow}>
            <p className={styles.summaryTotalLabel}>Subtotal:</p>
            <p className={styles.summaryTotalValue}>${total.toFixed(2)}</p>
          </div>
          <div className={styles.summaryGrandTotalRow}>
            <p className={styles.summaryGrandTotalLabel}>Total:</p>
            <p className={styles.summaryGrandTotalValue}>${total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;