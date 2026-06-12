import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPrint, FaTimes, FaCalendarAlt, FaUser } from 'react-icons/fa';
import Sound from '../../assets/sounds/sonido.mp3';
import authService from '../../services/authservice';
import ShippingCostModal from '../../components/layout/common/ShippingCostModal';
import { generateComandaHTML } from '../../lib/generateComandaHTML';
import { useNavigate } from 'react-router-dom';

import styles from './kitchenview.module.css';

// Reutilizamos las interfaces
export interface SelectedAddOn { _id: string; quantity: number; name: string; price: number; }
export interface IAddOn { _id: string; name: string; price: number; category: string; isActive: boolean; associatedProductCategories: string[]; }
export interface OrderProductRaw { productId: string; quantity: number; addOns?: SelectedAddOn[]; }
export interface OrderProductDisplay { productId: string; quantity: number; name: string; addOns?: SelectedAddOn[]; }
export interface Order { _id: string; guestEmail?: string; guestName: string; guestPhone: string; totalAmount: number; paymentMethod: 'cash' | 'card' | 'transfer'; deliveryType: 'delivery' | 'pickup' | 'Dine in'; shippingAddress?: { street: string; city: string }; products: OrderProductRaw[]; createdAt: string; status: 'pending' | 'processing' | 'delivered' | 'cancelled'; notes?: string; }
export interface OrderDisplay extends Omit<Order, 'products'> { products: OrderProductDisplay[]; }
export interface Product { _id: string; name: string; price: number; }

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

