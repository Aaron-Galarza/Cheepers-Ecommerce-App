import React, { useState } from 'react';
import {
  FaCalendarAlt, FaUser, FaBox, FaMoneyBillWave,
  FaCheckCircle, FaTimesCircle, FaPhone, FaPlayCircle
} from 'react-icons/fa';
import styles from './../pages/management.styles/ordersmanagement.module.css';
import { OrderDisplay } from '../pages/management/ordersmanagement';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface OrderListDisplayProps {
  filteredOrders: OrderDisplay[];
  filterStatus: 'pending' | 'processing' | 'delivered' | 'cancelled' | 'all';
  setFilterStatus: React.Dispatch<React.SetStateAction<'pending' | 'processing' | 'delivered' | 'cancelled' | 'all'>>;
  handleOrderDelivered: (orderId: string) => void;
  handleOrderCancelled: (orderId: string) => void;
  handleOrderRestore: (orderId: string) => void;
  handleOrderAccept: (orderId: string) => void;
  updateOrderInState: (orderId: string, updates: Partial<OrderDisplay>) => void;
}

const OrderListDisplay: React.FC<OrderListDisplayProps> = ({
  filteredOrders,
  filterStatus,
  setFilterStatus,
  handleOrderDelivered,
  handleOrderCancelled,
  handleOrderRestore,
  handleOrderAccept,
  updateOrderInState,
}) => {
  const [isUpdatingPayment, setIsUpdatingPayment] = useState<Record<string, boolean>>({});

  // Función para generar el enlace de WhatsApp
  const generateWhatsAppMessageLink = (order: OrderDisplay): string => {
    let cleanedPhoneNumber = order.guestPhone.replace(/\D/g, '');

    if (cleanedPhoneNumber.length > 1 && cleanedPhoneNumber.startsWith('0') && !cleanedPhoneNumber.startsWith('540')) {
      cleanedPhoneNumber = cleanedPhoneNumber.substring(1);
    }

    let formattedNumber = cleanedPhoneNumber;
    if (!cleanedPhoneNumber.startsWith('54')) {
      formattedNumber = `549${cleanedPhoneNumber}`;
    } else if (cleanedPhoneNumber.startsWith('54') && !cleanedPhoneNumber.startsWith('549')) {
      formattedNumber = `549${cleanedPhoneNumber.substring(2)}`;
    }

    const paymentMethodDisplay = order.paymentMethod === 'cash' ? 'Efectivo' :
      order.paymentMethod === 'card' ? 'Mercado Pago' :
      'Transferencia';

    let message = `¡Hola ${order.guestName}!\n`;
    message += `Tu pedido Cheepers ha sido ACEPTADO y está siendo preparado.\n\n`;
    message += `Detalles de tu pedido:\n`;
    order.products.forEach(p => {
      message += `- ${p.name} (x${p.quantity})\n`;
      if (Array.isArray(p.addOns) && p.addOns.length > 0) {
        p.addOns.forEach(ao => {
          message += `  + ${ao.name} (x${ao.quantity})\n`;
        });
      }
    });

    message += `\nTotal: $${order.totalAmount.toFixed(2)}\n`;
    message += `Método de pago: ${paymentMethodDisplay}\n`;
    message += `Tipo de entrega: ${order.deliveryType === 'delivery' ? 'Envío a domicilio' : 'Retiro en sucursal'}`;
    if (order.deliveryType === 'delivery' && order.shippingAddress) {
      message += `\nDirección: ${order.shippingAddress.street}, ${order.shippingAddress.city}`;
    }
    message += `\n\n¿Quieres agregar algo más?`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
  };

  const handleUpdatePaymentMethod = async (orderId: string, currentMethod: 'cash' | 'card') => {
    const newMethod = currentMethod === 'cash' ? 'card' : 'cash';
    
    setIsUpdatingPayment(prevState => ({ ...prevState, [orderId]: true }));

    try {
      const response = await axios.put(`${API_BASE_URL}/api/orders/${orderId}/paymentMethod`, {
        paymentMethod: newMethod,
      });

      console.log('Método de pago actualizado:', response.data);
      
      // Actualizar el estado local con los datos que devuelve el backend
      // El backend recalcula el totalAmount y devuelve el pedido actualizado
      const updatedOrder = response.data.order;
      
      updateOrderInState(orderId, { 
        paymentMethod: updatedOrder.paymentMethod,
        totalAmount: updatedOrder.totalAmount
      });
      
      alert(`Método de pago del pedido #${orderId.slice(-8)} actualizado a ${newMethod === 'cash' ? 'Efectivo' : 'Mercado Pago'}.`);
      
    } catch (error: any) {
      console.error('Error al actualizar el método de pago:', error);
      alert(`Error al actualizar el método de pago: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsUpdatingPayment(prevState => ({ ...prevState, [orderId]: false }));
    }
  };

  return (
    <>
      <div className={styles.filterContainer}>
        <label htmlFor="statusFilter">Filtrar por estado: </label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className={styles.filterSelect}
        >
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="processing">En proceso</option>
          <option value="delivered">Entregados</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>

      <div className={styles.ordersList}>
        {filteredOrders.length === 0 ? (
          <p className={styles.noOrdersMessage}>No hay pedidos para mostrar.</p>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <p className={styles.orderDate}>
                  <FaCalendarAlt /> {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
                <p className={styles.customerName}><FaUser /> {order.guestName}</p>
                <p className={styles.customerPhone}>
                  <FaPhone />{' '}
                  <a
                    href={generateWhatsAppMessageLink(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappLink}
                  >
                    {order.guestPhone}
                  </a>
                </p>
              </div>
              <div className={styles.orderBody}>
                <div className={styles.productsList}>
                  <p className={styles.productsTitle}><FaBox /> Productos:</p>
                  <ul>
                    {order.products.map((item, index) => (
                      <li key={index}>
                        {item.name} (x{item.quantity})
                        {item.addOns && item.addOns.length > 0 && (
                          <ul className={styles.addOnsSublist}>
                            {item.addOns.map((addOn, i) => (
                              <li key={i} className={styles.addOnItem}>
                                └ {addOn.name} - ${addOn.price.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.orderDetails}>
                  <p className={styles.totalAmount}><FaMoneyBillWave /> Total: ${order.totalAmount.toFixed(2)}</p>
                  <p className={styles.deliveryType}>Tipo de entrega: {order.deliveryType === 'delivery' ? 'Envío a domicilio' : 'Retiro en sucursal'}</p>
                  {order.deliveryType === 'delivery' && order.shippingAddress && (
                    <p className={styles.shippingAddress}>Dirección: {order.shippingAddress.street}, {order.shippingAddress.city}</p>
                  )}
                <p className={styles.paymentMethod}>Método de pago:
    <span className={styles.paymentMethodValue}>
    {order.paymentMethod === 'cash' ? ' Efectivo' : 
     order.paymentMethod === 'card' ? ' Mercado Pago' : 
     ' Transferencia'}
  </span>
</p>
                  <p className={styles.orderStatus}>Estado:
                    <span className={
                      order.status === 'pending' ? styles.statusPending :
                      order.status === 'processing' ? styles.statusProcessing :
                      order.status === 'delivered' ? styles.statusDelivered :
                      styles.statusCancelled
                    }>
                      {
                        order.status === 'pending' ? ' Pendiente' :
                        order.status === 'processing' ? ' En Proceso' :
                        order.status === 'delivered' ? ' Entregado' :
                        ' Cancelado'
                      }
                    </span>
                  </p>
                  {/* Botón para cambiar el método de pago */}
                  {(order.status === 'pending' || order.status === 'processing') && (order.paymentMethod === 'cash' || order.paymentMethod === 'card') && (
                    <button
                      onClick={() => handleUpdatePaymentMethod(order._id, order.paymentMethod as 'cash' | 'card')}
                      disabled={isUpdatingPayment[order._id]}
                      className={styles.changePaymentButton}
                    >
                      {isUpdatingPayment[order._id] ? 'Cambiando...' : `Cambiar a ${order.paymentMethod === 'cash' ? 'Mercado Pago' : 'Efectivo'}`}
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.orderActions}>
                {order.status === 'pending' && (
                  <button onClick={() => handleOrderAccept(order._id)} className={styles.acceptButton}>
                    <FaPlayCircle /> Aceptar Pedido
                  </button>
                )}
                {order.status === 'pending' && (
                  <button onClick={() => handleOrderCancelled(order._id)} className={styles.cancelButton}>
                    <FaTimesCircle /> Cancelar
                  </button>
                )}
                {order.status === 'processing' && (
                  <>
                    <button onClick={() => handleOrderDelivered(order._id)} className={styles.deliveredButton}>
                      <FaCheckCircle /> Marcar Entregado
                    </button>
                    <button onClick={() => handleOrderCancelled(order._id)} className={styles.cancelButton}>
                      <FaTimesCircle /> Cancelar
                    </button>
                  </>
                )}
                {order.status === 'cancelled' && (
                  <button onClick={() => handleOrderRestore(order._id)} className={styles.restoreButton}>
                    <FaPlayCircle /> Restaurar Pedido
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default OrderListDisplay;