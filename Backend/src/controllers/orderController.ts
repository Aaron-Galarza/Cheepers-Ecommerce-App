// Backend/src/controllers/orderController.ts

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Pedido, { IOrder, IProductItem, ISelectedAddOn, IShippingAddress } from '../models/Pedido';
import AddOn, { IAddOn } from '../models/AddOn'; // ADICIÓN: Importa el modelo AddOn
// <--- CAMBIO IMPORTANTE AQUÍ: Importa 'IProduct' de tu modelo 'Product'
import Product, { IProduct } from '../models/Product';
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

// Nueva interfaz para el cuerpo de la solicitud de creación de pedido (MODIFICADO)
interface CreateOrderRequestBody {
    products: {
        productId: string;
        quantity: number;
        addOns?: { addOnId: string; quantity: number }[]; // ADICIÓN: Espera array de addOns
    }[];
    guestEmail: string;
    guestPhone: string;
    paymentMethod: 'cash' | 'card' | 'transfer';
    deliveryType: 'delivery' | 'pickup';
    shippingAddress?: { street: string; city: string };
    notes?: string;
}

// @desc      Crear un nuevo pedido
// @route     POST /api/orders
// @access    Public (solo invitados)
export const createOrder = asyncHandler(async (req: Request<{}, {}, CreateOrderRequestBody>, res: Response) => {
    const { products, shippingAddress, paymentMethod, notes, guestEmail, guestPhone, deliveryType } = req.body;

    // 1. Validaciones básicas iniciales
    if (!products || products.length === 0 || !paymentMethod || !guestEmail || !guestPhone || !deliveryType) {
        res.status(400);
        throw new Error('Faltan campos obligatorios para crear el pedido: productos, método de pago, email, teléfono, y tipo de entrega.');
    }

    // 2. Validar el tipo de entrega y la dirección de envío condicionalmente
    let finalShippingAddress: IShippingAddress | undefined = undefined;

    if (deliveryType === 'delivery') {
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
            res.status(400);
            throw new Error('Para el envío a domicilio, la calle y la ciudad son obligatorias.');
        }
        finalShippingAddress = {
            street: shippingAddress.street,
            city: shippingAddress.city || 'Resistencia',
        };
    } else if (deliveryType === 'pickup') {
        if (shippingAddress && (shippingAddress.street || shippingAddress.city)) {
            console.warn('Advertencia: Se recibió información de dirección para un pedido de retiro en sucursal. Se ignorará.');
        }
    } else {
        res.status(400);
        throw new Error('Tipo de entrega inválido. Debe ser "delivery" o "pickup".');
    }

    let totalAmount = 0;
    const productsForOrder: IProductItem[] = []; 

    for (const item of products) {
        if (!item.productId || typeof item.quantity !== 'number' || item.quantity < 1) {
            res.status(400);
            throw new Error('Datos de producto inválidos. Cada ítem debe tener "productId" y "quantity" (mínimo 1).');
        }

        // <--- CAMBIO AQUÍ: Tipa 'product' con 'IProduct' para que TypeScript sepa que tiene 'isActive'
        const product: IProduct | null = await Product.findById(item.productId);
        if (!product) {
            res.status(404);
            throw new Error(`Producto con ID ${item.productId} no encontrado.`);
        }

        // <--- CAMBIO CLAVE AQUÍ: AÑADE LA VALIDACIÓN DE 'isActive'
        if (!product.isActive) {
            res.status(400);
            throw new Error(`El producto "${product.name}" (ID: ${item.productId}) no está disponible para la venta actualmente.`);
        }
        // No se necesita lógica de stock, solo esta validación de isActive

let itemPrice = product.price; // Precio base del producto

        const selectedAddOnsForProduct: ISelectedAddOn[] = [];

        // ADICIÓN: Procesar los adicionales si existen
        if (item.addOns && item.addOns.length > 0) {
            for (const addOnRequest of item.addOns) {
                if (!addOnRequest.addOnId || typeof addOnRequest.quantity !== 'number' || addOnRequest.quantity < 1) {
                    res.status(400);
                    throw new Error('Datos de adicional inválidos. Cada adicional debe tener "addOnId" y "quantity" (mínimo 1).');
                }

                const addOn: IAddOn | null = await AddOn.findById(addOnRequest.addOnId);
                if (!addOn) {
                    res.status(404);
                    throw new Error(`Adicional con ID ${addOnRequest.addOnId} no encontrado.`);
                }

                if (!addOn.isActive) {
                    res.status(400);
                    throw new Error(`El adicional "${addOn.name}" (ID: ${addOnRequest.addOnId}) no está disponible actualmente.`);
                }

                // Sumar el precio del adicional al total del ítem
                itemPrice += addOn.price * addOnRequest.quantity;

                selectedAddOnsForProduct.push({
                    addOnId: new mongoose.Types.ObjectId(addOnRequest.addOnId),
                    name: addOn.name,
                    quantity: addOnRequest.quantity,
                    priceAtOrder: addOn.price, // Guardamos el precio del adicional en el momento del pedido
                });
            }
        }

        // El totalAmount acumula el precio total de cada item (base + adicionales) multiplicado por su cantidad principal
        totalAmount += itemPrice * item.quantity;

        productsForOrder.push({
            productId: new mongoose.Types.ObjectId(item.productId),
            name: product.name,
            imageUrl: product.imageUrl || '',
            quantity: item.quantity,
            priceAtOrder: product.price, // Esto es el precio BASE del producto, no su subtotal con adicionales
            addOns: selectedAddOnsForProduct, // ADICIÓN: Añadimos los adicionales procesados
        });
    }

    // 3. Crear el nuevo pedido, pasando el 'deliveryType' y la 'shippingAddress' condicional
    const newOrder: IOrder = new Pedido({
        guestEmail: guestEmail,
        guestPhone: guestPhone,
        products: productsForOrder,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        deliveryType: deliveryType,
        shippingAddress: finalShippingAddress,
        notes: notes || '',
        status: 'pending',
    });

    const createdOrder = await newOrder.save();

    res.status(201).json({ message: 'Pedido creado exitosamente!', order: createdOrder });
});

// @desc      Obtener todos los pedidos (con filtro por estado opcional)
// @route     GET /api/orders?status=pending
// @access    Private/Admin
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

// @desc      Obtener un pedido por ID
// @route     GET /api/orders/:id
// @access    Private (solo un admin puede verlo)
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const order = await Pedido.findById(req.params.id);

    if (order) {
        res.status(200).json(order);
    } else {
        res.status(404);
        throw new Error('Pedido no encontrado');
    }
});

// @desc      Actualizar el estado de un pedido
// @route     PUT /api/orders/:id/status
// @access    Private/Admin
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