const KitchenView: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [hiddenOrders, setHiddenOrders] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing'>('all');
  
  // Estados para impresión y envíos
  const [showShippingModal, setShowShippingModal] = useState<boolean>(false);
  const [shippingCostInput, setShippingCostInput] = useState<string>('');
  const [orderToPrint, setOrderToPrint] = useState<OrderDisplay | null>(null);

  const productMapRef = useRef<Map<string, string>>(new Map());
  const addOnMapRef = useRef<Map<string, IAddOn>>(new Map());
  const previousOrderIds = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchOrders = useCallback(async (initialLoad: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const responseConfig = { headers: { Authorization: `Bearer ${token}` } };

      let products: Product[] = [];
      let addOns: IAddOn[] = [];
      const cacheProds = sessionStorage.getItem('products_cache_v1');
      const cacheAddons = sessionStorage.getItem('addons_cache_v1');

      if (!cacheProds || !cacheAddons) {
        const [productsResp, addOnsResp] = await Promise.all([
          axios.get<Product[]>(`${API_BASE_URL}/api/products?includeInactive=true`, responseConfig),
          axios.get<IAddOn[]>(`${API_BASE_URL}/api/addons?includeInactive=true`, responseConfig),
        ]);
        products = productsResp.data; addOns = addOnsResp.data;
        sessionStorage.setItem('products_cache_v1', JSON.stringify({ value: products }));
        sessionStorage.setItem('addons_cache_v1', JSON.stringify({ value: addOns }));
      } else {
        products = JSON.parse(cacheProds).value;
        addOns = JSON.parse(cacheAddons).value;
      }

      const ordersResponse = await axios.get<Order[]>(`${API_BASE_URL}/api/orders`, responseConfig);
      productMapRef.current = new Map(products.map(p => [p._id, p.name]));
      addOnMapRef.current = new Map(addOns.map(a => [a._id, a]));

      // 1. FILTRO DE 24 HORAS: Solo conservamos los pedidos del último día
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const ordersWithDetails: OrderDisplay[] = ordersResponse.data
        .filter((o) => new Date(o.createdAt) >= twentyFourHoursAgo)
        .map(order => ({
          ...order,
          products: order.products.map(p => {
            const productDisplayName = productMapRef.current.get(p.productId) ?? 'Producto Desconocido';
            const populatedAddOns = (p.addOns ?? []).map(a => {
              const addOnId = (a as any)._id ?? (a as any).addOnId ?? '';
              const addOnInfo = addOnMapRef.current.get(String(addOnId));
              return {
                _id: String(addOnId),
                quantity: a.quantity ?? 1,
                name: a.name ?? addOnInfo?.name ?? 'Adicional',
                price: a.price ?? addOnInfo?.price ?? 0
              };
            });
            return { productId: p.productId, quantity: p.quantity, name: productDisplayName, addOns: populatedAddOns };
          }),
        }));

      // 2. ORDEN: Más nuevos primero (b.getTime() - a.getTime())
      ordersWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const currentOrderIds = new Set(ordersWithDetails.map(o => o._id));
      const newOrdersDetected = [...currentOrderIds].some(id => !previousOrderIds.current.has(id));
      
      if (newOrdersDetected && ordersWithDetails.length > previousOrderIds.current.size && !initialLoad) {
        if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); }
        toast.info('🔔 ¡Nuevo pedido en cocina!', { position: 'top-right', autoClose: 4000 });
      }
      
      previousOrderIds.current = currentOrderIds;
      setOrders(ordersWithDetails);
    } catch (err: any) {
      if (err.response?.status === 401) authService.logout();
    }
  }, []);

  useEffect(() => {
    audioRef.current = new Audio(Sound);
    fetchOrders(true);
    const iv = setInterval(() => fetchOrders(false), 10000);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  const executePrint = (order: OrderDisplay, shippingCost?: number) => {
    const comandaHtml = generateComandaHTML(order, shippingCost);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(comandaHtml);
      printWindow.document.close();
      printWindow.onload = () => { printWindow.focus(); printWindow.print(); };
    } else {
      toast.error('Permite los pop-ups para imprimir.');
    }
  };

  const handlePrintClick = (order: OrderDisplay) => {
    if (order.deliveryType === 'delivery') {
      setOrderToPrint(order);
      setShowShippingModal(true);
    } else {
      executePrint(order);
    }
  };

  const handleConfirmShippingCost = () => {
    if (!orderToPrint) return;
    const shippingCost = parseFloat(shippingCostInput);
    if (isNaN(shippingCost) || shippingCost < 0) {
      toast.error('Valor de envío inválido.');
      return;
    }
    executePrint(orderToPrint, shippingCost);
    setShippingCostInput('');
    setOrderToPrint(null);
    setShowShippingModal(false);
  };

  const executeStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, status: newStatus as any } : o)));
      
      if (newStatus === 'delivered') {
        setHiddenOrders(prev => [...prev, orderId]);
      }
      toast.success('Estado actualizado');
    } catch (err) {
      toast.error('Error al actualizar');
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (newStatus === 'delivered') {
      toast.info(
        <div className={styles.toastConfirmContent}>
          <p>¿Seguro que quieres marcar este pedido como ENTREGADO y sacarlo de la cocina?</p>
          <div className={styles.toastButtons}>
            <button onClick={() => { executeStatusUpdate(orderId, newStatus); toast.dismiss(); }} className={styles.toastConfirmButton}>Sí, Entregar</button>
            <button onClick={() => toast.dismiss()} className={styles.toastCancelButton}>Cancelar</button>
          </div>
        </div>, { position: 'top-center', autoClose: false, closeButton: false }
      );
    } else {
      executeStatusUpdate(orderId, newStatus);
    }
  };

  const handleHideOrder = (orderId: string) => {
    setHiddenOrders(prev => [...prev, orderId]);
  };

  const visibleOrders = orders.filter(o => 
    !hiddenOrders.includes(o._id) && 
    (filterStatus === 'all' ? (o.status === 'pending' || o.status === 'processing') : o.status === filterStatus)
  );

  return (
    <div className={styles.kitchenContainer}>
      <ToastContainer />
      
      <header className={styles.header}>
        {/* Solo el título, sin el botón de volver */}
        <h1>Vista de Cocina</h1>
        <div className={styles.filters}>
          <button className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.active : ''}`} onClick={() => setFilterStatus('all')}>Todos Activos</button>
          <button className={`${styles.filterBtn} ${filterStatus === 'pending' ? styles.active : ''}`} onClick={() => setFilterStatus('pending')}>Pendientes</button>
          <button className={`${styles.filterBtn} ${filterStatus === 'processing' ? styles.active : ''}`} onClick={() => setFilterStatus('processing')}>En Proceso</button>
        </div>
      </header>

      <div className={styles.grid}>
        {visibleOrders.length === 0 ? (
          <p className={styles.emptyMsg}>No hay pedidos para mostrar en la cocina.</p>
        ) : (
          visibleOrders.map(order => (
            <div key={order._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <button className={styles.hideBtn} onClick={() => handleHideOrder(order._id)} title="Descartar de cocina">
                  <FaTimes />
                </button>
                <div className={styles.orderInfo}>
                  <p className={styles.orderId}>#{order._id.slice(-5).toUpperCase()}</p>
                  <p className={styles.orderTime}>
                    <FaCalendarAlt /> 
                    {new Date(order.createdAt).toLocaleDateString()} - {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button className={styles.printBtn} onClick={() => handlePrintClick(order)} title="Imprimir Comanda">
                  <FaPrint />
                </button>
              </div>

              {/* CARD BODY SIMPLIFICADO: Solo Cliente, Entrega, Producto y Adicionales */}
              <div className={styles.cardBody}>
                <p className={styles.customer}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaUser /> {order.guestName}</span>
                  <span className={styles.deliveryTag}>
                    {order.deliveryType === 'delivery' ? 'Envío a domicilio' : order.deliveryType === 'pickup' ? 'Retiro' : 'Salón'}
                  </span>
                </p>
                
                <ul className={styles.productList}>
                  {order.products.map((item, idx) => (
                    <li key={idx} className={styles.productItem}>
                      <strong>{item.quantity}x {item.name}</strong>
                      {item.addOns && item.addOns.length > 0 && (
                        <ul className={styles.addonsList}>
                          {item.addOns.map((addon, aIdx) => (
                            <li key={aIdx} className={styles.addonItem}>
                              {'->'} {addon.quantity}x {addon.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
                
                {order.notes && (
                  <div className={styles.notesBox}>
                    <strong>Notas:</strong> {order.notes}
                  </div>
                )}
              </div>

              <div className={styles.cardFooter}>
                <label className={styles.statusLabel}>Estado:</label>
                <select 
                  className={`${styles.statusSelect} ${styles[order.status]}`} 
                  value={order.status} 
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                >
                  <option value="pending">Pendiente</option>
                  <option value="processing">En Proceso</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {showShippingModal && (
        <ShippingCostModal 
          shippingCostInput={shippingCostInput} 
          setShippingCostInput={setShippingCostInput} 
          onConfirm={handleConfirmShippingCost} 
          onCancel={() => { setShowShippingModal(false); setShippingCostInput(''); setOrderToPrint(null); }} 
        />
      )}
    </div>
  );
};

export default KitchenView;