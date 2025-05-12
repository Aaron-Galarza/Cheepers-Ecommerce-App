import { Request, Response } from 'express';
import Product from '../models/Product'; // Importamos el modelo de Producto

// @desc    Obtener todos los productos
// @route   GET /api/productos
// @access  Public
const getProducts = async (req: Request, res: Response) => {
  try {
    // Usamos el método find() del modelo Product para obtener todos los documentos
    // .find({}) sin argumentos encuentra todos los documentos en la colección
    const products = await Product.find({});

    // Enviamos la respuesta con estado 200 (OK) y los productos en formato JSON
    res.status(200).json(products);

  } catch (error: any) {
    // Si hay un error, enviamos una respuesta con estado 500 (Server Error)
    // y un mensaje de error
    console.error('Error al obtener productos:', error); // Opcional: loggear el error en consola del backend
    res.status(500).json({ message: 'Error interno del servidor al obtener productos' }); // Mensaje genérico para el cliente
  }
};

export { getProducts };