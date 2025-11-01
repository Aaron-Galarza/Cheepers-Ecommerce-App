// src/pages/checkout/checkout.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../components/layout/checkout/cartcontext';
import styles from './../css/checkout.module.css';
import Button from '../../components/layout/design/button';
import { FaUser, FaPhone, FaMoneyBillWave, FaHome, FaRoad, FaCity, FaStore,FaAddressCard } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// (La función normalizeCityName no cambia)
const normalizeCityName = (cityName: string) => {
  const accentsMap: Record<string, string> = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n',
  };
  const lower = cityName.trim().toLowerCase();
  const normalized = lower
    .split('')
    .map(char => accentsMap[char] || char)
    .join('');
  return normalized;
};

// (El tipo DiscountConfig no cambia)
interface DiscountConfig {
  isActive: boolean;
  percentage: number;
  message: string;
}

const CheckoutPage: React.FC = () => {
  // (Estado 'email' eliminado)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
    const [DNI, setDNI] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [metodo, setMetodo] = useState<'efectivo' | 'mercadopago'>('efectivo');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { cart, clearCart, calculateCartTotal } = useCart();

  const subtotal = calculateCartTotal();
  const [finalTotal, setFinalTotal] = useState<number>(subtotal);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [discountConfig, setDiscountConfig] = useState<DiscountConfig>({
    isActive: false,
    percentage: 0,
    message: '',
  });

  // (useEffect para cargar la configuración de descuento no cambia)
  useEffect(() => {
    const fetchDiscountConfig = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/config/discount-status`);
        setDiscountConfig({
          isActive: response.data.isDiscountActive,
          percentage: response.data.discountPercentage,
          message: response.data.message,
        });
      } catch (error) {
        console.error("Error al cargar la configuración de descuento:", error);
        setDiscountConfig({ isActive: false, percentage: 0, message: '' });
      }
    };

    fetchDiscountConfig();
  }, []);

  // MODIFICADO: useEffect para calcular el total
  useEffect(() => {
    const itemsEligibleForDiscount = cart.filter(item =>
      item.category !== 'Promos' && item.category !== 'Promos Solo en Efectivo'
    );

    const totalEligible = itemsEligibleForDiscount.reduce((sum, item) => {
      let itemTotal = item.price;
      if (item.addOns?.length) {
        itemTotal += item.addOns.reduce(
          (addOnsSum, addOn) => addOnsSum + addOn.price * addOn.quantity,
          0
        );
      }
      return sum + (itemTotal * item.quantity);
    }, 0);

    // MODIFICADO: Lógica de descuento simplificada (como la pediste)
    // Solo depende del método de pago y si el descuento está activo
    if (metodo === 'efectivo' && discountConfig.isActive) {
      const discountRate = discountConfig.percentage / 100;
      const discount = totalEligible * discountRate;
      
      setDiscountAmount(discount);
      setFinalTotal(subtotal - discount);
    } else {
      // Si no es efectivo o el descuento está inactivo, no hay descuento
      setDiscountAmount(0);
      setFinalTotal(subtotal);
    }
    // MODIFICADO: 'deliveryType' ya no es una dependencia aquí
  }, [metodo, subtotal, cart, discountConfig]);

  
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    // (Validaciones de campos... no cambian)
    if (!name || !phone || !metodo || !deliveryType) {
      setErrorMessage('Por favor, completá todos los campos generales y de pago.');
      setIsLoading(false);
      return;
    }

    if (deliveryType === 'delivery') {
      if (!street || !city) {
        setErrorMessage('La dirección de envío es obligatoria.');
        setIsLoading(false);
        return;
      }
      const normalizedCity = normalizeCityName(city);
      const validCities = ['resistencia', 'resistensia', 'resistensía', 'resisténcia'];
      if (!validCities.includes(normalizedCity)) {
        setErrorMessage('Solo se permite realizar envíos a la ciudad de Resistencia. Por favor, corregí la ciudad.');
        setIsLoading(false);
        return;
      }
    }

    if (cart.length === 0) {
      setErrorMessage('No hay productos en el carrito para confirmar el pedido.');
      setIsLoading(false);
      return;
    }

    // (Preparación de orderData... no cambia)
    const productsForOrder = cart.map(item => ({
      productId: item._id,
      quantity: item.quantity,
      addOns: item.addOns?.map(addOn => ({
        addOnId: addOn._id,
        quantity: addOn.quantity,
      })) || [],
    }));

    const backendPaymentMethod = metodo === 'efectivo' ? 'cash' : 'card';

    const orderData: any = {
      products: productsForOrder,
      guestName: name,
     guestDNI: DNI.trim(),
      guestPhone: phone,
      totalAmount: finalTotal, 
      paymentMethod: backendPaymentMethod,
      deliveryType,
      notes: '',
    };

    if (deliveryType === 'delivery') {
      orderData.shippingAddress = { street, city };
    }

    // MANTENIDO: Lógica de redirección segura (esto ya estaba bien)
    try {
      const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData);

      const newOrder = response.data.order;

      // Verificamos que la API nos dio un 'order' y un '_id'
      if (newOrder && newOrder._id) {
        // ¡ÉXITO! Limpiamos el carrito y navegamos
        console.log('Pedido creado exitosamente con ID:', newOrder._id);
        clearCart();
        navigate(`/order-confirmation/${newOrder._id}`);
      } else {
        // La API respondió OK pero no vino el ID
        console.error('Error: La API no devolvió un ID de pedido válido.', response.data);
        setErrorMessage('Hubo un problema al procesar la respuesta de tu pedido. Intenta de nuevo.');
      }

    } catch (error: any) {
      // Error de Red (400, 500, etc)
      console.error('Error (catch) al confirmar el pedido:', error.response?.data?.message || error.message);
      setErrorMessage(error.response?.data?.message || 'Error inesperado al procesar tu pedido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Confirmar Pedido</h1>
      <div className={styles.gridContainer}>        
        <form onSubmit={handleConfirm} className={styles.formSection}>
          {/* ... (Datos Generales, Nombre, Teléfono no cambian) ... */}
          <h2 className={styles.sectionTitle}>
            <span className={styles.iconWrapper}><FaUser /></span> Datos Generales
          </h2>
          {errorMessage && (
            <div className={styles.errorMessage} role="alert">
              <strong className={styles.errorMessageStrong}>¡Error!</strong>
              <span className={styles.errorMessageSpan}> {errorMessage}</span>
            </div>
          )}

          {/* --- INICIO DE LA CORRECCIÓN --- */}
          {/* Este div envuelve los 3 inputs */}
          <div className={styles.inputGroup}>
            
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><FaUser /></span>
              <input
                type="text"
                placeholder="Nombre y apellido"
                value={name}
                onChange={e => setName(e.target.value)}
                className={styles.inputField}
                required
                pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
                maxLength={40}
                title="El nombre no puede contener números ni símbolos."
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
                required
                pattern="^[0-9]{8,15}$"
                title="El teléfono debe tener entre 8 y 15 números y sin letras."
              />
            </div>
            
            {/* El div de DNI ahora está dentro de inputGroup y ya no tiene 
                un inputGroup extra adentro */}
            <div className={styles.inputWrapper}> 
              <span className={styles.inputIcon}><FaAddressCard /></span>
              <input
                type="tel"
                placeholder="DNI (opcional)"
                value={DNI}
                onChange={e => setDNI(e.target.value)}
                className={styles.inputField}
                pattern="^[0-9]{7,9}$"
                title="El DNI debe tener entre 7 y 9 números, sin puntos."
              />
            </div>
            <p className={styles.infoTextSimple}>
                🎁 ¡Ingresando tu DNI sumás puntos con tu compra!
              </p>
          </div> 
          {/* --- FIN DE LA CORRECCIÓN --- */}


          {/* ... (Tipo de Entrega y Dirección no cambian) ... */}
          <h3 className={styles.sectionTitle}>
            <span className={styles.iconWrapper}><FaHome /></span> Tipo de Entrega
          </h3>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="delivery"
                checked={deliveryType === 'delivery'}
                onChange={() => setDeliveryType('delivery')}
                className={styles.radioInput}
              />
              <span className={styles.radioText}><FaHome /> Envío a Domicilio</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="pickup"
                checked={deliveryType === 'pickup'}
                onChange={() => setDeliveryType('pickup')}
                className={styles.radioInput}
              />
              <span className={styles.radioText}><FaStore /> Retiro en Sucursal</span>
            </label>
          </div>
          {deliveryType === 'delivery' && (
            <>
             <h3 className={styles.sectionTitle}>
               <span className={styles.iconWrapper}><FaHome /></span> Dirección de Envío
             </h3>
             <div className={styles.inputGroup}>
               <div className={styles.inputWrapper}>
                 <span className={styles.inputIcon}><FaRoad /></span>
                 <input
                   type="text"
                   placeholder="Calle y número"
                   value={street}
                   onChange={e => setStreet(e.target.value)}
                   className={styles.inputField}
                   required
                   maxLength={60}
                   title="La dirección de envío es obligatoria."
                 />
               </div>
               <div className={styles.inputWrapper}>
                 <span className={styles.inputIcon}><FaCity /></span>
                 <input
                   type="text"
                   placeholder="Ciudad"
                   value={city}
                   onChange={e => setCity(e.target.value)}
                   className={styles.inputField}
                   required
                   maxLength={40}
                   title="La ciudad es obligatoria."
                 />
               </div>
               <p className={styles.infoTextSimple}>
                 Actualmente solo hacemos envíos en Resistencia.
               </p>
             </div>
            </>
          )}

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
              {/* MODIFICADO: Texto del descuento (sin 'deliveryType') */}
              <span className={styles.radioText}>
                Efectivo
                {discountConfig.isActive && ` (${discountConfig.percentage}% de descuento)`}
              </span>
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

          {/* MODIFICADO: Mensaje de la API (sin 'deliveryType') */}
          {discountConfig.isActive && (
            <p className={styles.infoTextSimple}>
              {discountConfig.message}
            </p>
          )}

          {/* (Botones del formulario no cambian) */}
          <div className={styles.formButtons}>
            <Button className={styles.backButton} onClick={() => navigate('/menu')}>
              Atrás
            </Button>
            <Button
              type="submit"
              className={styles.confirmButton}
              disabled={isLoading || cart.length === 0}
            >
              {isLoading ? 'Confirmando...' : 'Confirmar pedido'}
            </Button>
          </div>
        </form>

        {/* --- SECCIÓN DE RESUMEN --- */}
        <div className={styles.summarySection}>
          <h2 className={styles.summaryTitle}>Mi Pedido</h2>
          <div className={styles.summaryItems}>
            {/* (Mapeo de items no cambia) */}
            {cart.length === 0 ? (
              <p className={styles.summaryEmpty}>No hay productos en el carrito.</p>
            ) : (
              cart.map(item => (
                <div key={item.cartItemId} className={styles.summaryItem}>
                  <p className={styles.summaryItemName}>
                    <strong>{item.name}</strong> (x{item.quantity})
                  </p>
                  {Array.isArray(item.addOns) && item.addOns.length > 0 && (
                    <ul className={styles.addOnsSummaryList}>
                      {item.addOns.map(addOn => (
                        <li key={addOn._id} className={styles.addOnsSummaryItem}>
                          {addOn.name} - ${addOn.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className={styles.summaryItemPrice}>
                    {(
                      item.price * item.quantity +
                      (item.addOns?.reduce((sum, ao) => sum + ao.price * ao.quantity, 0) || 0)
                    ).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>

          <hr className={styles.summaryDivider} />
          <div className={styles.summaryTotalRow}>
            <p className={styles.summaryTotalLabel}>Subtotal:</p>
            <p className={styles.summaryTotalValue}>${subtotal.toFixed(2)}</p>
          </div>

          {/* (Lógica de descuento en el resumen no cambia, ya está correcta) */}
          {metodo === 'efectivo' && discountAmount > 0 && (
            <div className={styles.summaryDiscountRow}>
              <p className={styles.summaryDiscountLabel}>
                Descuento por Efectivo ({discountConfig.percentage}%): 
                <br />
                (No aplica a promos)
              </p>
              <p className={styles.summaryDiscountValue}>-${discountAmount.toFixed(2)}</p>
            </div>
          )}

          <div className={styles.summaryGrandTotalRow}>
            <p className={styles.summaryGrandTotalLabel}>Total:</p>
<p className={styles.summaryGrandTotalValue}>${finalTotal.toFixed(2)}</p>          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;