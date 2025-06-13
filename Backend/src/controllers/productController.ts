import { Request, Response } from 'express';
import Product from '../models/Product';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, imageUrl } = req.body;
    if (!name || typeof price !== 'number' || price < 0 || !category) {
      res.status(400).json({ message: 'Product name, valid price, and category are required.' });
      return;
    }
    const newProduct = new Product({ name, description, price, category, imageUrl });
    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};