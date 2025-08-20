import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../../components/layout/checkout/cartcontext';
import styles from './../css/carrito.module.css';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/layout/design/button';
import axios from 'axios';
import { CartItem, IAddOn, SelectedAddOn } from '../../components/layout/checkout/productlist';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const CarritoPage: React.FC = () => {
    const { cart, removeFromCart, clearCart, calculateCartTotal, updateCartItemAddOns } = useCart();
    const total = calculateCartTotal();
    const navigate = useNavigate();

    const [allAvailableAddOns, setAllAvailableAddOns] = useState<IAddOn[]>([]);
    const [loadingAddOns, setLoadingAddOns] = useState<boolean>(true);
    const [errorAddOns, setErrorAddOns] = useState<string | null>(null);

    useEffect(() => {
        const fetchAddOns = async () => {
            try {
                setLoadingAddOns(true);
                const response = await axios.get<IAddOn[]>(`${API_BASE_URL}/api/addons`);
                setAllAvailableAddOns(response.data.filter(ao => ao.isActive));
            } catch (err) {
                console.error('Error al cargar los adicionales disponibles:', err);
                setErrorAddOns('No se pudieron cargar los adicionales.');
            } finally {
                setLoadingAddOns(false);
            }
        };
        fetchAddOns();
    }, []);

    const calculateItemSubtotal = (item: CartItem) => {
        let subtotal = item.price;
        if (item.addOns && item.addOns.length > 0) {
            subtotal += item.addOns.reduce((addOnsSum, addOn) => {
                return addOnsSum + (addOn.price * addOn.quantity);
            }, 0);
        }
        return subtotal * item.quantity;
    };
    
    const handleAddOnToggle = useCallback((cartItemId: string, addOn: IAddOn) => {
        const currentItem = cart.find(item => item.cartItemId === cartItemId);
        if (!currentItem) return;
    
        const isAddOnSelected = currentItem.addOns?.some(a => a._id === addOn._id);
        
        let newAddOns: SelectedAddOn[] = [];
        
        if (isAddOnSelected) {
            newAddOns = currentItem.addOns?.filter(existingAddOn => existingAddOn._id !== addOn._id) || [];
        } else {
            newAddOns = [
                ...(currentItem.addOns || []),
                {
                    _id: addOn._id,
                    name: addOn.name,
                    price: addOn.price,
                    quantity: 1, 
                },
            ];
        }

        updateCartItemAddOns(cartItemId, newAddOns);
    }, [cart, updateCartItemAddOns]);

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
                            const relevantAddOns = allAvailableAddOns.filter(ao =>
                                ao.associatedProductCategories.includes(item.category)
                            );

                            return (
                                <li key={item.cartItemId} className={styles.item}>
                                    <img src={item.imageUrl} alt={item.name} className={styles.image} />
                                    <div className={styles.info}>
                                        <h2 className={styles.itemName}>{item.name}</h2>
                                        <p className={styles.itemQuantity}>Cantidad: {item.quantity}</p>
                                        
                                        {relevantAddOns.length > 0 && (
                                            <div className={styles.addOnsSection}>
                                                <p className={styles.addOnsTitle}>Adicionales disponibles:</p>
                                                <div className={styles.addOnsButtonsContainer}>
                                                    {relevantAddOns.map(addOn => {
                                                        const isSelected = item.addOns?.some(a => a._id === addOn._id);
                                                        return (
                                                            <button
                                                                key={addOn._id}
                                                                className={`${styles.addOnButton} ${isSelected ? styles.addOnButtonActive : ''}`}
                                                                onClick={() => handleAddOnToggle(item.cartItemId, addOn)}
                                                            >
                                                                {addOn.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {item.addOns && item.addOns.length > 0 && (
                                            <div className={styles.itemAddOnsSummary}>
                                                <p className={styles.addOnsTitle}>Adicionales agregados:</p>
                                                <ul className={styles.addOnsList}>
                                                    {item.addOns.map(addOn => (
                                                        <li key={addOn._id} className={styles.addOnItem}>
                                                            {addOn.name} - ${addOn.price.toFixed(2)}
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