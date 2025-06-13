import mongoose, { Schema, Document } from 'mongoose';

// Interfaces para tipado fuerte con TypeScript
export interface IProductItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  priceAtOrder: number;
}

export interface IShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  // Puedes añadir más campos aqu\u00ED si tu direcci\u00F3n de env\u00EDo es m\u00E1s compleja (ej. 'province', 'country', 'apartment/unit')
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId; // Referencia al usuario que realiza el pedido
  products: IProductItem[]; // Array de productos en el pedido
  totalAmount: number; // Monto total del pedido
  shippingAddress: IShippingAddress; // Direcci\u00F3n de env\u00EDo
  paymentMethod: 'cash' | 'card' | 'transfer'; // M\u00E9todo de pago. Puedes a\u00F1adir m\u00E1s opciones.
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Estado del pedido
  notes?: string; // Notas opcionales para el pedido
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Asume que tienes un modelo de Usuario llamado 'User'
    required: true,
  },
  products: [
    {
      productId: { // Usamos productId para claridad en el request y referencia
        type: Schema.Types.ObjectId,
        ref: 'Product', // Asume que tienes un modelo de Producto llamado 'Product'
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1, // La cantidad m\u00EDnima de un producto debe ser 1
      },
      priceAtOrder: { // Precio del producto en el momento exacto de la compra
        type: Number,
        required: true,
        min: 0,
      }
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer'], // Define los valores posibles
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], // Estados posibles del pedido
    default: 'pending',
  },
  notes: {
    type: String,
    maxlength: 500, // Limita la longitud de las notas
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para actualizar `updatedAt` autom\u00E1ticamente en cada guardado del documento
orderSchema.pre<IOrder>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Exporta el modelo de Mongoose. 'Pedido' ser\u00E1 el nombre de tu colecci\u00F3n en MongoDB.
const Order = mongoose.model<IOrder>('Pedido', orderSchema);

export default Order;