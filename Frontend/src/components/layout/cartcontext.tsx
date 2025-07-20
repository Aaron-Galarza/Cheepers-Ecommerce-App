import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
// CAMBIO: Importa Product, SelectedAddOn y CartItem desde types/index.ts
import { Product, SelectedAddOn, CartItem } from './productlist'; // Ajusta la ruta si es necesario

// Las definiciones de interfaces SelectedAddOn y CartItem se MUEVEN a src/types/index.ts
// Ya no deberían estar aquí.

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, addOns?: SelectedAddOn[]) => void;
    updateCartItemAddOns: (cartItemId: string, newAddOns: SelectedAddOn[]) => void;
    removeFromCart: (cartItemId: string) => void;
    clearCart: () => void;
    calculateCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be inside CartProvider');
    return ctx;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Función auxiliar para generar un ID único para cada combinación de producto y adicionales
    // Esta función es CRÍTICA. Asegúrate de que ordene los adicionales consistentemente.
    const generateCartItemId = useCallback((productId: string, addOns: SelectedAddOn[] = []): string => {
        if (!addOns || addOns.length === 0) {
            return productId; // Si no hay adicionales, el ID del producto es suficiente
        }
        // Crea una cadena hash con los IDs y cantidades de los adicionales, ordenados lexicográficamente
        const addOnParts = addOns
            .map(ao => `${ao._id}_${ao.quantity}`)
            .sort() // Ordena los IDs para que el hash sea consistente
            .join('-');
        return `${productId}__${addOnParts}`; // Usamos un separador que no se espera en IDs normales
    }, []);

    // CAMBIO: addToCart: Si no se pasan adicionales, se inicializan como vacíos.
    const addToCart = useCallback((product: Product, addOns: SelectedAddOn[] = []) => {
        setCart(prev => {
            const MAX_QUANTITY = 10;

            // Generar el ID único para esta combinación de producto y adicionales
            const newCartItemId = generateCartItemId(product._id, addOns);

            // Buscar si ya existe un ítem en el carrito con este ID único
            const existingCartItem = prev.find(item => item.cartItemId === newCartItemId);

            if (existingCartItem) {
                if (existingCartItem.quantity >= MAX_QUANTITY) {
                    console.warn(`No se puede agregar más de ${MAX_QUANTITY} unidades de "${product.name}" con estos adicionales.`);
                    return prev;
                }
                // Si existe, incrementa su cantidad
                return prev.map(item =>
                    item.cartItemId === newCartItemId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Si no existe, añade el nuevo ítem al carrito
                // Asegúrate de que 'addOns' sea un array vacío si no se proporciona
                return [...prev, { ...product, quantity: 1, addOns: addOns || [], cartItemId: newCartItemId }];
            }
        });
    }, [generateCartItemId]); // Depende de generateCartItemId

    // NUEVA FUNCIÓN: updateCartItemAddOns
    const updateCartItemAddOns = useCallback((oldCartItemId: string, newAddOns: SelectedAddOn[]) => {
        setCart(prev => {
            const itemToUpdateIndex = prev.findIndex(item => item.cartItemId === oldCartItemId);

            if (itemToUpdateIndex === -1) {
                console.warn(`No se encontró el ítem del carrito con ID: ${oldCartItemId}`);
                return prev;
            }

            const itemToUpdate = prev[itemToUpdateIndex];

            // Generar un nuevo cartItemId si los adicionales cambian
            const newProductId = itemToUpdate._id;
            const updatedCartItemId = generateCartItemId(newProductId, newAddOns);

            // Si el nuevo cartItemId es diferente, significa que la combinación ha cambiado.
            // Primero, removemos el viejo.
            const filteredCart = prev.filter((_, index) => index !== itemToUpdateIndex);

            // Luego, intentamos encontrar si la nueva combinación ya existe
            const existingUpdatedItem = filteredCart.find(item => item.cartItemId === updatedCartItemId);

            if (existingUpdatedItem) {
                // Si la nueva combinación existe, incrementamos su cantidad con la cantidad del ítem original
                return filteredCart.map(item =>
                    item.cartItemId === updatedCartItemId
                        ? { ...item, quantity: item.quantity + itemToUpdate.quantity }
                        : item
                );
            } else {
                // Si la nueva combinación no existe, agregamos el ítem actualizado con la cantidad original
                return [...filteredCart, { ...itemToUpdate, addOns: newAddOns, cartItemId: updatedCartItemId }];
            }
        });
    }, [generateCartItemId]);


    const removeFromCart = useCallback((cartItemId: string) => {
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const calculateCartTotal = useCallback(() => {
        return cart.reduce((sum, item) => {
            let itemTotal = item.price * item.quantity;
            if (item.addOns && item.addOns.length > 0) {
                itemTotal += item.addOns.reduce((addOnsSum, addOn) => {
                    return addOnsSum + (addOn.price * addOn.quantity);
                }, 0) * item.quantity;
            }
            return sum + itemTotal;
        }, 0);
    }, [cart]);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, calculateCartTotal, updateCartItemAddOns }}>
            {children}
        </CartContext.Provider>
    );
};