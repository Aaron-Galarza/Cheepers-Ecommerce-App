import React, { useState, useEffect } from 'react'; // Agregamos useEffect
import { useCart } from '../../components/layout/checkout/cartcontext';
import styles from './../css/carrito.module.css';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/layout/design/button';
import axios from 'axios'; // Para obtener los adicionales disponibles
import { CartItem, IAddOn, SelectedAddOn } from '../../components/layout/checkout/productlist'; // Importa las interfaces

const API_BASE_URL = import.meta.env.VITE_API_URL;

const CarritoPage: React.FC = () => {
    const { cart, removeFromCart, clearCart, calculateCartTotal, updateCartItemAddOns } = useCart();
    const total = calculateCartTotal();
    const navigate = useNavigate();

    // ADICIÓN: Estado para almacenar todos los adicionales disponibles del backend
    const [allAvailableAddOns, setAllAvailableAddOns] = useState<IAddOn[]>([]);
    const [loadingAddOns, setLoadingAddOns] = useState<boolean>(true);
    const [errorAddOns, setErrorAddOns] = useState<string | null>(null);

    // ADICIÓN: Cargar los adicionales disponibles al montar el componente
    useEffect(() => {
        const fetchAddOns = async () => {
            try {
                setLoadingAddOns(true);
                const response = await axios.get<IAddOn[]>(`${API_BASE_URL}/api/addons`);
                // Filtramos solo los adicionales activos para mostrar en el carrito
                setAllAvailableAddOns(response.data.filter(ao => ao.isActive));
            } catch (err) {
                console.error('Error al cargar los adicionales disponibles:', err);
                setErrorAddOns('No se pudieron cargar los adicionales.');
            } finally {
                setLoadingAddOns(false);
            }
        };

        fetchAddOns();
    }, []); // Se ejecuta solo una vez al montar

    // Función para calcular el subtotal de un item individual, incluyendo sus adicionales
    const calculateItemSubtotal = (item: CartItem) => {
        let subtotal = item.price * item.quantity;
        if (item.addOns && item.addOns.length > 0) {
            subtotal += item.addOns.reduce((addOnsSum, addOn) => {
                return addOnsSum + (addOn.price * addOn.quantity);
            }, 0) * item.quantity;
        }
        return subtotal;
    };

    // ADICIÓN: Manejar el cambio del checkbox para un adicional
    const handleAddOnToggle = (cartItemId: string, addOn: IAddOn, isChecked: boolean) => {
        const currentItem = cart.find(item => item.cartItemId === cartItemId);
        if (!currentItem) return;

        const newAddOns: SelectedAddOn[] = [];

        // Primero, copia los adicionales existentes, excluyendo el que se va a modificar/eliminar
        currentItem.addOns?.forEach(existingAddOn => {
            if (existingAddOn._id !== addOn._id) {
                newAddOns.push(existingAddOn);
            }
        });

        // Si el checkbox está marcado, añade el adicional con cantidad 1
        if (isChecked) {
            newAddOns.push({
                _id: addOn._id,
                name: addOn.name,
                price: addOn.price,
                quantity: 1, // Cantidad fija de 1 para checkbox
            });
        }
        
        // Llama a la función del contexto para actualizar el carrito con los nuevos adicionales
        updateCartItemAddOns(cartItemId, newAddOns);
    };

    if (loadingAddOns) return <div className={styles.container}>Cargando adicionales...</div>;
    if (errorAddOns) return <div className={styles.container} style={{ color: 'red' }}>{errorAddOns}</div>;


    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Tu Carrito</h1>
            {cart.length === 0 ? (
                <p className={styles.empty}>El carrito está vacío.</p>
            ) : (
                <>
                    <ul className={styles.list}>
                        {cart.map(item => {
                            // Filtra los adicionales disponibles que son relevantes para la categoría de este producto
                            const relevantAddOns = allAvailableAddOns.filter(ao =>
                                ao.associatedProductCategories.includes(item.category)
                            );

                            return (
                                <li key={item.cartItemId} className={styles.item}>
                                    <img src={item.imageUrl} alt={item.name} className={styles.image} />
                                    <div className={styles.info}>
                                        <h2 className={styles.itemName}>{item.name}</h2>
                                        <p className={styles.itemQuantity}>Cantidad: {item.quantity}</p>

                                        {/* ADICIÓN: Sección para Checkboxes de Adicionales */}
                                        {relevantAddOns.length > 0 && (
                                            <div className={styles.addOnsCheckboxes}>
                                                <p className={styles.addOnsTitle}>Adicionales disponibles:</p>
                                                {relevantAddOns.map(addOn => (
                                                    <label key={addOn._id} className={styles.addOnCheckboxLabel}>
                                                        <input
                                                            type="checkbox"
                                                            className={styles.addOnCheckboxInput}
                                                            checked={item.addOns?.some(a => a._id === addOn._id) || false}
                                                            onChange={(e) => handleAddOnToggle(item.cartItemId, addOn, e.target.checked)}
                                                        />
                                                        {addOn.name} (+${addOn.price.toFixed(2)})
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {/* ADICIÓN: Mostrar adicionales ya seleccionados (la lista de arriba es para seleccionar, esta para ver lo que ya está) */}
                                        {item.addOns && item.addOns.length > 0 && (
                                            <div className={styles.itemAddOnsSummary}>
                                                <p className={styles.addOnsTitle}>Adicionales agregados:</p>
                                                <ul className={styles.addOnsList}>
                                                    {item.addOns.map(addOn => (
                                                        <li key={addOn._id} className={styles.addOnItem}>
                                                            {addOn.name} (x{addOn.quantity}) - ${addOn.price.toFixed(2)} c/u
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <p className={styles.itemSubtotal}>Subtotal: ${calculateItemSubtotal(item).toFixed(2)}</p>
                                        
                                        <div className={styles.itemActions}>
                                            <Button className={styles.removeButton} onClick={() => removeFromCart(item.cartItemId)}>
                                                Eliminar
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <div className={styles.footer}>
                        <p className={styles.total}>Total: ${total.toFixed(2)}</p>
                        <div className={styles.buttonsContainer}>
                            <Button className={styles.checkoutButton} onClick={() => navigate('/checkout')}>Confirmar pedido</Button>
                            <Button className={styles.clearCartButton} onClick={clearCart}>Vaciar Carrito</Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CarritoPage;
