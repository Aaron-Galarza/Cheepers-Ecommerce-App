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
        if (!addOns || addOns.length === 0) {
            return productId;
        }
        
        const sortedAddOns = [...addOns].sort((a, b) => a._id.localeCompare(b._id));
        const addOnParts = sortedAddOns.map(ao => `${ao._id}:${ao.quantity}`).join(',');

        return `${productId}__${addOns.length > 0 ? addOnParts : ''}`;
    }, []);

    const addToCart = useCallback((product: Product, addOns: SelectedAddOn[] = []) => {
        setCart((prevCart) => {
            const newCartItemId = generateCartItemId(product._id, addOns);
            const existingItem = prevCart.find(item => item.cartItemId === newCartItemId);
            
            if (existingItem) {
                return prevCart.map(item =>
                    item.cartItemId === newCartItemId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1, addOns: addOns || [], cartItemId: newCartItemId }];
            }
        });
    }, [generateCartItemId]);

const updateCartItemAddOns = useCallback((oldCartItemId: string, newAddOns: SelectedAddOn[]) => {
    setCart((prevCart) => {
        const itemToUpdate = prevCart.find(item => item.cartItemId === oldCartItemId);
        if (!itemToUpdate) {
            console.warn(`No se encontró el ítem del carrito con ID: ${oldCartItemId}`);
            return prevCart;
        }

        const newCartItemId = generateCartItemId(itemToUpdate._id, newAddOns);
        const itemIndex = prevCart.findIndex(item => item.cartItemId === oldCartItemId);

        // 1. Lógica de FUSIÓN (cuando se eliminan todos los adicionales)
        if (newAddOns.length === 0) {
            const consolidatedItemIndex = prevCart.findIndex(item => 
                item.cartItemId === itemToUpdate._id && 
                (!item.addOns || item.addOns.length === 0) &&
                item.cartItemId !== oldCartItemId
            );
            
            if (consolidatedItemIndex !== -1) {
                const newCart = [...prevCart];
                const consolidatedItem = newCart[consolidatedItemIndex];
                const updatedConsolidatedItem = { 
                    ...consolidatedItem, 
                    quantity: consolidatedItem.quantity + itemToUpdate.quantity 
                };
                
                newCart[consolidatedItemIndex] = updatedConsolidatedItem;
                newCart.splice(itemIndex, 1);
                return newCart;
            } else {
                // Si no hay un ítem consolidado, actualizamos este para que no tenga adicionales
                const newCart = [...prevCart];
                newCart[itemIndex] = { 
                    ...itemToUpdate, 
                    addOns: [], 
                    cartItemId: newCartItemId 
                };
                return newCart;
            }
        }

        // 2. Lógica de DIVISIÓN (cuando se añade a un ítem con cantidad > 1)
        if (itemToUpdate.quantity > 1) {
            const newCart = [...prevCart];
            const updatedOriginalItem = { 
                ...itemToUpdate, 
                quantity: itemToUpdate.quantity - 1, 
                addOns: [], 
                cartItemId: generateCartItemId(itemToUpdate._id) 
            };
            
            const newPersonalizedItem = { 
                ...itemToUpdate, 
                quantity: 1, 
                addOns: newAddOns, 
                cartItemId: newCartItemId 
            };
            
            // Buscar si ya existe un ítem con la misma combinación
            const existingPersonalizedItemIndex = newCart.findIndex(item => 
                item.cartItemId === newCartItemId && 
                item.cartItemId !== oldCartItemId
            );
            
            if (existingPersonalizedItemIndex !== -1) {
                const existingItem = newCart[existingPersonalizedItemIndex];
                newCart[existingPersonalizedItemIndex] = { 
                    ...existingItem, 
                    quantity: existingItem.quantity + 1 
                };
                newCart[itemIndex] = updatedOriginalItem;
            } else {
                newCart[itemIndex] = updatedOriginalItem;
                newCart.splice(itemIndex + 1, 0, newPersonalizedItem);
            }
            
            return newCart;
        }

        // 3. Lógica de ACTUALIZACIÓN (para cualquier otro caso)
        const existingItemIndex = prevCart.findIndex(item => 
            item.cartItemId === newCartItemId && 
            item.cartItemId !== oldCartItemId
        );
        
        if (existingItemIndex !== -1) {
            const newCart = [...prevCart];
            const existingItem = newCart[existingItemIndex];
            newCart[existingItemIndex] = { 
                ...existingItem, 
                quantity: existingItem.quantity + 1 
            };
            newCart.splice(itemIndex, 1);
            return newCart;
        } else {
            // Si no existe, simplemente actualizar el ítem actual en su posición
            const newCart = [...prevCart];
            newCart[itemIndex] = { 
                ...itemToUpdate, 
                addOns: newAddOns, 
                cartItemId: newCartItemId 
            };
            return newCart;
        }
    });
}, [generateCartItemId]);

    const removeFromCart = useCallback((cartItemId: string) => {
        setCart((prevCart) => {
            const itemToRemove = prevCart.find(item => item.cartItemId === cartItemId);
            if (itemToRemove && itemToRemove.quantity > 1) {
                return prevCart.map(item =>
                    item.cartItemId === cartItemId ? { ...item, quantity: item.quantity - 1 } : item
                );
            } else {
                return prevCart.filter(item => item.cartItemId !== cartItemId);
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