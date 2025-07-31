import React from 'react';
import styles from './ShippingCostModal.module.css'; // Usá un CSS module propio o el mismo de ordersmanagement

interface ShippingCostModalProps {
  shippingCostInput: string;
  setShippingCostInput: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ShippingCostModal: React.FC<ShippingCostModalProps> = ({
  shippingCostInput,
  setShippingCostInput,
  onConfirm,
  onCancel
}) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Ingresar Costo de Envío</h3>
        <p>El pedido es para entrega a domicilio. Por favor, ingresa el costo de envío.</p>
        <input
          type="number"
          value={shippingCostInput}
          onChange={(e) => setShippingCostInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onConfirm();
          }}
          className={styles.shippingInput}
          placeholder="Ej: 500.00"
          autoFocus
        />
        <div className={styles.modalActions}>
          <button onClick={onConfirm} className={styles.confirmButton}>Aceptar</button>
          <button onClick={onCancel} className={styles.cancelButton}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ShippingCostModal;
