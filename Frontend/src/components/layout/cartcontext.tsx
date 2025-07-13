// C:\Users\Usuario\Desktop\Aaron\Cheepers-Ecommerce-App\Frontend\src\components\layout\cartcontext.tsx

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'; // <--- Añade useCallback aquí
import { Product } from './productlist';

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

  // Memoiza addToCart
  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const MAX_QUANTITY = 10;
      const exists = prev.find(x => x._id === product._id);

      if (exists) {
        if (exists.quantity >= MAX_QUANTITY) {
          console.warn(`No se puede agregar más de ${MAX_QUANTITY} unidades de ${product.name}.`);
          return prev;
        }
        return prev.map(x =>
          x._id === product._id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []); // Dependencias vacías porque `setCart` es garantizado estable por React

  // Memoiza removeFromCart
  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(x => x._id !== id));
  }, []); // Dependencias vacías porque `setCart` es estable

  // Memoiza clearCart (¡ESTA ES LA CLAVE PARA EL ERROR!)
  const clearCart = useCallback(() => {
    setCart([]);
  }, []); // Dependencias vacías porque `setCart` es estable

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};