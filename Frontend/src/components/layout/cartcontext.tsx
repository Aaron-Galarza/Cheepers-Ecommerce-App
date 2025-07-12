import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from './productlist'; // Asegúrate de que esta ruta sea correcta

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const MAX_QUANTITY = 10; // Define el límite máximo de cantidad por producto
      const exists = prev.find(x => x._id === product._id);

      if (exists) {
        // Si el producto ya existe, verifica si agregar uno más excede el límite
        if (exists.quantity >= MAX_QUANTITY) {
          console.warn(`No se puede agregar más de ${MAX_QUANTITY} unidades de ${product.name}.`);
          // Opcional: podrías mostrar un toast o un mensaje al usuario aquí
          return prev; // Retorna el estado anterior sin cambios
        }
        return prev.map(x =>
          x._id === product._id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(x => x._id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
