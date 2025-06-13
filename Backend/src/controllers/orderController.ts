import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order, { IOrder, IProductItem } from '../models/Pedido';
import Product from '../models/Product';
import User from '../models/User';

interface CreateOrderRequestBody {
  userId: string;
  products: { productId: string; quantity: number }[];
  shippingAddress: { street: string; city: string; postalCode: string };
  paymentMethod: 'cash' | 'card' | 'transfer';
  notes?: string;
}

// **Modificación clave:** Aseguramos que la funci\u00F3n devuelva Promise<void>
// El res.json() y res.status() se consideran que terminan la respuesta,
// por lo que no es necesario el 'undefined' en el Promise.
export const createOrder = async (req: Request<{}, {}, CreateOrderRequestBody>, res: Response): Promise<void> => {
  try {
    const { userId, products, shippingAddress, paymentMethod, notes } = req.body;

    if (!userId || !products || !Array.isArray(products) || products.length === 0 || !shippingAddress || !paymentMethod) {
      res.status(400).json({ message: 'Faltan campos obligatorios para crear el pedido: userId, products, shippingAddress, paymentMethod.' });
      return; // Aseguramos que la funci\u00F3n termine aqu\u00ED
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
        res.status(404).json({ message: 'Usuario no encontrado. El ID de usuario proporcionado no existe.' });
        return; // Aseguramos que la funci\u00F3n termine aqu\u00ED
    }

    let totalAmount = 0;
    const productsForOrder: IProductItem[] = [];

    for (const item of products) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity < 1) {
        res.status(400).json({ message: 'Datos de producto inválidos. Cada ítem debe tener "productId" y "quantity" (mínimo 1).' });
        return; // Aseguramos que la funci\u00F3n termine aqu\u00ED
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404).json({ message: `Producto con ID ${item.productId} no encontrado.` });
        return; // Aseguramos que la funci\u00F3n termine aqu\u00ED
      }

      const price = product.price;
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;

      productsForOrder.push({
        productId: new mongoose.Types.ObjectId(item.productId),
        quantity: item.quantity,
        priceAtOrder: price,
      });
    }

    const newOrder: IOrder = new Order({
      user: new mongoose.Types.ObjectId(userId),
      products: productsForOrder,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      notes: notes || '',
    });

    await newOrder.save();

    res.status(201).json({ message: 'Pedido creado exitosamente!', order: newOrder });

  } catch (error: any) {
    console.error('Error al crear pedido:', error);
    // IMPORTANTE: Cuando usas asyncHandler, no necesitas res.status(500) aqu\u00ED.
    // asyncHandler se encarga de pasar el error al siguiente middleware de error de Express.
    // Simplemente 'throw error;' o deja que el error se propague.
    // Para depurar, puedes mantenerlo por un momento, pero la forma correcta con asyncHandler es re-lanzar o no atraparlo aqu\u00ED.
    // Por ahora, lo dejaremos para ver si el error de tipado se va.
    res.status(500).json({ message: 'Error del servidor.', error: error.message });
  }
};