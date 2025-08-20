import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Product, SelectedAddOn, CartItem } from './productlist'; 

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

    const generateCartItemId = useCallback((productId: string, addOns: SelectedAddOn[] = []): string => {
        if (addOns.length === 0) {
            return productId;
        }
        const addOnParts = addOns
            .map(ao => `${ao._id}_${ao.quantity}`)
            .sort()
            .join('-');
        return `${productId}__${addOns.length > 0 ? addOnParts : ''}`;
    }, []);

    const addToCart = useCallback((product: Product, addOns: SelectedAddOn[] = []) => {
        setCart((prev: CartItem[]) => {
            const newCartItemId = generateCartItemId(product._id, addOns);
            const existingCartItem = prev.find((item: CartItem) => item.cartItemId === newCartItemId);
            
            if (existingCartItem) {
                return prev.map((item: CartItem) =>
                    item.cartItemId === newCartItemId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prev, { ...product, quantity: 1, addOns: addOns || [], cartItemId: newCartItemId }];
            }
        });
    }, [generateCartItemId]);

    const updateCartItemAddOns = useCallback((oldCartItemId: string, newAddOns: SelectedAddOn[]) => {
        setCart((prev: CartItem[]) => {
            const itemToUpdate = prev.find(item => item.cartItemId === oldCartItemId);

            if (!itemToUpdate) {
                console.warn(`No se encontró el ítem del carrito con ID: ${oldCartItemId}`);
                return prev;
            }

            // Si el ítem ya está personalizado (tiene adicionales), simplemente actualiza
            if (itemToUpdate.addOns && itemToUpdate.addOns.length > 0) {
                const updatedItem = {
                    ...itemToUpdate,
                    addOns: newAddOns,
                    cartItemId: generateCartItemId(itemToUpdate._id, newAddOns) // Actualiza el ID si cambian los adicionales
                };
                return prev.map(item => item.cartItemId === oldCartItemId ? updatedItem : item);
            }
            
            // Si el ítem es el genérico y se le está agregando un adicional,
            // necesitamos dividirlo si la cantidad es mayor a 1
            if (itemToUpdate.quantity > 1) {
                // 1. Decrementar la cantidad del ítem original
                const updatedOriginalItem = { ...itemToUpdate, quantity: itemToUpdate.quantity - 1 };
                
                // 2. Crear un nuevo ítem para la unidad personalizada
                const newPersonalizedItem = {
                    ...itemToUpdate,
                    quantity: 1,
                    addOns: newAddOns,
                    cartItemId: generateCartItemId(itemToUpdate._id, newAddOns)
                };
                
                // 3. Reemplazar y añadir en el carrito
                const otherItems = prev.filter(item => item.cartItemId !== oldCartItemId);
                return [...otherItems, updatedOriginalItem, newPersonalizedItem];
            } else {
                // Si la cantidad es 1, simplemente actualiza el ítem
                const updatedItem = { ...itemToUpdate, addOns: newAddOns, cartItemId: generateCartItemId(itemToUpdate._id, newAddOns) };
                return prev.map(item => item.cartItemId === oldCartItemId ? updatedItem : item);
            }
        });
    }, [generateCartItemId]);

    const removeFromCart = useCallback((cartItemId: string) => {
        setCart((prev: CartItem[]) => {
            const itemToRemove = prev.find((item: CartItem) => item.cartItemId === cartItemId);
            if (itemToRemove && itemToRemove.quantity > 1) {
                return prev.map((item: CartItem) =>
                    item.cartItemId === cartItemId ? { ...item, quantity: item.quantity - 1 } : item
                );
            } else {
                return prev.filter((item: CartItem) => item.cartItemId !== cartItemId);
            }
        });
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const calculateCartTotal = useCallback(() => {
        return cart.reduce((sum, item) => {
            let itemTotal = item.price;
            if (item.addOns && item.addOns.length > 0) {
                itemTotal += item.addOns.reduce((addOnsSum, addOn) => {
                    return addOnsSum + (addOn.price * addOn.quantity);
                }, 0);
            }
            return sum + (itemTotal * item.quantity);
        }, 0);
    }, [cart]);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, calculateCartTotal, updateCartItemAddOns }}>
            {children}
        </CartContext.Provider>
    );
};