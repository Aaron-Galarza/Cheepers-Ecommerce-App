
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ordersmanagement.module.css';
import { FaCalendarAlt, FaUser, FaBox, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaPhone, FaRedo } from 'react-icons/fa';
import authService from '../../services/authservice';
import { SelectedAddOn, IAddOn } from './productlist'; // Importa SelectedAddOn y IAddOn para tipar correctamente

// Interfaz para el formato de los productos tal como vienen en el pedido "crudo" del backend
interface OrderProductRaw {
  productId: string;
  quantity: number;
  addOns?: SelectedAddOn[]; // Los adicionales en el pedido pueden venir ya con nombre/precio si el backend los popula, o solo _id/quantity
}

// Interfaz para el formato de los productos para mostrar en la UI, con nombres de productos y adicionales populados
interface OrderProductDisplay {
  productId: string;
  quantity: number;
  name: string; // Nombre del producto, populado desde la lista de productos
  addOns?: SelectedAddOn[]; // Adicionales con su nombre y precio para mostrar
}

// Interfaz principal para la estructura de un pedido
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
  products: OrderProductRaw[]; // Usa la interfaz raw para los productos del pedido
  createdAt: string;
  status: 'pending' | 'delivered' | 'cancelled';
}

// Interfaz para el pedido una vez que sus productos han sido procesados para mostrar
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

      // Realiza todas las llamadas a la API en paralelo para mayor eficiencia
      const [productsResponse, addOnsResponse, ordersResponse] = await Promise.all([
        axios.get<Product[]>(`${API_BASE_URL}/api/products`),
        // CAMBIO CLAVE AQUÍ: Añadimos ?includeInactive=true para traer todos los adicionales
        axios.get<IAddOn[]>(`${API_BASE_URL}/api/addons?includeInactive=true`),
        axios.get<Order[]>(`${API_BASE_URL}/api/orders`),
      ]);

      // Crea mapas para una búsqueda rápida por ID
      const productMap = new Map(productsResponse.data.map(p => [p._id, p.name]));
      const addOnMap = new Map(addOnsResponse.data.map(a => [a._id, a])); // Mapa de adicionales disponibles

      // Mapea los pedidos y popula los nombres de los productos y sus adicionales
      const ordersWithDetails: OrderDisplay[] = ordersResponse.data.map(order => ({
        ...order,
        products: order.products.map(p => {
          const productDisplayName = productMap.get(p.productId) || 'Producto Desconocido';
          const populatedAddOns = p.addOns?.map(a => {
  const addOnId = (a as any)._id || (a as any).addOnId; // Soporta ambos formatos
  const addOnInfo = addOnMap.get(addOnId?.toString?.() ?? '');
  return {
    _id: addOnId?.toString?.() ?? '',
    quantity: (a as any).quantity || 1,
    name: (a as any).name || addOnInfo?.name || 'Adicional desconocido',
    price: (a as any).priceAtOrder || addOnInfo?.price || 0,
  };
}) || [];

          return {
            productId: p.productId,
            quantity: p.quantity,
            name: productDisplayName,
            addOns: populatedAddOns,
          };
        }),
      }));

      // Ordena los pedidos por fecha de creación (más recientes primero)
      ordersWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(ordersWithDetails);
    } catch (err: any) {
      console.error('Error al cargar los pedidos:', err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          authService.logout();
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

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'delivered' | 'cancelled') => {
    try {
      await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Refrescar la lista de pedidos después de la actualización
    } catch (err: any) {
      console.error(`Error al actualizar el pedido ${orderId} a ${newStatus}:`, err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          authService.logout();
          setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
        } else {
          setError(`Error al actualizar el pedido: ${err.response.data.message || err.message}`);
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
        {orders.length === 0 ? (
          <p className={styles.noOrdersMessage}>No hay pedidos para mostrar.</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <p className={styles.orderDate}>
                  <FaCalendarAlt /> {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className={styles.customerName}><FaUser /> {order.guestName}</p>
                <p className={styles.customerPhone}><FaPhone /> {order.guestPhone}</p>
              </div>
              <div className={styles.orderBody}>
                <div className={styles.productsList}>
                  <p className={styles.productsTitle}><FaBox /> Productos:</p>
                  <ul>
                    {order.products.map((item, index) => (
                      <li key={index}>
                        {item.name} (x{item.quantity})
                        {/* Muestra los adicionales si existen */}
                        {item.addOns && item.addOns.length > 0 && (
                          <ul className={styles.addOnsSublist}>
                            {item.addOns.map((addOn, i) => (
                              <li key={i} className={styles.addOnItem}>
                                └ {addOn.name} (x{addOn.quantity}) - ${addOn.price.toFixed(2)}
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
                  <p className={styles.paymentMethod}>Método de pago: {order.paymentMethod === 'cash' ? 'Efectivo' : 'Mercado Pago'}</p>
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
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => handleOrderDelivered(order._id)} className={styles.deliveredButton}>
                      <FaCheckCircle /> Pedido Entregado
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
    </div>
  );
};

export default OrdersManagement;
