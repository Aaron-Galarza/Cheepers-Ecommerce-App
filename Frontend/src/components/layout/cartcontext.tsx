import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from './productlist';

interface CartItem extends Product { quantity: number; }

interface CartContextType {
  cart: CartItem[];
  addToCart: (p: Product) => void;
  removeFromCart: (id:  string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType|undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(x => x._id === product._id);
      if (exists) {
        return prev.map(x =>
          x._id === product._id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  const removeFromCart = (id: string) =>
    setCart(prev => prev.filter(x => x._id !== x._id));
  const clearCart = () => setCart([]);
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
