import React from 'react';
import {
  FaCalendarAlt, FaUser, FaBox, FaMoneyBillWave,
  FaCheckCircle, FaTimesCircle, FaPhone, FaRedo, FaPlayCircle
} from 'react-icons/fa';
import styles from './../pages/management.styles/ordersmanagement.module.css';
import { OrderDisplay } from '../pages/management/ordersmanagement'; // Re-importar OrderDisplay

interface OrderListDisplayProps {
  filteredOrders: OrderDisplay[];
  filterStatus: 'pending' | 'processing' | 'delivered' | 'cancelled' | 'all';
  setFilterStatus: React.Dispatch<React.SetStateAction<'pending' | 'processing' | 'delivered' | 'cancelled' | 'all'>>;
  handleOrderDelivered: (orderId: string) => void;
  handleOrderCancelled: (orderId: string) => void;
  handleOrderRestore: (orderId: string) => void;
  handleOrderAccept: (orderId: string) => void;
}

// Función para formatear el número de teléfono para WhatsApp y generar el enlace
const generateWhatsAppMessageLink = (order: OrderDisplay): string => {
  // Limpia el número de cualquier caracter que no sea dígito
  let cleanedPhoneNumber = order.guestPhone.replace(/\D/g, '');

  // Elimina un posible cero inicial para números locales (ej. 011 -> 11),
  // pero solo si no es parte de un prefijo de país ya incluido (como '540...')
  // y si el número tiene más de un dígito para no eliminar un '0' único.
  if (cleanedPhoneNumber.length > 1 && cleanedPhoneNumber.startsWith('0') && !cleanedPhoneNumber.startsWith('540')) {
    cleanedPhoneNumber = cleanedPhoneNumber.substring(1);
  }

  // Ajuste para números de Argentina (código de país 54, prefijo 9 para móvil)
  let formattedNumber = cleanedPhoneNumber;
  if (!cleanedPhoneNumber.startsWith('54')) {
    formattedNumber = `549${cleanedPhoneNumber}`;
  } else if (cleanedPhoneNumber.startsWith('54') && !cleanedPhoneNumber.startsWith('549')) {
    // Si ya empieza con 54 pero no con 549 (ej. es un fijo o le falta el 9 para móvil)
    // Asumimos que para WhatsApp móvil en Argentina necesita el 9.
    formattedNumber = `549${cleanedPhoneNumber.substring(2)}`;
  }
  // Si ya tiene 549, o si después de la limpieza y ajuste ya es un número válido.

  // Determinar el nombre legible del método de pago
  const paymentMethodDisplay = order.paymentMethod === 'cash' ? 'Efectivo' :
    order.paymentMethod === 'card' ? 'Mercado Pago' :
    'Transferencia';


  // Construye el mensaje automático (sin el ID del pedido completo)
  let message = `¡Hola ${order.guestName}!\n`;
  message += `Tu pedido Cheepers ha sido ACEPTADO y está siendo preparado.\n\n`; // Mensaje simplificado
  message += `Detalles de tu pedido:\n`;
  message += `Productos:\n`;
  order.products.forEach(p => {
    message += `- ${p.name} (x${p.quantity})\n`;
    if (Array.isArray(p.addOns) && p.addOns.length > 0) {
      p.addOns.forEach(ao => {
        message += `  + ${ao.name} (x${ao.quantity})\n`;
      });
    }
  });

  message += `\nTotal: $${order.totalAmount.toFixed(2)}\n`;
  message += `Método de pago: ${paymentMethodDisplay}\n`; // AÑADIDO: Método de pago
  message += `Tipo de entrega: ${order.deliveryType === 'delivery' ? 'Envío a domicilio' : 'Retiro en sucursal'}`;
  if (order.deliveryType === 'delivery' && order.shippingAddress) {
    message += `\nDirección: ${order.shippingAddress.street}, ${order.shippingAddress.city}`;
  }
  message += `\n\n¿Quieres agregar algo más?`;

  // Codifica el mensaje para que pueda ir en la URL
  const encodedMessage = encodeURIComponent(message);

  // Construye el enlace de WhatsApp
  return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
};


const OrderListDisplay: React.FC<OrderListDisplayProps> = ({
  filteredOrders,
  filterStatus,
  setFilterStatus,
  handleOrderDelivered,
  handleOrderCancelled,
  handleOrderRestore,
  handleOrderAccept,
}) => {
  return (
    <>
      {/* Sección de Filtros */}
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

      {/* Lista de Pedidos */}
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
                {/* CAMBIO CLAVE AQUÍ: Usar la nueva función para el enlace de WhatsApp con mensaje */}
                <p className={styles.customerPhone}>
                  <FaPhone />{' '}
                  <a
                    href={generateWhatsAppMessageLink(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappLink} // Puedes definir esta clase en ordersmanagement.module.css para estilo
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
                  <p className={styles.paymentMethod}>Método de pago: {order.paymentMethod === 'cash' ? 'Efectivo' : order.paymentMethod === 'card' ? 'Mercado Pago' : 'Transferencia'}</p>
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
                </div>
              </div>
              <div className={styles.orderActions}>
                {order.status === 'pending' && (
                  <button onClick={() => handleOrderAccept(order._id)} className={styles.acceptButton}>
                    <FaPlayCircle /> Aceptar Pedido
                  </button>
                )}
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => handleOrderCancelled(order._id)} className={styles.cancelButton}>
                      <FaTimesCircle /> Cancelar
                    </button>
                  </>
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
                {(order.status === 'delivered' || order.status === 'cancelled') && (
                  <button onClick={() => handleOrderRestore(order._id)} className={styles.restoreButton}>
                    <FaRedo /> Restaurar a Pendiente
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