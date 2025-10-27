import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import styles from './../management.styles/ordersmanagement.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sound from '../../assets/sounds/sonido.mp3';
import authService from '../../services/authservice';
import ShippingCostModal from '../../components/layout/common/ShippingCostModal';

import OrderCreationForm from '../../components/layout/admin/ordercreationform';
import OrderListDisplay from '../../hooks/orderListDisplay';

import { generateComandaHTML } from '../../lib/generateComandaHTML';
import { useOrderExport } from '../../hooks/useOrderExport';

export interface SelectedAddOn { _id: string; quantity: number; name: string; price: number; }
export interface IAddOn { _id: string; name: string; price: number; category: string; isActive: boolean; associatedProductCategories: string[]; }
export interface OrderProductRaw { productId: string; quantity: number; addOns?: SelectedAddOn[]; }
export interface OrderProductDisplay { productId: string; quantity: number; name: string; addOns?: SelectedAddOn[]; }
export interface Order { _id: string; guestEmail?: string; guestName: string; guestPhone: string; totalAmount: number; paymentMethod: 'cash' | 'card' | 'transfer'; deliveryType: 'delivery' | 'pickup'; shippingAddress?: { street: string; city: string }; products: OrderProductRaw[]; createdAt: string; status: 'pending' | 'processing' | 'delivered' | 'cancelled'; notes?: string; }
export interface OrderDisplay extends Omit<Order, 'products'> { products: OrderProductDisplay[]; }
export interface Product { _id: string; name: string; price: number; }

