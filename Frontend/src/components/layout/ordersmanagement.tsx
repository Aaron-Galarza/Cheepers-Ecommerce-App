// src/components/layout/OrdersManagement.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ordersmanagement.module.css';
import { FaCalendarAlt, FaUser, FaBox, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaPhone, FaRedo } from 'react-icons/fa'; // Importa FaRedo para el botón de restaurar
import authService from '../../services/authservice'; // Importa authService para que su interceptor se inicialice

// Interfaz para un producto dentro de un pedido (con nombre populado para mostrar)
interface OrderProductDisplay {
  productId: string;
  quantity: number;
  name: string; // Nombre del producto, populado desde la lista de productos
}

// Interfaz para la estructura de un pedido tal como viene del backend
export interface Order {
  _id: string;
  guestEmail: string;
  guestName: string;
  guestPhone: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  deliveryType: 'delivery' | 'pickup';
  shippingAddress?: {
    street: string;
    city: string;
  };
  products: Array<{ productId: string; quantity: number }>; // Productos en el formato original del backend
  createdAt: string; // Fecha de creación del pedido
  status: 'pending' | 'delivered' | 'cancelled'; // Estados posibles del pedido
}

// Interfaz para la estructura de un pedido con los nombres de los productos ya populados
interface OrderDisplay extends Omit<Order, 'products'> {
  products: OrderProductDisplay[];
}

// Interfaz de Producto (para obtener nombres de productos)
interface Product {
  _id: string;
  name: string;
  // Otros campos de producto si son necesarios, pero solo necesitamos _id y name aquí
}

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // El token se adjunta automáticamente por el interceptor de Axios configurado en authService
      // No es necesario obtenerlo manualmente aquí ni pasarlo en los headers.

      // Paso 1: Obtener todos los productos para crear un mapa de IDs a nombres
      const productsResponse = await axios.get<Product[]>(`${API_BASE_URL}/api/products`);
      const productMap = new Map<string, string>();
      productsResponse.data.forEach(p => productMap.set(p._id, p.name));

      // Paso 2: Obtener todos los pedidos
      // Asegúrate de que tu backend envíe TODOS los pedidos, incluyendo los entregados/cancelados
      const ordersResponse = await axios.get<Order[]>(`${API_BASE_URL}/api/orders`);

      // Paso 3: Mapear los pedidos y poblar los nombres de los productos
      const ordersWithProductNames: OrderDisplay[] = ordersResponse.data.map(order => ({
        ...order,
        products: order.products.map(p => ({
          ...p,
          name: productMap.get(p.productId) || 'Producto Desconocido', // Asigna el nombre o un valor por defecto
        })),
      }));

      // Ordenar los pedidos por fecha de creación (más recientes primero)
      ordersWithProductNames.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setOrders(ordersWithProductNames);
    } catch (err: any) {
      console.error('Error al cargar los pedidos:', err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          authService.logout(); // Limpia el token si la sesión no es válida
          setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
        } else {
          setError(`Error al cargar los pedidos: ${err.response.data.message || err.message}`);
        }
      } else {
        setError('No se pudieron cargar los pedidos. Verifica la conexión a internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar el estado del pedido
  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'delivered' | 'cancelled') => {
    try {
      // El token se adjunta automáticamente por el interceptor de Axios
      await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Refrescar la lista de pedidos después de la actualización
    } catch (err: any) {
      console.error(`Error al actualizar el pedido ${orderId} a ${newStatus}:`, err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          authService.logout(); // Limpia el token si la sesión no es válida
          setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
        } else {
          setError(`Error al actualizar el pedido: ${err.response.data.message || err.message}. Asegúrate de que la ruta PUT /api/orders/:id/status acepte actualizaciones de estado y que tengas permisos.`);
        }
      } else {
        setError('Error al actualizar el pedido. Verifica la conexión a internet.');
      }
    }
  };

  const handleOrderDelivered = (orderId: string) => {
    if (window.confirm('¿Estás seguro de que quieres marcar este pedido como ENTREGADO?')) {
      updateOrderStatus(orderId, 'delivered');
    }
  };

  const handleOrderCancelled = (orderId: string) => {
    if (window.confirm('¿Estás seguro de que quieres CANCELAR este pedido?')) {
      updateOrderStatus(orderId, 'cancelled');
    }
  };

  const handleOrderRestore = (orderId: string) => {
    if (window.confirm('¿Estás seguro de que quieres RESTAURAR este pedido a PENDIENTE?')) {
      updateOrderStatus(orderId, 'pending');
    }
  };

  if (loading) return <div className={styles.loading}>Cargando pedidos...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.ordersManagementContainer}>
      <h1 className={styles.title}>Gestión de Pedidos</h1>

      <div className={styles.ordersList}>
        {orders.length === 0 && !loading && !error ? (
          <p className={styles.noOrdersMessage}>No hay pedidos para mostrar.</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                {/* Muestra la fecha y hora sin segundos */}
                <p className={styles.orderDate}>
                  <FaCalendarAlt /> {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {/* Muestra el nombre y número de teléfono del cliente */}
                <p className={styles.customerName}>
                  <FaUser /> {order.guestName}
                </p>
                <p className={styles.customerPhone}>
                  <FaPhone /> {order.guestPhone}
                </p>
              </div>
              <div className={styles.orderBody}>
                <div className={styles.productsList}>
                  <p className={styles.productsTitle}><FaBox /> Productos:</p>
                  <ul>
                    {order.products.map((item, index) => (
                      <li key={index}>{item.name} (x{item.quantity})</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.orderDetails}>
                  <p className={styles.totalAmount}><FaMoneyBillWave /> Total: ${order.totalAmount.toFixed(2)}</p>
                  <p className={styles.deliveryType}>Tipo de entrega: {order.deliveryType === 'delivery' ? 'Envío a domicilio' : 'Retiro en sucursal'}</p>
                  {order.deliveryType === 'delivery' && order.shippingAddress && (
                    <p className={styles.shippingAddress}>Dirección: {order.shippingAddress.street}, {order.shippingAddress.city}</p>
                  )}
                  <p className={styles.paymentMethod}>Método de pago: {order.paymentMethod === 'cash' ? 'Efectivo' : 'Mercado Pago'}</p>
                  {/* Muestra el estado del pedido con clases CSS condicionales */}
                  <p className={styles.orderStatus}>Estado:
                    <span className={
                      order.status === 'pending' ? styles.statusPending :
                      order.status === 'delivered' ? styles.statusDelivered :
                      styles.statusCancelled
                    }>
                      {order.status === 'pending' ? ' Pendiente' :
                       order.status === 'delivered' ? ' Entregado' :
                       ' Cancelado'}
                    </span>
                  </p>
                </div>
              </div>
              <div className={styles.orderActions}>
                {/* Botones para marcar como Entregado o Cancelar, solo si el estado es 'pending' */}
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleOrderDelivered(order._id)}
                      className={styles.deliveredButton}
                    >
                      <FaCheckCircle /> Pedido Entregado
                    </button>
                    <button
                      onClick={() => handleOrderCancelled(order._id)}
                      className={styles.cancelButton}
                    >
                      <FaTimesCircle /> Cancelar
                    </button>
                  </>
                )}
                {/* Botón para Restaurar, si el estado es 'delivered' o 'cancelled' */}
                {(order.status === 'delivered' || order.status === 'cancelled') && (
                  <button
                    onClick={() => handleOrderRestore(order._id)}
                    className={styles.restoreButton}
                  >
                    <FaRedo /> Restaurar a Pendiente
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;
