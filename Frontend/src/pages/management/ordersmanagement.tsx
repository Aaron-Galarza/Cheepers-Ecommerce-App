import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import styles from './../management.styles/ordersmanagement.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sound from '../../assets/sounds/sonido.mp3';
import authService from '../../services/authservice';
import ShippingCostModal from '../../components/layout/common/ShippingCostModal';

// Importar los componentes
import OrderCreationForm from '../../components/layout/admin/ordercreationform';
import OrderListDisplay from '../../hooks/orderListDisplay';

// Importar la nueva utilidad de comanda
import { generateComandaHTML } from '../../lib/generateComandaHTML';

// Importar el nuevo hook para la funcionalidad de exportar y limpiar
import { useOrderExport } from '../../hooks/useOrderExport';

// Re-exportar interfaces para que los componentes hijos puedan importarlas desde aquí
export interface SelectedAddOn {
  _id: string; // ID del adicional
  quantity: number; // Cantidad de este adicional
  name: string; // Nombre del adicional (para display en el frontend)
  price: number; // Precio del adicional al momento de la orden (para display en el frontend)
}

// INTERFAZ IAddOn ACTUALIZADA con las propiedades faltantes (asegurarse de que coincida con tu backend)
export interface IAddOn {
  _id: string;
  name: string;
  price: number;
  category: string;
  isActive: boolean;
  associatedProductCategories: string[];
}

export interface OrderProductRaw {
  productId: string;
  quantity: number;
  addOns?: SelectedAddOn[];
}

export interface OrderProductDisplay {
  productId: string;
  quantity: number;
  name: string;
  addOns?: SelectedAddOn[];
}

// INTERFAZ ORDER ACTUALIZADA para incluir 'processing' y 'notes'
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
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  notes?: string; // Asegúrate de que esto esté aquí para que la comanda pueda usarlo
}

export interface OrderDisplay extends Omit<Order, 'products'> {
  products: OrderProductDisplay[];
}

export interface Product {
  _id: string;
  name: string;
  price: number;
}

interface NewOrderData {
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
  products: Array<{
    productId: string;
    quantity: number;
    addOns?: Array<{ addOnId: string; quantity: number; }>;
  }>;
  status: 'pending';
}

interface FormProduct {
  tempId: string;
  productId: string;
  quantity: number;
  selectedAddOns: Array<{
    addOnId: string;
    quantity: number;
  }>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'processing' | 'delivered' | 'cancelled' | 'all'>('all');

  // ESTADOS NUEVOS PARA EL MODAL DE COSTO DE ENVÍO
  const [showShippingModal, setShowShippingModal] = useState<boolean>(false);
  const [shippingCostInput, setShippingCostInput] = useState<string>('');
  const [orderToProcess, setOrderToProcess] = useState<OrderDisplay | null>(null);


