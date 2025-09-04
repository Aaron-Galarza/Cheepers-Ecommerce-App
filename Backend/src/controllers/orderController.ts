// Backend/src/controllers/orderController.ts

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Pedido, { IOrder, IProductItem, ISelectedAddOn, IShippingAddress } from '../models/Pedido';
import AddOn, { IAddOn } from '../models/AddOn'; 
import Product, { IProduct } from '../models/Product';
import asyncHandler from 'express-async-handler';
import { isStoreOpen } from '../utils/schedule'; // <-- IMPORTA EL ESTADO


// Definición de tipos para la interfaz de solicitud
declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            _id: string;
            isAdmin: boolean;
            isOwner: boolean;
        };
    }
}

interface CreateOrderRequestBody {
    products: {
        productId: string;
        quantity: number;
        addOns?: { addOnId: string; quantity: number }[];
    }[];
    guestEmail: string;
    guestPhone: string;
    guestName: string;
    paymentMethod: 'cash' | 'card' | 'transfer';
    deliveryType: 'delivery' | 'pickup';
    shippingAddress?: { street: string; city: string };
    notes?: string;
}

// @desc      Crear un nuevo pedido
// @route     POST /api/orders
// @access    Public (solo invitados)
export const createOrder = asyncHandler(async (req: Request<{}, {}, CreateOrderRequestBody>, res: Response) => {
      // --- VERIFICACIÓN DE HORARIOS ---
  if (!isStoreOpen) {
    res.status(400);
    throw new Error('Lo sentimos, estamos fuera del horario de atención. Vuelva más tarde.');
  }
    
    const { products, shippingAddress, paymentMethod, notes, guestEmail, guestName, guestPhone, deliveryType } = req.body;

    // 1. Validaciones básicas iniciales
    if (!products || products.length === 0 || !paymentMethod || !guestEmail || !guestPhone || !guestName || !deliveryType) {
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
    let discountableAmount = 0;
    const productsForOrder: IProductItem[] = [];

    // --- CAMBIO DE OPTIMIZACIÓN: CONSULTAS FUERA DEL BUCLE ---
    const productIds = products.map(p => p.productId);
    const addOnIds = products.flatMap(p => p.addOns ? p.addOns.map(a => a.addOnId) : []);

    const productDocuments = await Product.find({ _id: { $in: productIds } }).lean();
    const addOnDocuments = await AddOn.find({ _id: { $in: addOnIds } }).lean();

    for (const item of products) {
        const product = productDocuments.find(p => p._id.toString() === item.productId);
        if (!product) {
            res.status(404);
            throw new Error(`Producto con ID ${item.productId} no encontrado.`);
        }
        if (product.isActive === false) {
            res.status(400);
            throw new Error(`El producto "${product.name}" (ID: ${item.productId}) no está disponible para la venta actualmente.`);
        }

        let itemPrice = product.price;
        const selectedAddOnsForProduct: ISelectedAddOn[] = [];

        if (item.addOns && item.addOns.length > 0) {
            for (const addOnRequest of item.addOns) {
                const addOn = addOnDocuments.find(a => a._id.toString() === addOnRequest.addOnId);
                if (!addOn || addOn.isActive === false) {
                    res.status(400);
                    throw new Error(`Adicional con ID ${addOnRequest.addOnId} no está disponible o no existe.`);
                }

                itemPrice += addOn.price * addOnRequest.quantity;

                selectedAddOnsForProduct.push({
                    addOnId: new mongoose.Types.ObjectId(addOn._id.toString()),
                    name: addOn.name,
                    quantity: addOnRequest.quantity,
                    priceAtOrder: addOn.price,
                });
            }
        }

        const itemTotal = itemPrice * item.quantity;
        totalAmount += itemTotal;

        // Lógica de descuento, exactamente como la propusiste
        const isDiscountable = !['Promos', 'Promos Solo en Efectivo'].includes(product.category);
        if (isDiscountable) {
            discountableAmount += itemTotal;
        }

        productsForOrder.push({
            productId: new mongoose.Types.ObjectId(product._id.toString()),
            name: product.name,
            imageUrl: product.imageUrl || '',
            quantity: item.quantity,
            priceAtOrder: product.price,
            addOns: selectedAddOnsForProduct,
        });
    }

    // Calcular el descuento final y el total
    const discount = paymentMethod === 'cash' ? discountableAmount * 0.10 : 0;
    const finalTotalAmount = totalAmount - discount;

    // 3. Crear el nuevo pedido
    const newOrder: IOrder = new Pedido({
        guestEmail: guestEmail,
        guestPhone: guestPhone,
        guestName: guestName,
        products: productsForOrder,
        totalAmount: finalTotalAmount,
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

// @desc      Actualizar el paymentMethod de un pedido
// @route     PUT /api/orders/:id/paymentMethod
// @access    Private/Admin
export const updateOrderPaymentMethod = asyncHandler(async (req: Request, res: Response) => {
    const { paymentMethod } = req.body; // Esperamos un campo 'paymentMethod' en el body

    const validpaymentMethod = ['cash', 'card', 'transfer'];
    if (!paymentMethod || !validpaymentMethod.includes(paymentMethod)) {
        res.status(400);
        throw new Error(`El Metodo de Pago del pedido es inválido: "${paymentMethod}". Los estados permitidos son: ${validpaymentMethod.join(', ')}.`);
    }

    const order = await Pedido.findById(req.params.id);

    // --- CORRECCIÓN CLAVE ---
    // Primero, verifica si el pedido existe. Si no, lanza el error y termina la ejecución.
    if (!order) {
        res.status(404);
        throw new Error('Pedido no encontrado');
    }

    // Si llegamos a este punto, 'order' no es null.
    // Ahora puedes acceder a sus propiedades de forma segura.

    // Recalcular el precio total del pedido sin el descuento
    let newTotalAmount = 0;
    
    // Iterar sobre los productos del pedido para recalcular el total
    for (const item of order.products) {
        let itemPrice = item.priceAtOrder;

        if (item.addOns && item.addOns.length > 0) {
            for (const addOn of item.addOns) {
                itemPrice += addOn.priceAtOrder * addOn.quantity;
            }
        }
        newTotalAmount += itemPrice * item.quantity;
    }

    // Actualizar el pedido
    order.totalAmount = newTotalAmount; // Asignar el nuevo total sin descuento
    order.paymentMethod = paymentMethod;

    const updatedOrder = await order.save();
    
    res.status(200).json({ 
        message: 'El Metodo de Pago del pedido actualizado exitosamente', 
        order: updatedOrder 
    });
});

// @desc      Eliminar todos los pedidos
// @route     DELETE /api/orders/all
// @access    Private/Admin
export const deleteAllOrders = asyncHandler(async (req: Request, res: Response) => {
    const result = await Pedido.deleteMany({});
    res.status(200).json({ 
        message: `Se eliminaron ${result.deletedCount} pedidos del historial.` 
    });
});