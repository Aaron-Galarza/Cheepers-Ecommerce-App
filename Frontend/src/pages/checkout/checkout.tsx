// C:\Users\Usuario\Desktop\Aaron\Cheepers-Ecommerce-App\Frontend\src\pages\checkout\checkout.tsx

import React, { useState, useEffect } from 'react'; // Importamos `useEffect` para la lógica del descuento
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../components/layout/checkout/cartcontext';
import styles from './../css/checkout.module.css';
import Button from '../../components/layout/design/button';
import { FaUser, FaPhone, FaEnvelope, FaMoneyBillWave, FaHome, FaRoad, FaCity, FaStore } from 'react-icons/fa';
import axios from 'axios';

// Considera mover esta URL a una variable de entorno para producción
const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

const CheckoutPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    
    // El estado del método de pago sigue siendo el mismo.
    const [metodo, setMetodo] = useState<'efectivo' | 'mercadopago'>('efectivo');
    
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { cart, clearCart, calculateCartTotal } = useCart();
    
    // Usamos `subtotal` para el total original del carrito antes del descuento
    const subtotal = calculateCartTotal();

    // NUEVO: Estados para manejar el descuento y el total final
    const [finalTotal, setFinalTotal] = useState<number>(subtotal);
    const [discountAmount, setDiscountAmount] = useState<number>(0);

    // NUEVO: `useEffect` para calcular el descuento cada vez que el carrito o el método de pago cambien
    useEffect(() => {
        // Filtramos los productos que no son promos ni combos
        const itemsEligibleForDiscount = cart.filter(item => 
            item.category !== 'Promos' && item.category !== 'Promos Solo en Efectivo'
        );

        // Sumamos el total solo de los productos elegibles para el descuento
        const totalEligibleForDiscount = itemsEligibleForDiscount.reduce((sum, item) => {
            // Calculamos el subtotal de cada ítem (producto + adicionales)
            let itemSubtotal = item.price * item.quantity;
            if (item.addOns && item.addOns.length > 0) {
                itemSubtotal += item.addOns.reduce((addOnsSum, addOn) => 
                    addOnsSum + (addOn.price * addOn.quantity), 0
                );
            }
            return sum + itemSubtotal;
        }, 0);

        // Si el método de pago es efectivo, aplicamos el descuento
        if (metodo === 'efectivo') {
            const calculatedDiscount = totalEligibleForDiscount * 0.10; // 10% de descuento
            setDiscountAmount(calculatedDiscount);
            setFinalTotal(subtotal - calculatedDiscount);
        } else {
            // Si el método es otro, no hay descuento
            setDiscountAmount(0);
            setFinalTotal(subtotal);
        }
    }, [metodo, subtotal, cart]); // Dependencias: el efecto se ejecuta cuando estos valores cambian

    const handleConfirm = async () => {
        setErrorMessage('');
        setIsLoading(true);

        if (!email || !name || !phone || !metodo || !deliveryType) {
            setErrorMessage('Por favor, completá todos los campos generales y de pago.');
            setIsLoading(false);
            return;
        }

        if (deliveryType === 'delivery') {
            if (!street || !city) {
                setErrorMessage('Para envío a domicilio, la calle y la ciudad son obligatorias.');
                setIsLoading(false);
                return;
            }
        }

        if (cart.length === 0) {
            setErrorMessage('No hay productos en el carrito para confirmar el pedido.');
            setIsLoading(false);
            return;
        }

        const productsForOrder = cart.map(item => ({
            productId: item._id,
            quantity: item.quantity,
            addOns: item.addOns?.map(addOn => ({
                addOnId: addOn._id,
                quantity: addOn.quantity,
            })) || [],
        }));

        let backendPaymentMethod: 'cash' | 'card' | 'transfer';
        if (metodo === 'efectivo') {
            backendPaymentMethod = 'cash';
        } else if (metodo === 'mercadopago') {
            backendPaymentMethod = 'card';
        } else {
            setErrorMessage('Método de pago no válido.');
            setIsLoading(false);
            return;
        }

        const orderData: any = {
            products: productsForOrder,
            guestName: name,
            guestEmail: email,
            guestPhone: phone,
            // IMPORTANTE: Aquí enviamos el total final con el descuento aplicado
            totalAmount: finalTotal, 
            paymentMethod: backendPaymentMethod,
            deliveryType: deliveryType,
            notes: '',
        };

        if (deliveryType === 'delivery') {
            orderData.shippingAddress = {
                street: street,
                city: city,
            };
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData);
            console.log('Pedido creado exitosamente:', response.data.order);
            clearCart();
            navigate('/order-confirmation');
        } catch (error: any) {
            console.error('Hubo un error al confirmar el pedido:', error.response?.data?.message || error.message);
            setErrorMessage(error.response?.data?.message || 'Ocurrió un error inesperado al procesar tu pedido. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>Confirmar Pedido</h1>

            <div className={styles.gridContainer}>
                {/* Formulario de Datos */}
                <div className={styles.formSection}>
                    {/* ... (el resto de tu formulario de datos) ... */}
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.iconWrapper}><FaUser /></span> Datos Generales
                    </h2>
                    {errorMessage && (
                        <div className={styles.errorMessage} role="alert">
                            <strong className={styles.errorMessageStrong}>¡Error!</strong>
                            <span className={styles.errorMessageSpan}> {errorMessage}</span>
                        </div>
                    )}
                    <div className={styles.inputGroup}>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}><FaEnvelope /></span>
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}><FaUser /></span>
                            <input
                                type="text"
                                placeholder="Nombre y apellido"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className={styles.inputField}
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
                            />
                        </div>
                    </div>

                    {/* Selector de Tipo de Entrega */}
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
                            <span className={styles.radioText}>
                                <FaHome/> Envío a Domicilio
                            </span>
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                value="pickup"
                                checked={deliveryType === 'pickup'}
                                onChange={() => setDeliveryType('pickup')}
                                className={styles.radioInput}
                            />
                            <span className={styles.radioText}>
                                <FaStore /> Retiro en Sucursal
                            </span>
                        </label>
                    </div>

                    {/* Campos de Dirección de Envío (condicionales) */}
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
                                // Al cambiar el radio, actualizamos el estado
                                onChange={() => setMetodo('efectivo')}
                                className={styles.radioInput}
                            />
                            <span className={styles.radioText}>Efectivo (10% de descuento)</span>
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                value="mercadopago"
                                checked={metodo === 'mercadopago'}
                                // Al cambiar el radio, actualizamos el estado
                                onChange={() => setMetodo('mercadopago')}
                                className={styles.radioInput}
                            />
                            <span className={styles.radioText}>Mercado Pago</span>
                        </label>
                    </div>

                    <div className={styles.formButtons}>
                        <Button className={styles.backButton} onClick={() => navigate('/carrito')}>
                            Atrás
                        </Button>
                        <Button
                            className={styles.confirmButton}
                            onClick={handleConfirm}
                            disabled={isLoading || cart.length === 0}
                        >
                            {isLoading ? 'Confirmando...' : 'Confirmar pedido'}
                        </Button>
                    </div>
                </div>

                {/* Resumen del Pedido */}
                <div className={styles.summarySection}>
                    <h2 className={styles.summaryTitle}>Mi Pedido</h2>
                    <div className={styles.summaryItems}>
                        {cart.length === 0 ? (
                            <p className={styles.summaryEmpty}>No hay productos en el carrito.</p>
                        ) : (
                            cart.map(item => (
                                <div key={item.cartItemId} className={styles.summaryItem}>
                                    <p className={styles.summaryItemName}><strong>{item.name}</strong> (x{item.quantity})</p>
                                    {item.addOns && item.addOns.length > 0 && (
                                        <ul className={styles.addOnsSummaryList}>
                                            {item.addOns.map(addOn => (
                                                <li key={addOn._id} className={styles.addOnsSummaryItem}>
                                                    + {addOn.name} (x{addOn.quantity}) - ${addOn.price.toFixed(2)} c/u
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <p className={styles.summaryItemPrice}>${(item.price * item.quantity + (item.addOns?.reduce((sum, ao) => sum + ao.price * ao.quantity, 0) || 0)).toFixed(2)}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <hr className={styles.summaryDivider} />
                    
                    {/* NUEVO: Fila para mostrar el subtotal */}
                    <div className={styles.summaryTotalRow}>
                        <p className={styles.summaryTotalLabel}>Subtotal:</p>
                        <p className={styles.summaryTotalValue}>${subtotal.toFixed(2)}</p>
                    </div>
                    
                    {/* NUEVO: Fila para mostrar el descuento, solo si es efectivo y el descuento es mayor a 0 */}
                    {metodo === 'efectivo' && discountAmount > 0 && (
                        <div className={styles.summaryDiscountRow}>
                            <p className={styles.summaryDiscountLabel}>Descuento por Efectivo (10%):</p>
                            <p className={styles.summaryDiscountValue}>-${discountAmount.toFixed(2)}</p>
                        </div>
                    )}
                    
                    {/* La fila del total final ahora muestra el valor de `finalTotal` */}
                    <div className={styles.summaryGrandTotalRow}>
                        <p className={styles.summaryGrandTotalLabel}>Total:</p>
                        <p className={styles.summaryGrandTotalValue}>${finalTotal.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;