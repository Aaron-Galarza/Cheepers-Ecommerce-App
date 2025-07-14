// Backend/src/controllers/orderController.ts

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Pedido, { IOrder, IProductItem, IShippingAddress } from '../models/Pedido'; // Usar IOrderItem en lugar de IProductItem para consistencia
import Product from '../models/Product'; // Asumo que tienes un modelo de Producto
import asyncHandler from 'express-async-handler';

// No necesitamos esto si solo los admins están logueados para ver pedidos
// Si otras rutas en tu backend (no de pedidos) usan req.user, mantén esta declaración
declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            _id: string;
            isAdmin: boolean;
        };
    }
}

// Nueva interfaz para el cuerpo de la solicitud de creación de pedido
// - 'products' ahora espera un array con solo productId y quantity del frontend.
// - 'shippingAddress' es opcional.
// - 'deliveryType' es nuevo y obligatorio.
interface CreateOrderRequestBody {
    products: { productId: string; quantity: number }[];
    guestEmail: string;
    guestPhone: string;
    paymentMethod: 'cash' | 'card' | 'transfer';
    deliveryType: 'delivery' | 'pickup'; // <--- Añadido y obligatorio
    shippingAddress?: { street: string; city: string }; // <--- Modificado: 'postalCode' quitado, es opcional
    notes?: string;
}

// @desc      Crear un nuevo pedido
// @route     POST /api/orders
// @access    Public (solo invitados)
export const createOrder = asyncHandler(async (req: Request<{}, {}, CreateOrderRequestBody>, res: Response) => {
    // Desestructuramos el body, incluyendo el nuevo 'deliveryType'
    const { products, shippingAddress, paymentMethod, notes, guestEmail, guestPhone, deliveryType } = req.body;

    // 1. Validaciones básicas iniciales
    if (!products || products.length === 0 || !paymentMethod || !guestEmail || !guestPhone || !deliveryType) {
        res.status(400);
        throw new Error('Faltan campos obligatorios para crear el pedido: productos, método de pago, email, teléfono, y tipo de entrega.');
    }

    // 2. Validar el tipo de entrega y la dirección de envío condicionalmente
    let finalShippingAddress: IShippingAddress | undefined = undefined; // Usamos IShippingAddress desde el modelo

    if (deliveryType === 'delivery') {
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
            res.status(400);
            throw new Error('Para el envío a domicilio, la calle y la ciudad son obligatorias.');
        }
        // Opcional: Asegurarse de que la ciudad sea "Resistencia" si quieres forzarlo en el backend
        // (Aunque el modelo ya tiene un default, es buena práctica validar si quieres ser estricto)
        // if (shippingAddress.city.toLowerCase() !== 'resistencia') {
        //    res.status(400);
        //    throw new Error('Actualmente solo realizamos envíos en Resistencia.');
        // }
        finalShippingAddress = {
            street: shippingAddress.street,
            city: shippingAddress.city || 'Resistencia', // Utiliza el valor enviado o 'Resistencia'
        };
    } else if (deliveryType === 'pickup') {
        // Si es retiro en sucursal, nos aseguramos de que no se procese información de dirección si se envía
        if (shippingAddress && (shippingAddress.street || shippingAddress.city)) {
            console.warn('Advertencia: Se recibió información de dirección para un pedido de retiro en sucursal. Se ignorará.');
            // No asignamos finalShippingAddress, que se mantendrá undefined
        }
    } else {
        res.status(400);
        throw new Error('Tipo de entrega inválido. Debe ser "delivery" o "pickup".');
    }

    let totalAmount = 0;
    // Usamos IOrderItem aquí para que coincida con la interfaz del modelo
    const productsForOrder: IProductItem[] = []; 

    for (const item of products) {
        if (!item.productId || typeof item.quantity !== 'number' || item.quantity < 1) {
            res.status(400);
            throw new Error('Datos de producto inválidos. Cada ítem debe tener "productId" y "quantity" (mínimo 1).');
        }

        const product = await Product.findById(item.productId);
        if (!product) {
            res.status(404);
            throw new Error(`Producto con ID ${item.productId} no encontrado.`);
        }

        const price = product.price; // Asumo que `product.price` es el precio actual
        totalAmount += price * item.quantity;

        // CRUCIAL: Añadir name, imageUrl y priceAtOrder (usando el precio actual del producto)
        productsForOrder.push({
            productId: new mongoose.Types.ObjectId(item.productId),
            name: product.name,
            imageUrl: product.imageUrl || '', // Asegúrate de que tu modelo Product tenga imageUrl y sea string
            quantity: item.quantity,
            priceAtOrder: price, // Usamos el precio del producto al momento del pedido
        });
    }

    // 3. Crear el nuevo pedido, pasando el 'deliveryType' y la 'shippingAddress' condicional
    const newOrder: IOrder = new Pedido({
        guestEmail: guestEmail,
        guestPhone: guestPhone,
        products: productsForOrder,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        deliveryType: deliveryType, // <--- Nuevo campo
        shippingAddress: finalShippingAddress, // <--- Condicional y preparado
        notes: notes || '',
        status: 'pending', // Asegúrate de que coincida con el enum de tu modelo
    });

    const createdOrder = await newOrder.save();

    res.status(201).json({ message: 'Pedido creado exitosamente!', order: createdOrder });
});

// @desc      Obtener todos los pedidos (con filtro por estado opcional)
// @route     GET /api/orders?status=pending
// @access    Private/Admin
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;

    let query: any = {};

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (status && typeof status === 'string') {
        const lowerCaseStatus = status.toLowerCase();

        if (validStatuses.includes(lowerCaseStatus)) {
            query.status = lowerCaseStatus;
        } else {
            res.status(400);
            throw new Error(`Estado de pedido inválido: "${status}". Los estados permitidos son: ${validStatuses.join(', ')}.`);
        }
    }

    const orders = await Pedido.find(query);
    res.status(200).json(orders);
});

// @desc      Obtener un pedido por ID
// @route     GET /api/orders/:id
// @access    Private (solo un admin puede verlo)
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const order = await Pedido.findById(req.params.id);

    if (order) {
        res.status(200).json(order);
    } else {
        res.status(404);
        throw new Error('Pedido no encontrado');
    }
});

// @desc      Actualizar el estado de un pedido
// @route     PUT /api/orders/:id/status
// @access    Private/Admin
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body; // Esperamos un campo 'status' en el body

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
        res.status(400);
        throw new Error(`Estado de pedido inválido: "${status}". Los estados permitidos son: ${validStatuses.join(', ')}.`);
    }

    const order = await Pedido.findById(req.params.id);

    if (order) {
        order.status = status;
        const updatedOrder = await order.save();
        res.status(200).json({ message: 'Estado del pedido actualizado exitosamente', order: updatedOrder });
    } else {
        res.status(404);
        throw new Error('Pedido no encontrado');
    }
});