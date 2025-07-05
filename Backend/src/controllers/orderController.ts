// Backend/src/controllers/orderController.ts

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order, { IOrder, IProductItem } from '../models/Pedido'; // Aseg\u00FArate que el modelo es 'Pedido'
import Product from '../models/Product';
import User from '../models/User';
import asyncHandler from 'express-async-handler'; // Importa asyncHandler

interface CreateOrderRequestBody {
    userId: string;
    products: { productId: string; quantity: number }[];
    shippingAddress: { street: string; city: string; postalCode: string };
    paymentMethod: 'cash' | 'card' | 'transfer';
    notes?: string;
}

// @desc    Crear un nuevo pedido
// @route   POST /api/orders
// @access  Private (solo usuarios autenticados)
export const createOrder = asyncHandler(async (req: Request<{}, {}, CreateOrderRequestBody>, res: Response) => {
    // Cuando el usuario est\u00E1 logueado con 'protect' middleware, su ID est\u00E1 en req.user._id
    // No necesitamos que el frontend env\u00EDe userId, lo obtenemos del token
    const userIdFromToken = req.user?._id; // req.user viene del middleware 'protect'

    const { products, shippingAddress, paymentMethod, notes } = req.body;

    // Validaci\u00F3n b\u00E1sica de campos obligatorios
    if (!userIdFromToken || !products || !Array.isArray(products) || products.length === 0 || !shippingAddress || !paymentMethod) {
        res.status(400); // Bad Request
        throw new Error('Faltan campos obligatorios para crear el pedido: products, shippingAddress, paymentMethod. O usuario no autenticado.');
    }

    // Opcional: Podr\u00EDas buscar el usuario si necesitas m\u00E1s datos de \u00E9l,
    // pero con el ID del token suele ser suficiente para el pedido.
    // const existingUser = await User.findById(userIdFromToken);
    // if (!existingUser) {
    //     res.status(404);
    //     throw new Error('Usuario no encontrado. El ID de usuario proporcionado no existe.');
    // }

    let totalAmount = 0;
    const productsForOrder: IProductItem[] = [];

    for (const item of products) {
        // Validaci\u00F3n de cada item de producto
        if (!item.productId || typeof item.quantity !== 'number' || item.quantity < 1) {
            res.status(400);
            throw new Error('Datos de producto inv\u00E1lidos. Cada \u00EDtem debe tener "productId" y "quantity" (m\u00EDnimo 1).');
        }

        // Buscar producto y verificar existencia
        const product = await Product.findById(item.productId);
        if (!product) {
            res.status(404);
            throw new Error(`Producto con ID ${item.productId} no encontrado.`);
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
        user: new mongoose.Types.ObjectId(userIdFromToken as string), // Usamos el ID del usuario autenticado
        products: productsForOrder,
        totalAmount: totalAmount,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        notes: notes || '',
        orderStatus: 'pending', // Estado inicial del pedido
        // paymentStatus: 'pending' // Puedes a\u00F1adir un campo para el estado del pago si lo necesitas
    });

    const createdOrder = await newOrder.save();

    res.status(201).json({ message: 'Pedido creado exitosamente!', order: createdOrder });
});


// @desc    Obtener todos los pedidos (con filtro por estado opcional)
// @route   GET /api/orders?status=pending
// @access  Private/Admin
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
    // Extrae el par\u00E1metro de consulta 'status' de la URL
    // Ejemplo: /api/orders?status=pending
    const { status } = req.query;

    let query: any = {}; // Objeto que construiremos para la consulta a Mongoose

    // Lista de estados v\u00E1lidos (debe coincidir con los definidos en tu modelo Pedido.ts)
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    // Verifica si se proporcion\u00F3 un estado y si es v\u00E1lido
    if (status && typeof status === 'string') {
        const lowerCaseStatus = status.toLowerCase(); // Convertir a min\u00FAsculas para hacer la comparaci\u00F3n insensible a may\u00FAsculas

        if (validStatuses.includes(lowerCaseStatus)) {
            query.status = lowerCaseStatus; // A\u00F1ade el filtro de estado al objeto de consulta
        } else {
            // Si el estado proporcionado no es v\u00E1lido, env\u00EDa un error 400
            res.status(400); // Bad Request
            throw new Error(`Estado de pedido inv\u00E1lido: "${status}". Los estados permitidos son: ${validStatuses.join(', ')}.`);
        }
    }

    // Encuentra los pedidos bas\u00E1ndose en el objeto de consulta (que puede estar vac\u00EDo si no hay filtro)
    // Popula el campo 'user' para obtener informaci\u00F3n b\u00E1sica del usuario que hizo el pedido
    const orders = await Order.find(query).populate('user', 'username email');
    res.status(200).json(orders);
});

// @desc    Obtener un pedido por ID
// @route   GET /api/orders/:id
// @access  Private (el usuario debe ser el due\u00F1o del pedido o un admin)
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate('user', 'username email');

    if (order) {
        // L\u00F3gica de autorizaci\u00F3n: solo el due\u00F1o del pedido o un administrador pueden verlo
        if (req.user && (order.user.toString() === req.user._id.toString() || req.user.isAdmin)) {
            res.status(200).json(order);
        } else {
            res.status(403); // Prohibido
            throw new Error('No tienes permiso para ver este pedido');
        }
    } else {
        res.status(404);
        throw new Error('Pedido no encontrado');
    }
});

// @desc    Actualizar el estado de un pedido
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body; // Esperamos un campo 'orderStatus' en el body

    const order = await Order.findById(req.params.id);

    if (order) {
        // Asegurarse de que el nuevo estado sea v\u00E1lido seg\u00FAn tus reglas de negocio (ej. 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
        // Puedes a\u00F1adir una validaci\u00F3n m\u00E1s estricta aqu\u00ED
        order.status = status || order.status;

        const updatedOrder = await order.save();
        res.status(200).json({ message: 'Estado del pedido actualizado exitosamente', order: updatedOrder });
    } else {
        res.status(404);
        throw new Error('Pedido no encontrado');
    }
});

// @desc    Obtener los pedidos de un usuario espec\u00EDfico
// @route   GET /api/orders/myorders
// @access  Private (solo el usuario puede ver sus propios pedidos)
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
    // El ID del usuario viene del token
    const userIdFromToken = req.user?._id;

    if (!userIdFromToken) {
        res.status(401);
        throw new Error('Usuario no autenticado para ver sus pedidos');
    }

    const orders = await Order.find({ user: userIdFromToken }).populate('user', 'username email');

    res.status(200).json(orders);
});