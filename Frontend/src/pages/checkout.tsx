// src/pages/checkout.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/layout/cartcontext'; // Asegúrate de que esta ruta sea correcta
import styles from './checkout.module.css'; // Importa tu CSS Module
import Button from '../components/layout/button'; // Importa el componente Button desde su ubicación
import { FaUser, FaPhone, FaEnvelope, FaMoneyBillWave, FaHome, FaRoad, FaCity, FaMapPin } from 'react-icons/fa'; // Iconos de Font Awesome
import axios from 'axios'; // ¡Importar axios!

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com'; // Definir la URL base aquí

const CheckoutPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState(''); // El campo 'name' lo usaremos para 'nombre y apellido'
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [metodo, setMetodo] = useState(''); // 'efectivo' o 'mercadopago'
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Nuevo estado para indicar si se está cargando
    
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleConfirm = async () => { // Hacemos la función asíncrona
        setErrorMessage(''); // Limpia cualquier mensaje de error previo
        setIsLoading(true); // Activa el estado de carga

        // 1. Validación de campos (ya la tienes, asegurándonos de que esté completa)
        if (!email || !name || !phone || !street || !city || !postalCode || !metodo) { // Corregido: !phone en vez de !!phone
            setErrorMessage('Por favor, completá todos los campos.');
            setIsLoading(false); // Desactiva la carga si hay un error
            return;
        }

        // Validar que el carrito no esté vacío
        if (cart.length === 0) {
            setErrorMessage('No hay productos en el carrito para confirmar el pedido.');
            setIsLoading(false);
            return;
        }

        // 2. Mapear el carrito a la estructura esperada por el backend (IProductItem[])
        const productsForOrder = cart.map(item => ({
            productId: item._id, // Usamos el _id del producto del carrito
            name: item.name,
            imageUrl: item.imageUrl, // Asumo que el carrito tiene 'image', si es 'imageUrl' cámbialo
            quantity: item.quantity,
            priceAtOrder: item.price,
        }));

        // 3. Mapear el método de pago al formato del backend
        let backendPaymentMethod: 'cash' | 'card' | 'transfer';
        if (metodo === 'efectivo') {
            backendPaymentMethod = 'cash';
        } else if (metodo === 'mercadopago') {
            // Asumo que Mercado Pago se mapea a 'card' o 'transfer'.
            // Si en el backend usas 'mercadopago', deberías agregarlo al enum en Pedido.ts.
            backendPaymentMethod = 'card'; 
        } else {
            setErrorMessage('Método de pago no válido.');
            setIsLoading(false);
            return;
        }

        // 4. Preparar el objeto de datos del pedido
        const orderData = {
            products: productsForOrder,
            shippingAddress: {
                street: street,
                city: city,
                postalCode: postalCode,
            },
            paymentMethod: backendPaymentMethod,
            guestEmail: email,
            guestPhone: phone,
            notes: '', // Puedes agregar un campo de notas en el frontend si lo deseas
        };

        try {
            // 5. Enviar el pedido (METODO POST) al backend usando AXIOS
            const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData);
            
            console.log('Pedido creado exitosamente:', response.data.order);

            // 6. Si el pedido se creó exitosamente:
            clearCart(); // Limpia el carrito SOLO si el pedido fue exitoso
            navigate('/order-confirmation'); // Navega a la página de confirmación

        } catch (error: any) {
            console.error('Hubo un error al confirmar el pedido:', error.response?.data?.message || error.message);
            setErrorMessage(error.response?.data?.message || 'Ocurrió un error inesperado al procesar tu pedido. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false); // Desactiva el estado de carga siempre al finalizar
        }
    };

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>Confirmar Pedido</h1>

            <div className={styles.gridContainer}>
                {/* Formulario de Datos */}
                <div className={styles.formSection}>
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
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}><FaMapPin /></span>
                            <input
                                type="text"
                                placeholder="Código Postal"
                                value={postalCode}
                                onChange={e => setPostalCode(e.target.value)}
                                className={styles.inputField}
                            />
                        </div>
                    </div>
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
                            <span className={styles.radioText}>Efectivo</span>
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

                    <div className={styles.formButtons}>
                        <Button className={styles.backButton} onClick={() => navigate('/carrito')}>
                            Atrás
                        </Button>
                        <Button
                            className={styles.confirmButton}
                            onClick={handleConfirm}
                            disabled={isLoading || cart.length === 0} // Deshabilita el botón si carga o carrito vacío
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
                                <div key={item._id} className={styles.summaryItem}>
                                    <p className={styles.summaryItemName}><strong>{item.name}</strong> (x{item.quantity})</p>
                                    <p className={styles.summaryItemPrice}>${item.price.toFixed(2)}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <hr className={styles.summaryDivider} />
                    <div className={styles.summaryTotalRow}>
                        <p className={styles.summaryTotalLabel}>Subtotal:</p>
                        <p className={styles.summaryTotalValue}>${total.toFixed(2)}</p>
                    </div>
                    <div className={styles.summaryGrandTotalRow}>
                        <p className={styles.summaryGrandTotalLabel}>Total:</p>
                        <p className={styles.summaryGrandTotalValue}>${total.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;