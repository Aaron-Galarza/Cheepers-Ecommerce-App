import mongoose, { Document, Schema } from 'mongoose';

// Definir una interfaz para el documento de Producto
// Esto es útil para tipado en TypeScript
export interface IProduct extends Document {
  name: string;
  description?: string; // El '?' indica que este campo es opcional
  price: number;
  imageUrl?: string; // URL de la imagen, opcional
  category: string; // Categoría del producto
  isActive: boolean;
  // Aquí podríamos añadir un campo 'businessId' en el futuro para multi-tenancy
  // businessId: mongoose.Types.ObjectId;
}

// Definir el esquema de Mongoose para el Producto
const ProductSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true }, // Nombre del producto, obligatorio y único
  description: { type: String }, // Descripción del producto
  price: { type: Number, required: true }, // Precio del producto, obligatorio
  imageUrl: { type: String }, // URL de la imagen del producto
  category: { type: String }, // Categoría del producto
  isActive: { type: Boolean, required: true, default: true },
  // Si implementamos multi-tenancy, añadiríamos:
  // businessId: { type: mongoose.Types.ObjectId, required: true, ref: 'Negocio' },
}, {
  timestamps: true, // Añade automáticamente campos createdAt y updatedAt
});

// Crear y exportar el modelo de Mongoose
const Product = mongoose.model<IProduct>('Producto', ProductSchema);

export default Product;