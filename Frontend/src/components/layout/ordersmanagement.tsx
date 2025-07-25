import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './ordersmanagement.module.css';
import { FaCalendarAlt, FaUser, FaBox, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaPhone, FaRedo } from 'react-icons/fa'; // FaVolumeUp eliminado
import authService from '../../services/authservice';
import { SelectedAddOn, IAddOn } from './productlist';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// useSound importado eliminado

// Interfaz para el formato de los productos tal como vienen en el pedido "crudo" del backend
interface OrderProductRaw {
  productId: string;
  quantity: number;
  addOns?: SelectedAddOn[];
}

// Interfaz para el formato de los productos para mostrar en la UI, con nombres de productos y adicionales populados
interface OrderProductDisplay {
  productId: string;
  quantity: number;
  name: string;
  addOns?: SelectedAddOn[];
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
  products: OrderProductRaw[];
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
}

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';
// NOTIFICATION_SOUND_URL y importación de sonido eliminados

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filterStatus, setFilterStatus] = useState<'pending' | 'delivered' | 'cancelled' | 'all'>('all');

  const previousOrderIds = useRef<Set<string>>(new Set());
  
  // Hook de useSound eliminado
  // Estado autoplayWarningShown eliminado

  // Función playSound eliminada

  useEffect(() => {
    fetchOrders(true);
  }, []);

  // Intervalo automático para refrescar cada 15 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (initialLoad: boolean) => {
    try {
      if (initialLoad) {
        setInitialLoading(true);
      } else {
        setIsFetching(true);
      }
      setError(null);

      const token = localStorage.getItem('adminToken');
      const responseConfig = { headers: { Authorization: `Bearer ${token}` } };

      const [productsResponse, addOnsResponse, ordersResponse] = await Promise.all([
        axios.get<Product[]>(`${API_BASE_URL}/api/products`, responseConfig),
        axios.get<IAddOn[]>(`${API_BASE_URL}/api/addons?includeInactive=true`, responseConfig),
        axios.get<Order[]>(`${API_BASE_URL}/api/orders`, responseConfig),
      ]);

      const productMap = new Map(productsResponse.data.map(p => [p._id, p.name]));
      const addOnMap = new Map(addOnsResponse.data.map(a => [a._id, a]));

      const ordersWithDetails: OrderDisplay[] = ordersResponse.data.map(order => ({
        ...order,
        products: order.products.map(p => {
          const productDisplayName = productMap.get(p.productId) || 'Producto Desconocido';
          const populatedAddOns = p.addOns?.map(a => {
            const addOnId = (a as any)._id || (a as any).addOnId;
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

      ordersWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Detectar pedidos nuevos
      const currentOrderIds = new Set(ordersWithDetails.map(o => o._id));
      const newOrdersDetected = [...currentOrderIds].some(id => !previousOrderIds.current.has(id));

      if (newOrdersDetected && ordersWithDetails.length > previousOrderIds.current.size && !initialLoad) {
        console.log('📦 ¡Nuevo pedido detectado! Mostrando toast.');
        // playSound() eliminado
        
        toast.info('📦 ¡Nuevo pedido recibido!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: styles.newOrderToast
        });
      }

      previousOrderIds.current = currentOrderIds;

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
      setInitialLoading(false);
      setIsFetching(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'delivered' | 'cancelled') => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders(false);
      toast.success(`Pedido ${orderId.substring(0, 5)}... actualizado a ${newStatus}!`, {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err: any) {
      console.error(`Error al actualizar el pedido ${orderId} a ${newStatus}:`, err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          authService.logout();
          setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
        } else {
          setError(`Error al actualizar el pedido: ${err.response.data.message || err.message}`);
          toast.error(`Error al actualizar pedido: ${err.response.data.message || err.message}`, {
            position: "bottom-center",
            autoClose: 5000,
          });
        }
      } else {
        setError('Error de conexión al actualizar pedido.');
      }
    }
  };

  const handleOrderDelivered = (orderId: string) => {
    toast.info(
      <div className={styles.toastConfirmContent}>
        <p>¿Marcar este pedido como ENTREGADO?</p>
        <div className={styles.toastButtons}>
          <button onClick={() => { updateOrderStatus(orderId, 'delivered'); toast.dismiss(); }} className={styles.toastConfirmButton}>Sí</button>
          <button onClick={() => toast.dismiss()} className={styles.toastCancelButton}>No</button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
        className: styles.customConfirmationToast,
      }
    );
  };

  const handleOrderCancelled = (orderId: string) => {
    toast.info(
      <div className={styles.toastConfirmContent}>
        <p>¿CANCELAR este pedido?</p>
        <div className={styles.toastButtons}>
          <button onClick={() => { updateOrderStatus(orderId, 'cancelled'); toast.dismiss(); }} className={styles.toastConfirmButton}>Sí</button>
          <button onClick={() => toast.dismiss()} className={styles.toastCancelButton}>No</button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
        className: styles.customConfirmationToast,
      }
    );
  };

  const handleOrderRestore = (orderId: string) => {
    toast.info(
      <div className={styles.toastConfirmContent}>
        <p>¿RESTAURAR este pedido a PENDIENTE?</p>
        <div className={styles.toastButtons}>
          <button onClick={() => { updateOrderStatus(orderId, 'pending'); toast.dismiss(); }} className={styles.toastConfirmButton}>Sí</button>
          <button onClick={() => toast.dismiss()} className={styles.toastCancelButton}>No</button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
        className: styles.customConfirmationToast,
      }
    );
  };

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  if (initialLoading && orders.length === 0) {
    return <div className={styles.loading}>Cargando pedidos...</div>;
  }
  
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.ordersManagementContainer}>
      <ToastContainer />

      <h1 className={styles.title}>Gestión de Pedidos</h1>

      {/* Botón para probar el sonido eliminado */}
      {/* Indicador de actualización sutil */}
      {isFetching && <div className={styles.subtleLoading}>Actualizando pedidos...</div>}

      {/* Selector para filtrar pedidos por estado */}
      <div className={styles.filterContainer}>
        <label htmlFor="statusFilter">Filtrar por estado: </label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as 'pending' | 'delivered' | 'cancelled' | 'all')}
          className={styles.filterSelect}
        >
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
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
