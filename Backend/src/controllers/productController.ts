// Backend/src/controllers/productController.ts

import { Request, Response } from 'express';
import Product from '../models/Product';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// Si usas autenticación y quieres que solo admins accedan
// Declara la extensión de la interfaz Request para incluir user si es necesario
declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            _id: string;
            isAdmin: boolean;
        };
    }
}

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Public (pero con opción para admin)
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
    const { includeInactive } = req.query;
    let query: any = {};
    if (includeInactive !== 'true') {
        query.isActive = true;
    }
    const products = await Product.find(query);
    res.status(200).json(products);
});

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.status(200).json(product);
    } else {
        res.status(404);
        throw new Error('Producto no encontrado');
    }
});

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    // CAMBIO AQUI: Incluye 'isActive' en la desestructuración
    const { name, description, price, category, imageUrl, isActive } = req.body;

    if (!name || typeof price !== 'number' || price < 0 || !category) {
        res.status(400);
        throw new Error('El nombre del producto, un precio válido y la categoría son requeridos.');
    }

    const newProduct = new Product({ 
        name, 
        description, 
        price, 
        category, 
        imageUrl,
        // CAMBIO AQUI: Asigna isActive. Si no viene en el body, usa el default del modelo.
        isActive: isActive !== undefined ? isActive : true 
    });

    const createdProduct = await newProduct.save();
    res.status(201).json({ message: 'Producto creado exitosamente', product: createdProduct });
});

// @desc    Actualizar un producto existente
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
    // CAMBIO AQUI: Incluye 'isActive' en la desestructuración
    const { name, description, price, category, imageUrl, isActive } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = typeof price === 'number' && price >= 0 ? price : product.price;
        product.category = category || product.category;
        product.imageUrl = imageUrl || product.imageUrl;
        // CAMBIO AQUI: Asigna isActive. Si no viene en el body, usa el valor actual del producto.
        product.isActive = isActive !== undefined ? isActive : product.isActive; 

        const updatedProduct = await product.save();
        res.status(200).json({ message: 'Producto actualizado exitosamente', product: updatedProduct });
    } else {
        res.status(404);
        throw new Error('Producto no encontrado');
    }
});

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } else {
        res.status(404);
        throw new Error('Producto no encontrado');
    }
});

// <--- NUEVA FUNCIÓN: AGREGAR ESTO AL FINAL DEL ARCHIVO ---
// @desc    Toggle (habilitar/deshabilitar) el estado 'isActive' de un producto
// @route   PUT /api/products/:id/toggle-active
// @access  Private/Admin
export const toggleProductActiveStatus = asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        // Invierte el estado actual de isActive
        product.isActive = !product.isActive;

        const updatedProduct = await product.save();
        res.status(200).json({
            message: `Producto ${updatedProduct.isActive ? 'habilitado' : 'deshabilitado'} exitosamente.`,
            product: updatedProduct,
        });
    } else {
        res.status(404);
        throw new Error('Producto no encontrado');
    }
});