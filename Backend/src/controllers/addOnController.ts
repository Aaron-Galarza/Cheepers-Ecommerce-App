import { Request, Response } from 'express';
import AddOn, { IAddOn } from '../models/AddOn'; // Importa el modelo AddOn y su interfaz
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

// @desc    Obtener todos los adicionales
// @route   GET /api/addons
// @access  Public (pero con opción para admin)
export const getAddOns = asyncHandler(async (req: Request, res: Response) => {
    const { includeInactive } = req.query;
    let query: any = {};
    if (includeInactive !== 'true') {
        query.isActive = true;
    }
    const addOns = await AddOn.find(query); // Busca en el modelo AddOn
    res.status(200).json(addOns);
});

// @desc    Obtener un adicional por ID
// @route   GET /api/addons/:id
// @access  Public
export const getAddOnById = asyncHandler(async (req: Request, res: Response) => {
    // Validar si el ID es un ObjectId válido de Mongoose
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('ID de adicional inválido.');
    }

    const addOn = await AddOn.findById(req.params.id); // Busca en el modelo AddOn

    if (addOn) {
        res.status(200).json(addOn);
    } else {
        res.status(404);
        throw new Error('Adicional no encontrado');
    }
});

// @desc    Crear un nuevo adicional
// @route   POST /api/addons
// @access  Private/Admin
export const createAddOn = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, price, category, isActive, associatedProductCategories } = req.body;

    // Validaciones específicas para adicionales
    if (!name || typeof price !== 'number' || price < 0 || !category || !associatedProductCategories || !Array.isArray(associatedProductCategories) || associatedProductCategories.length === 0) {
        res.status(400);
        throw new Error('El nombre, un precio válido, la categoría y al menos una categoría de producto asociada son requeridos.');
    }

    // Opcional: Validar que `associatedProductCategories` contenga valores esperados
    // const validProductCategories = ['Hamburguesas', 'Papas Fritas', 'Pizzas']; // Ajusta esto según tus categorías reales
    // const areCategoriesValid = associatedProductCategories.every((cat: string) => validProductCategories.includes(cat));
    // if (!areCategoriesValid) {
    //     res.status(400);
    //     throw new Error('Una o más categorías de producto asociadas no son válidas.');
    // }

    const newAddOn = new AddOn({ // Crea una nueva instancia del modelo AddOn
        name,
        description,
        price,
        category,
        isActive: isActive !== undefined ? isActive : true, // Asigna isActive, default a true si no se especifica
        associatedProductCategories, // Campo específico de AddOn
    });

    try {
        const createdAddOn = await newAddOn.save();
        res.status(201).json({ message: 'Adicional creado exitosamente', addOn: createdAddOn });
    } catch (error: any) {
        if (error.code === 11000) { // Error de clave duplicada (nombre único)
            res.status(400);
            throw new Error(`Ya existe un adicional con el nombre "${name}".`);
        }
        res.status(500);
        throw new Error(`Error al crear adicional: ${error.message}`);
    }
});

// @desc    Actualizar un adicional existente
// @route   PUT /api/addons/:id
// @access  Private/Admin
export const updateAddOn = asyncHandler(async (req: Request, res: Response) => {
    // Validar si el ID es un ObjectId válido de Mongoose
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('ID de adicional inválido.');
    }

    const { name, description, price, category, isActive, associatedProductCategories } = req.body;

    const addOn = await AddOn.findById(req.params.id); // Busca en el modelo AddOn

    if (addOn) {
        addOn.name = name !== undefined ? name : addOn.name;
        addOn.description = description !== undefined ? description : addOn.description;
        addOn.price = typeof price === 'number' && price >= 0 ? price : addOn.price;
        addOn.category = category !== undefined ? category : addOn.category;
        addOn.isActive = isActive !== undefined ? isActive : addOn.isActive;
        
        // Actualizar associatedProductCategories si se proporciona y es un array válido
        if (associatedProductCategories !== undefined) {
            if (!Array.isArray(associatedProductCategories) || associatedProductCategories.length === 0) {
                res.status(400);
                throw new Error('Las categorías de producto asociadas deben ser un array no vacío.');
            }
            // Opcional: Validar que `associatedProductCategories` contenga valores esperados
            // const validProductCategories = ['Hamburguesas', 'Papas Fritas', 'Pizzas']; // Ajusta esto según tus categorías reales
            // const areCategoriesValid = associatedProductCategories.every((cat: string) => validProductCategories.includes(cat));
            // if (!areCategoriesValid) {
            //     res.status(400);
            //     throw new Error('Una o más categorías de producto asociadas no son válidas.');
            // }
            addOn.associatedProductCategories = associatedProductCategories;
        }

        try {
            const updatedAddOn = await addOn.save();
            res.status(200).json({ message: 'Adicional actualizado exitosamente', addOn: updatedAddOn });
        } catch (error: any) {
            if (error.code === 11000) { // Error de clave duplicada (nombre único)
                res.status(400);
                throw new Error(`Ya existe otro adicional con el nombre "${name}".`);
            }
            res.status(500);
            throw new Error(`Error al actualizar adicional: ${error.message}`);
        }
    } else {
        res.status(404);
        throw new Error('Adicional no encontrado');
    }
});

// @desc    Eliminar un adicional
// @route   DELETE /api/addons/:id
// @access  Private/Admin
export const deleteAddOn = asyncHandler(async (req: Request, res: Response) => {
    // Validar si el ID es un ObjectId válido de Mongoose
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('ID de adicional inválido.');
    }

    const addOn = await AddOn.findById(req.params.id); // Busca en el modelo AddOn

    if (addOn) {
        await addOn.deleteOne();
        res.status(200).json({ message: 'Adicional eliminado exitosamente' });
    } else {
        res.status(404);
        throw new Error('Adicional no encontrado');
    }
});

// @desc    Toggle (habilitar/deshabilitar) el estado 'isActive' de un adicional
// @route   PUT /api/addons/:id/toggle-active
// @access  Private/Admin
export const toggleAddOnActiveStatus = asyncHandler(async (req: Request, res: Response) => {
    // Validar si el ID es un ObjectId válido de Mongoose
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('ID de adicional inválido.');
    }

    const addOn = await AddOn.findById(req.params.id); // Busca en el modelo AddOn

    if (addOn) {
        // Invierte el estado actual de isActive
        addOn.isActive = !addOn.isActive;

        const updatedAddOn = await addOn.save();
        res.status(200).json({
            message: `Adicional ${updatedAddOn.isActive ? 'habilitado' : 'deshabilitado'} exitosamente.`,
            addOn: updatedAddOn,
        });
    } else {
        res.status(404);
        throw new Error('Adicional no encontrado');
    }
});