interface NewOrderData { guestName: string; guestPhone: string; totalAmount: number; paymentMethod: 'cash' | 'card' | 'transfer'; deliveryType: 'delivery' | 'pickup'; shippingAddress?: { street: string; city: string }; products: Array<{ productId: string; quantity: number; addOns?: Array<{ addOnId: string; quantity: number }> }>; status: 'pending'; }
interface FormProduct { tempId: string; productId: string; quantity: number; selectedAddOns: Array<{ addOnId: string; quantity: number }>; }

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'processing' | 'delivered' | 'cancelled' | 'all'>('all');

  const [showShippingModal, setShowShippingModal] = useState<boolean>(false);
  const [shippingCostInput, setShippingCostInput] = useState<string>('');
  const [orderToProcess, setOrderToProcess] = useState<OrderDisplay | null>(null);

  const [newOrderForm, setNewOrderForm] = useState<Omit<NewOrderData, 'totalAmount' | 'products' | 'status' | 'shippingAddress'> & { shippingStreet: string; shippingCity: string; formProducts: FormProduct[] }>({ guestName: '', guestPhone: '', paymentMethod: 'cash', deliveryType: 'pickup', shippingStreet: '', shippingCity: '', formProducts: [{ tempId: Date.now().toString(), productId: '', quantity: 1, selectedAddOns: [] }] });

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableAddOns, setAvailableAddOns] = useState<IAddOn[]>([]);
  const productMapRef = useRef<Map<string, string>>(new Map());
  const addOnMapRef = useRef<Map<string, IAddOn>>(new Map());

  const previousOrderIds = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const updateOrderInState = useCallback((orderId: string, updates: Partial<OrderDisplay>) => { setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, ...updates } : o))); }, []);

  const handlePrintComanda = (order: OrderDisplay, shippingCost?: number) => {
    const comandaHtml = generateComandaHTML(order, shippingCost);
    const printWindow = window.open('', '_blank');
    if (printWindow) { printWindow.document.write(comandaHtml); printWindow.document.close(); printWindow.onload = () => { printWindow.focus(); printWindow.print(); }; }
    else { toast.error('No se pudo abrir la ventana de impresión. Por favor, asegúrate de que los pop-ups estén permitidos.', { position: 'bottom-center', autoClose: 5000 }); }
  };

  const fetchOrders = useCallback(async (initialLoad: boolean) => {
    const CACHE_TTL = 1000 * 60 * 5; // 5 minutos
    const readCache = <T,>(key: string): T | null => { try { const raw = sessionStorage.getItem(key); if (!raw) return null; const parsed = JSON.parse(raw); if (Date.now() - (parsed.ts || 0) > CACHE_TTL) return null; return parsed.value as T; } catch { return null; } };
    const writeCache = (key: string, value: unknown) => { try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), value })); } catch (e) { console.warn('writeCache failed', e); } };

    try {
      if (initialLoad) setInitialLoading(true); else setIsFetching(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const responseConfig = { headers: { Authorization: `Bearer ${token}` } };

      let products = readCache<Product[]>('products_cache_v1');
      let addOns = readCache<IAddOn[]>('addons_cache_v1');
      if (!products || !addOns) {
        const [productsResp, addOnsResp] = await Promise.all([
          axios.get<Product[]>(`${API_BASE_URL}/api/products?includeInactive=true`, responseConfig),
          axios.get<IAddOn[]>(`${API_BASE_URL}/api/addons?includeInactive=true`, responseConfig),
        ]);
        products = productsResp.data; addOns = addOnsResp.data; writeCache('products_cache_v1', products); writeCache('addons_cache_v1', addOns);
      }

      const ordersResponse = await axios.get<Order[]>(`${API_BASE_URL}/api/orders`, responseConfig);
      productMapRef.current = new Map((products || []).map(p => [p._id, p.name]));
      addOnMapRef.current = new Map((addOns || []).map(a => [a._id, a]));
      setAvailableProducts(products || []); setAvailableAddOns(addOns || []);

      const ordersWithDetails: OrderDisplay[] = (ordersResponse.data || []).map(order => ({
        ...order,
        products: (order.products || []).map(p => {
          const productDisplayName = productMapRef.current.get(p.productId) ?? 'Producto Desconocido';
          const populatedAddOns = (p.addOns ?? []).map(a => { const aItem = a as unknown as { _id?: string; addOnId?: string; quantity?: number; name?: string; priceAtOrder?: number }; const addOnId = aItem._id ?? aItem.addOnId ?? ''; const addOnInfo = addOnMapRef.current.get(String(addOnId)); return { _id: String(addOnId), quantity: aItem.quantity ?? 1, name: aItem.name ?? addOnInfo?.name ?? 'Adicional desconocido', price: aItem.priceAtOrder ?? addOnInfo?.price ?? 0 }; });
          return { productId: p.productId, quantity: p.quantity, name: productDisplayName, addOns: populatedAddOns };
        }),
      }));

      ordersWithDetails.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      const currentOrderIds = new Set(ordersWithDetails.map(o => o._id));
      const newOrdersDetected = [...currentOrderIds].some(id => !previousOrderIds.current.has(id));
      if (newOrdersDetected && ordersWithDetails.length > previousOrderIds.current.size && !initialLoad) {
        if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); }
        toast.info('📦 ¡Nuevo pedido recibido!', { position: 'top-right', autoClose: 5000, className: styles.newOrderToast });
      }
      previousOrderIds.current = currentOrderIds; setOrders(ordersWithDetails);
    } catch (err: unknown) {
      console.error('Error al cargar los pedidos:', err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) { authService.logout(); setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.'); }
        else setError(`Error al cargar los pedidos: ${err.response.data?.message || err.message}`);
      } else setError('No se pudieron cargar los pedidos. Verifica la conexión a internet.');
    } finally { setInitialLoading(false); setIsFetching(false); }
  }, []);

  // Inicializar audio y polling
  useEffect(() => {
    audioRef.current = new Audio(Sound);
    fetchOrders(true);
    const iv = setInterval(() => fetchOrders(false), 10000);
    return () => { clearInterval(iv); };
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const token = localStorage.getItem('adminToken');
      // Backend exposes PUT /api/orders/:id/status — use that to ensure status updates work
      await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      // Optimistically update local state for snappy UI, then refresh in background
      setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o)));
      toast.success(`Pedido ${orderId.substring(0, 5)}... actualizado a ${newStatus}!`, { position: 'bottom-center', autoClose: 3000 });
      // Refresh orders to pick up any backend-side changes
      fetchOrders(false);
    } catch (err: unknown) {
      console.error(`Error al actualizar el pedido ${orderId}:`, err);
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data?.message || 'Error al actualizar pedido.');
      } else {
        toast.error('Error al actualizar pedido.');
      }
    }
  };

  const calculateTotalAmount = useCallback(() => {
    return newOrderForm.formProducts.reduce((acc, fp) => {
      const product = availableProducts.find(p => p._id === fp.productId);
      if (!product) return acc;
      const base = product.price * fp.quantity;
      const addons = fp.selectedAddOns.reduce((s, sa) => { const addon = availableAddOns.find(a => a._id === sa.addOnId); return s + (addon ? addon.price * fp.quantity : 0); }, 0);
      return acc + base + addons;
    }, 0);
  }, [newOrderForm.formProducts, availableProducts, availableAddOns]);

  const handleSubmitNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.guestName.trim()) { toast.error('El nombre del cliente es obligatorio.', { position: 'bottom-center', autoClose: 3000 }); return; }
    if (!newOrderForm.guestPhone.trim()) { toast.error('El teléfono del cliente es obligatorio.', { position: 'bottom-center', autoClose: 3000 }); return; }
    if (newOrderForm.formProducts.length === 0) { toast.error('Debes añadir al menos un producto al pedido.', { position: 'bottom-center', autoClose: 3000 }); return; }

    for (const fp of newOrderForm.formProducts) {
      if (!fp.productId) { toast.error('Por favor, selecciona un producto para cada artículo.', { position: 'bottom-center', autoClose: 3000 }); return; }
      if (fp.quantity <= 0) { toast.error('La cantidad de cada producto debe ser mayor a 0.', { position: 'bottom-center', autoClose: 3000 }); return; }
      for (const sa of fp.selectedAddOns) { if (!sa.addOnId) { toast.error('Por favor, selecciona un adicional para cada artículo de adicional.', { position: 'bottom-center', autoClose: 3000 }); return; } if (sa.quantity <= 0) { toast.error('La cantidad de cada adicional debe ser mayor a 0.', { position: 'bottom-center', autoClose: 3000 }); return; } }
    }

    if (newOrderForm.deliveryType === 'delivery' && (!newOrderForm.shippingStreet.trim() || !newOrderForm.shippingCity.trim())) { toast.error('Para entregas a domicilio, la calle y la ciudad son obligatorias.', { position: 'bottom-center', autoClose: 3000 }); return; }

    const totalAmount = calculateTotalAmount();
    const productsForBackend = newOrderForm.formProducts.map(fp => ({ productId: fp.productId, quantity: fp.quantity, addOns: fp.selectedAddOns.map(sa => ({ addOnId: sa.addOnId, quantity: sa.quantity })) }));
    const orderData: Omit<NewOrderData, 'guestEmail'> = { guestName: newOrderForm.guestName.trim(), guestPhone: newOrderForm.guestPhone.trim(), totalAmount, paymentMethod: newOrderForm.paymentMethod, deliveryType: newOrderForm.deliveryType, products: productsForBackend, status: 'pending' };
    if (newOrderForm.deliveryType === 'delivery') orderData.shippingAddress = { street: newOrderForm.shippingStreet.trim(), city: newOrderForm.shippingCity.trim() };

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_BASE_URL}/api/orders`, orderData, { headers: { Authorization: `Bearer ${token}` } });
      fetchOrders(false);
      toast.success('Pedido creado exitosamente!', { position: 'bottom-center', autoClose: 3000 });
      setNewOrderForm({ guestName: '', guestPhone: '', paymentMethod: 'cash', deliveryType: 'pickup', shippingStreet: '', shippingCity: '', formProducts: [{ tempId: Date.now().toString(), productId: '', quantity: 1, selectedAddOns: [] }] });
    } catch (err) {
      console.error('Error al crear pedido:', err);
      toast.error('Error al crear pedido');
    }
  };

  const handleConfirmShippingCost = () => {
    if (!orderToProcess) return;
    const shippingCost = parseFloat(shippingCostInput);
    if (isNaN(shippingCost) || shippingCost < 0) { toast.error('Por favor, ingresa un valor de envío válido.', { position: 'bottom-center' }); return; }
    handlePrintComanda(orderToProcess, shippingCost);
    updateOrderStatus(orderToProcess._id, 'processing');
    setShippingCostInput(''); setOrderToProcess(null); setShowShippingModal(false);
  };

  const handleOrderAccept = (orderId: string) => {
    toast.info(
      <div className={styles.toastConfirmContent}>
        <p>¿Aceptar este pedido y enviarlo a cocina?</p>
        <div className={styles.toastButtons}>
          <button onClick={() => { const order = orders.find(o => o._id === orderId); if (!order) { toast.error('Pedido no encontrado.'); toast.dismiss(); return; } if (order.deliveryType === 'delivery') { setOrderToProcess(order); setShowShippingModal(true); } else { handlePrintComanda(order); updateOrderStatus(order._id, 'processing'); } toast.dismiss(); }} className={styles.toastConfirmButton}>Sí, Aceptar</button>
          <button onClick={() => toast.dismiss()} className={styles.toastCancelButton}>No</button>
        </div>
      </div>, { position: 'top-center', autoClose: false, closeButton: false, draggable: false, className: styles.customConfirmationToast }
    );
  };

  const handleOrderDelivered = (orderId: string) => {
    toast.info(<div className={styles.toastConfirmContent}><p>¿Marcar este pedido como ENTREGADO?</p><div className={styles.toastButtons}><button onClick={() => { updateOrderStatus(orderId, 'delivered'); toast.dismiss(); }} className={styles.toastConfirmButton}>Sí</button><button onClick={() => toast.dismiss()} className={styles.toastCancelButton}>No</button></div></div>, { position: 'top-center', autoClose: false, closeButton: false, draggable: false, className: styles.customConfirmationToast });
  };

  const handleOrderCancelled = (orderId: string) => {
    toast.info(<div className={styles.toastConfirmContent}><p>¿CANCELAR este pedido?</p><div className={styles.toastButtons}><button onClick={() => { updateOrderStatus(orderId, 'cancelled'); toast.dismiss(); }} className={styles.toastConfirmButton}>Sí</button><button onClick={() => toast.dismiss()} className={styles.toastCancelButton}>No</button></div></div>, { position: 'top-center', autoClose: false, closeButton: false, draggable: false, className: styles.customConfirmationToast });
  };

  const handleOrderRestore = (orderId: string) => { updateOrderStatus(orderId, 'pending'); };

  const { handleExport, handleClean } = useOrderExport({ API_BASE_URL, productMapRef, fetchOrders });

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  if (initialLoading && orders.length === 0) return <div className={styles.loading}>Cargando pedidos...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.ordersManagementContainer}>
      <ToastContainer />
      <h1 className={styles.title}>Gestión de Pedidos</h1>
      {isFetching && <div className={styles.subtleLoading}>Actualizando pedidos...</div>}

      <div className={styles.managementHeader}>
        <div className={styles.exportCleanButtons}>
          <button className={styles.exportButton} onClick={handleExport}>Exportar Historial</button>
          <button className={styles.cleanButton} onClick={handleClean}>Limpiar Historial</button>
        </div>
      </div>

      <OrderCreationForm newOrderForm={newOrderForm} setNewOrderForm={setNewOrderForm} availableProducts={availableProducts} availableAddOns={availableAddOns} productMapRef={productMapRef} calculateTotalAmount={calculateTotalAmount} handleSubmitNewOrder={handleSubmitNewOrder} />

      <OrderListDisplay filteredOrders={filteredOrders} filterStatus={filterStatus} setFilterStatus={setFilterStatus} handleOrderDelivered={handleOrderDelivered} handleOrderCancelled={handleOrderCancelled} handleOrderRestore={handleOrderRestore} handleOrderAccept={handleOrderAccept} updateOrderInState={updateOrderInState} />

      {showShippingModal && (
        <ShippingCostModal shippingCostInput={shippingCostInput} setShippingCostInput={setShippingCostInput} onConfirm={handleConfirmShippingCost} onCancel={() => { setShowShippingModal(false); setShippingCostInput(''); setOrderToProcess(null); }} />
      )}
    </div>
  );
};

export default OrdersManagement;
