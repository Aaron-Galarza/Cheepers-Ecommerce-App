// Backend/src/controllers/orderController.ts

import { Request, Response } from 'express';
import mongoose from 'mongoose';
// Aseg\u00FArate de importar IProductItem y Pedido
import Pedido, { IOrder, IProductItem } from '../models/Pedido';
import Product from '../models/Product'; // Asumo que tienes un modelo de Producto
import asyncHandler from 'express-async-handler';

// No necesitamos esto si solo los admins est\u00E1n logueados para ver pedidos
// Si otras rutas en tu backend (no de pedidos) usan req.user, mant\u00E9n esta declaraci\u00F3n
declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            _id: string;
            isAdmin: boolean;
        };
    }
}

interface CreateOrderRequestBody {
    products: { productId: string; quantity: number }[];
    shippingAddress: { street: string; city: string; postalCode: string };
    paymentMethod: 'cash' | 'card' | 'transfer';
    notes?: string;
    guestEmail: string;
    guestPhone: string;
}

// @desc    Crear un nuevo pedido
// @route   POST /api/orders
// @access  Public (solo invitados)
export const createOrder = asyncHandler(async (req: Request<{}, {}, CreateOrderRequestBody>, res: Response) => {
    const { products, shippingAddress, paymentMethod, notes, guestEmail, guestPhone } = req.body;

    if (!products || products.length === 0 || !shippingAddress || !paymentMethod || !guestEmail || !guestPhone) {
        res.status(400);
        throw new Error('Faltan campos obligatorios para crear el pedido: products, shippingAddress, paymentMethod, guestEmail, guestPhone.');
    }

    let totalAmount = 0;
    const productsForOrder: IProductItem[] = []; // Usa IProductItem directamente

    for (const item of products) {
        if (!item.productId || typeof item.quantity !== 'number' || item.quantity < 1) {
            res.status(400);
            throw new Error('Datos de producto invalidos. Cada item debe tener "productId" y "quantity" (minimo 1).');
        }

        const product = await Product.findById(item.productId);
        if (!product) {
            res.status(404);
            throw new Error(`Producto con ID ${item.productId} no encontrado.`);
        }

        const price = product.price;
        totalAmount += price * item.quantity;

        // <--- CRUCIAL: A\u00F1adir name e imageUrl aqu\u00ED, ya que IProductItem los requiere y el esquema los espera ahora.
        productsForOrder.push({
            productId: new mongoose.Types.ObjectId(item.productId),
            name: product.name,      // <--- A\u00D1ADIDO
            imageUrl: product.imageUrl || '', // <--- A\u00D1ADIDO
            quantity: item.quantity,
            priceAtOrder: price,
        });
    }

    const newOrder: IOrder = new Pedido({
        guestEmail: guestEmail,
        guestPhone: guestPhone,
        products: productsForOrder,
        totalAmount: totalAmount,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        notes: notes || '',
        status: 'pending', // <--- USAR 'status' para que coincida con el modelo Pedido.ts
    });

    const createdOrder = await newOrder.save();

    res.status(201).json({ message: 'Pedido creado exitosamente!', order: createdOrder });
});

// @desc    Obtener todos los pedidos (con filtro por estado opcional)
// @route   GET /api/orders?status=pending
// @access  Private/Admin
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;

    let query: any = {};

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (status && typeof status === 'string') {
        const lowerCaseStatus = status.toLowerCase();

        if (validStatuses.includes(lowerCaseStatus)) {
            query.status = lowerCaseStatus; // <--- USAR 'status' para que coincida con el modelo Pedido.ts
        } else {
            res.status(400);
            throw new Error(`Estado de pedido inv\u00E1lido: "${status}". Los estados permitidos son: ${validStatuses.join(', ')}.`);
        }
    }

    const orders = await Pedido.find(query);
    res.status(200).json(orders);
});

// @desc    Obtener un pedido por ID
// @route   GET /api/orders/:id
// @access  Private (solo un admin puede verlo)
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const order = await Pedido.findById(req.params.id);

    if (order) {
        res.status(200).json(order);
    } else {
        res.status(404);
        throw new Error('Pedido no encontrado');
    }
});

// @desc    Actualizar el estado de un pedido
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body; // Esperamos un campo 'status' en el body

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
        res.status(400);
        throw new Error(`Estado de pedido inv\u00E1lido: "${status}". Los estados permitidos son: ${validStatuses.join(', ')}.`);
    }

    const order = await Pedido.findById(req.params.id);

    if (order) {
        order.status = status; // <--- USAR 'status' para que coincida con el modelo Pedido.ts
        const updatedOrder = await order.save();
        res.status(200).json({ message: 'Estado del pedido actualizado exitosamente', order: updatedOrder });
    } else {
        res.status(404);
        throw new Error('Pedido no encontrado');
    }
});

// ELIMINAR ESTA FUNCI\u00D3N DE TU ARCHIVO
// export const getMyOrders = ...;