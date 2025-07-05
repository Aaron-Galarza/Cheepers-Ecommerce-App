// Backend/src/controllers/productController.ts

import { Request, Response } from 'express';
import Product from '../models/Product';
import asyncHandler from 'express-async-handler'; // Importa asyncHandler para manejar errores asincronos

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await Product.find();
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
        throw new Error('Producto no encontrado'); // asyncHandler capturara este error
    }
});

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, price, category, imageUrl } = req.body;

    if (!name || typeof price !== 'number' || price < 0 || !category) {
        res.status(400); // Bad Request
        throw new Error('El nombre del producto, un precio v\u00E1lido y la categor\u00EDa son requeridos.');
    }

    const newProduct = new Product({ name, description, price, category, imageUrl });
    const createdProduct = await newProduct.save();
    res.status(201).json({ message: 'Producto creado exitosamente', product: createdProduct });
});

// @desc    Actualizar un producto existente
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, price, category, imageUrl } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = typeof price === 'number' && price >= 0 ? price : product.price;
        product.category = category || product.category;
        product.imageUrl = imageUrl || product.imageUrl;

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
        await product.deleteOne(); // Mongoose 6+ usa deleteOne(), versiones anteriores remove()
        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } else {
        res.status(404);
        throw new Error('Producto no encontrado');
    }
});