  const [newOrderForm, setNewOrderForm] = useState<Omit<NewOrderData, 'totalAmount' | 'products' | 'status' | 'shippingAddress'> & {
    shippingStreet: string;
    shippingCity: string;
    formProducts: FormProduct[];
  }>({
    guestEmail: '',
    guestName: '',
    guestPhone: '',
    paymentMethod: 'cash',
    deliveryType: 'pickup',
    shippingStreet: '',
    shippingCity: '',
    formProducts: [{ tempId: Date.now().toString(), productId: '', quantity: 1, selectedAddOns: [] }],
  });
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableAddOns, setAvailableAddOns] = useState<IAddOn[]>([]);
  const productMapRef = useRef<Map<string, string>>(new Map());
  const addOnMapRef = useRef<Map<string, IAddOn>>(new Map());

  const previousOrderIds = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Añadir esta función para actualizar pedidos en el estado local
  const updateOrderInState = useCallback((orderId: string, updates: Partial<OrderDisplay>) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === orderId ? { ...order, ...updates } : order
      )
    );
  }, []);

  // Esta función ahora solo abre la ventana de impresión. La lógica para pasar el
  // costo de envío ahora es más directa.
  const handlePrintComanda = (order: OrderDisplay, shippingCost?: number) => {
    // CORREGIDO: El error estaba en el archivo `generateComandaHTML.ts`, lo
    // estás importando aquí pero no se actualiza con la implementación nueva. 
    // Asegúrate de que `generateComandaHTML` reciba `shippingCost` y lo use.
    const comandaHtml = generateComandaHTML(order, shippingCost);
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write(comandaHtml);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } else {
      toast.error('No se pudo abrir la ventana de impresión. Por favor, asegúrate de que los pop-ups estén permitidos.', {
        position: "bottom-center",
        autoClose: 5000,
      });
    }
  };


  const fetchOrders = useCallback(async (initialLoad: boolean) => {
    try {
      if (initialLoad) setInitialLoading(true);
      else setIsFetching(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      const responseConfig = { headers: { Authorization: `Bearer ${token}` } };

      const [productsResponse, addOnsResponse, ordersResponse] = await Promise.all([
        axios.get<Product[]>(`${API_BASE_URL}/api/products?includeInactive=true`, responseConfig),
        axios.get<IAddOn[]>(`${API_BASE_URL}/api/addons?includeInactive=true`, responseConfig),
        axios.get<Order[]>(`${API_BASE_URL}/api/orders`, responseConfig),
      ]);

      productMapRef.current = new Map(productsResponse.data.map(p => [p._id, p.name]));
      addOnMapRef.current = new Map(addOnsResponse.data.map(a => [a._id, a]));
      setAvailableProducts(productsResponse.data);
      setAvailableAddOns(addOnsResponse.data);

      const ordersWithDetails: OrderDisplay[] = ordersResponse.data.map(order => ({
        ...order,
        products: order.products.map(p => {
          const productDisplayName = productMapRef.current.get(p.productId) || 'Producto Desconocido';
          const populatedAddOns = p.addOns?.map(a => {
            const addOnId = (a as any)._id || (a as any).addOnId;
            const addOnInfo = addOnMapRef.current.get(addOnId?.toString?.() ?? '');
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

      const currentOrderIds = new Set(ordersWithDetails.map(o => o._id));
      const newOrdersDetected = [...currentOrderIds].some(id => !previousOrderIds.current.has(id));

      if (newOrdersDetected && ordersWithDetails.length > previousOrderIds.current.size && !initialLoad) {
        console.log('📦 ¡Nuevo pedido detectado! Mostrando toast y reproduciendo sonido.');

        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => {
            console.warn('No se pudo reproducir el sonido automáticamente:', err);
          });
        }

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
  }, []);

  useEffect(() => {
    audioRef.current = new Audio(Sound);
    fetchOrders(true);
  }, [fetchOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // CORRECCIÓN: Se elimina la llamada a handlePrintComanda de esta función.
  // Ahora la impresión solo se disparará desde handleOrderAccept o handleConfirmShippingCost.
  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'processing' | 'delivered' | 'cancelled') => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders(false); // Refresca la lista de pedidos para ver el cambio de estado

      // LÓGICA CLAVE: Se elimina la impresión duplicada aquí
      // La impresión ahora se maneja antes de llamar a esta función, 
      // dentro de `handleOrderAccept` o `handleConfirmShippingCost`.

      if (newStatus === 'processing') {
        toast.success('Pedido confirmado y comanda enviada a cocina!', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else { // Mensaje de éxito para otros cambios de estado
        toast.success(`Pedido ${orderId.substring(0, 5)}... actualizado a ${newStatus}!`, {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

    } catch (err: any) {
      console.error(`Error al actualizar el pedido ${orderId}:`, err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`Error al actualizar el pedido: ${err.response.data.message || err.message}`);
        toast.error(`Error al actualizar pedido: ${err.response.data.message || err.message}`, {
          position: "bottom-center",
          autoClose: 5000,
        });
      } else {
        setError('Error de conexión al actualizar pedido.');
      }
    }
  };

  const calculateTotalAmount = useCallback(() => {
    let total = 0;
    newOrderForm.formProducts.forEach(fp => {
      const product = availableProducts.find(p => p._id === fp.productId);
      if (product) {
        total += product.price * fp.quantity;
      }
      fp.selectedAddOns.forEach(sa => {
        const addOn = availableAddOns.find(a => a._id === sa.addOnId);
        if (addOn) {
          total += addOn.price * sa.quantity;
        }
      });
    });
    return total;
  }, [newOrderForm.formProducts, availableProducts, availableAddOns]);


  const handleSubmitNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- VALIDACIONES DE FRONTEND (DETIENEN EL ENVÍO SIN RECARGAR) ---
    if (!newOrderForm.guestName.trim()) {
      toast.error('El nombre del cliente es obligatorio.', { position: "bottom-center", autoClose: 3000 });
      return;
    }
    if (!newOrderForm.guestEmail.trim()) {
      toast.error('El email del cliente es obligatorio.', { position: "bottom-center", autoClose: 3000 });
      return;
    }
    if (!newOrderForm.guestPhone.trim()) {
      toast.error('El teléfono del cliente es obligatorio.', { position: "bottom-center", autoClose: 3000 });
      return;
    }
    if (newOrderForm.formProducts.length === 0) {
      toast.error('Debes añadir al menos un producto al pedido.', { position: "bottom-center", autoClose: 3000 });
      return;
    }
    // Validar que cada producto tenga un ID y una cantidad válida
    for (const fp of newOrderForm.formProducts) {
      if (!fp.productId) {
        toast.error('Por favor, selecciona un producto para cada artículo.', { position: "bottom-center", autoClose: 3000 });
      return;
      }
      if (fp.quantity <= 0) {
        toast.error('La cantidad de cada producto debe ser mayor a 0.', { position: "bottom-center", autoClose: 3000 });
        return;
      }
      // Validar adicionales para cada producto
      for (const sa of fp.selectedAddOns) {
        if (!sa.addOnId) {
          toast.error('Por favor, selecciona un adicional para cada artículo de adicional.', { position: "bottom-center", autoClose: 3000 });
          return;
        }
        if (sa.quantity <= 0) {
          toast.error('La cantidad de cada adicional debe ser mayor a 0.', { position: "bottom-center", autoClose: 3000 });
          return;
        }
      }
    }

    if (newOrderForm.deliveryType === 'delivery' && (!newOrderForm.shippingStreet.trim() || !newOrderForm.shippingCity.trim())) {
      toast.error('Para entregas a domicilio, la calle y la ciudad son obligatorias.', { position: "bottom-center", autoClose: 3000 });
      return;
    }
    // --- FIN VALIDACIONES DE FRONTEND ---


    const totalAmount = calculateTotalAmount();

    const productsForBackend = newOrderForm.formProducts.map(fp => ({
      productId: fp.productId,
      quantity: fp.quantity,
      addOns: fp.selectedAddOns.map(sa => ({
        addOnId: sa.addOnId,
        quantity: sa.quantity,
      })),
    }));

    const orderData: NewOrderData = {
      guestEmail: newOrderForm.guestEmail.trim(),
      guestName: newOrderForm.guestName.trim(),
      guestPhone: newOrderForm.guestPhone.trim(),
      totalAmount: totalAmount,
      paymentMethod: newOrderForm.paymentMethod,
      deliveryType: newOrderForm.deliveryType,
      products: productsForBackend,
      status: 'pending',
    };

    if (newOrderForm.deliveryType === 'delivery') {
      orderData.shippingAddress = {
        street: newOrderForm.shippingStreet.trim(),
        city: newOrderForm.shippingCity.trim(),
      };
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_BASE_URL}/api/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders(false);
      toast.success('Pedido creado exitosamente!', {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Resetear el formulario después de crear
      setNewOrderForm({
        guestEmail: '',
        guestName: '',
        guestPhone: '',
        paymentMethod: 'cash',
        deliveryType: 'pickup',
        shippingStreet: '',
        shippingCity: '',
        formProducts: [{ tempId: Date.now().toString(), productId: '', quantity: 1, selectedAddOns: [] }],
      });
    } catch (err: any) {
      console.error('Error al crear pedido:', err);
      const errorMessage = axios.isAxiosError(err) && err.response ? err.response.data.message || err.message : err.message;
      setError(`Error al crear pedido: ${errorMessage}`);
      toast.error(`Error al crear pedido: ${errorMessage}`, {
        position: "bottom-center",
        autoClose: 5000,
      });
    }
  };

  const handleConfirmShippingCost = () => {
    if (orderToProcess) {
      const shippingCost = parseFloat(shippingCostInput);
      if (isNaN(shippingCost) || shippingCost < 0) {
        toast.error('Por favor, ingresa un valor de envío válido.', { position: "bottom-center" });
        return;
      }

      // 1. Imprimir la comanda con el costo de envío
      handlePrintComanda(orderToProcess, shippingCost);
      // 2. Actualizar el estado del pedido a 'processing' en el backend
      updateOrderStatus(orderToProcess._id, 'processing');
      // 3. Limpiar estados y cerrar modal
      setShippingCostInput('');
      setOrderToProcess(null);
      setShowShippingModal(false);
    }
  };


// [FUNCIÓN MODIFICADA]
// Ahora `handleOrderAccept` solo se encarga de mostrar la alerta de confirmación.
const handleOrderAccept = (orderId: string) => {
    toast.info(
        <div className={styles.toastConfirmContent}>
            <p>¿Aceptar este pedido y enviarlo a cocina?</p>
            <div className={styles.toastButtons}>
                <button
                    onClick={() => {
                        // [CÓDIGO MOVIDO AQUÍ]
                        const order = orders.find(o => o._id === orderId);
                        if (!order) {
                            toast.error('Pedido no encontrado.');
                            toast.dismiss(); // Cierra el toast en caso de error
                            return;
                        }
                    
                        if (order.deliveryType === 'delivery') {
                            setOrderToProcess(order);
                            setShowShippingModal(true);
                        } else {
                            handlePrintComanda(order);
                            updateOrderStatus(order._id, 'processing');
                        }
                    
                        // Cerramos el toast después de ejecutar la lógica
                        toast.dismiss();
                    }}
                    className={styles.toastConfirmButton}
                >
                    Sí, Aceptar
                </button>
                <button
                    onClick={() => toast.dismiss()}
                    className={styles.toastCancelButton}
                >
                    No
                </button>
            </div>
        </div>,
        {
            position: "top-center",
            autoClose: false,
            closeButton: false,
            draggable: false,
            className: styles.customConfirmationToast,
        }
    );
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
        draggable: false,
        className: styles.customConfirmationToast,
      }
    );
  };
  
  // [MODIFICACIÓN CLAVE]
  // Esta función ahora solo maneja la lógica de restauración y no muestra la confirmación.
  const handleOrderRestore = (orderId: string) => {
    updateOrderStatus(orderId, 'pending');
  };
 
  // [REFACTORIZADO] Usar el nuevo hook para la funcionalidad de exportar y limpiar
  const { handleExport, handleClean } = useOrderExport({ API_BASE_URL, productMapRef, fetchOrders });

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  if (initialLoading && orders.length === 0) {
    return <div className={styles.loading}>Cargando pedidos...</div>;
  }

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.ordersManagementContainer}>
      <ToastContainer />
      <h1 className={styles.title}>Gestión de Pedidos</h1>
      {isFetching && <div className={styles.subtleLoading}>Actualizando pedidos...</div>}
    
      <div className={styles.managementHeader}>
        {/* NUEVO: Botones separados para exportar y limpiar */}
        <div className={styles.exportCleanButtons}>
          <button 
            className={styles.exportButton} 
            onClick={handleExport}
          >
            Exportar Historial
          </button>
          <button 
            className={styles.cleanButton} 
            onClick={handleClean}
          >
            Limpiar Historial
          </button>
        </div>
      </div>
      

      {/* Renderizar el formulario de creación de pedidos */}
      <OrderCreationForm
        newOrderForm={newOrderForm}
        setNewOrderForm={setNewOrderForm}
        availableProducts={availableProducts}
        availableAddOns={availableAddOns}
        productMapRef={productMapRef}
        calculateTotalAmount={calculateTotalAmount}
        handleSubmitNewOrder={handleSubmitNewOrder}
      />

      {/* Renderizar la lista de pedidos */}
  <OrderListDisplay
  filteredOrders={filteredOrders}
  filterStatus={filterStatus}
  setFilterStatus={setFilterStatus}
  handleOrderDelivered={handleOrderDelivered}
  handleOrderCancelled={handleOrderCancelled}
  handleOrderRestore={handleOrderRestore}
  handleOrderAccept={handleOrderAccept}
  updateOrderInState={updateOrderInState}
/>

        {showShippingModal && (
        <ShippingCostModal
            shippingCostInput={shippingCostInput}
            setShippingCostInput={setShippingCostInput}
            onConfirm={handleConfirmShippingCost}
            onCancel={() => {
            setShowShippingModal(false);
            setShippingCostInput('');
            setOrderToProcess(null);
            }}
        />
)}


    </div>
  );
};

export default OrdersManagement;