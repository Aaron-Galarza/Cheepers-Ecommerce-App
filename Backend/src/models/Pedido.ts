// Backend/src/models/Pedido.ts

import mongoose, { Schema, Document } from 'mongoose';

// Interfaces para el podructo entrante al pedido
export interface IProductItem {
    productId: mongoose.Types.ObjectId;
    name: string;      
    imageUrl: string;  
    quantity: number;
    priceAtOrder: number;
}

// la constante del producto entrante
const IProductItemSchema: Schema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtOrder: { type: Number, required: true, min: 1 },
  imageUrl: { type: String }
}, { _id: false });

// interfaces para la direccion (si es delivery)
export interface IShippingAddress {
    street: string;
    city: string;
}

// la constante de la direccion
const ShippingAddressSchema: Schema = new Schema({
  street: { type: String, required: true }, // La calle siempre será requerida si hay envío
  city: { type: String, required: true, default: 'Resistencia' }, // Podemos poner un default aquí o manejarlo en el controller
}, { _id: false });

// Interface para el pedido
export interface IOrder extends Document {
    guestEmail: string;
    guestPhone: string;
    products: IProductItem[];
    totalAmount: number;
    shippingAddress?: IShippingAddress;
    deliveryType: 'delivery' | 'pickup'; // <-- NUEVO CAMPO
    paymentMethod: 'cash' | 'card' | 'transfer';
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Estado del pedido
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// la constante del pedido
const orderSchema: Schema = new Schema({
    guestEmail: {
        type: String,
        required: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Por favor, introduce un email valido'],
    },
    guestPhone: {
        type: String,
        required: true,
    },
    products: [IProductItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
     deliveryType: { // <-- NUEVO CAMPO
    type: String,
    enum: ['delivery', 'pickup'],
    required: true,
    default: 'delivery'
    },
    // La dirección de envío ahora es condicional
    shippingAddress: {
    type: ShippingAddressSchema,
    required: function(this: IOrder) { // Mongoose permite funciones para required
      return this.deliveryType === 'delivery'; // Solo requerido si el tipo de entrega es 'delivery'
    }
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'transfer'],
        required: true,
    },
    status: { // <-- EL NOMBRE DE TU CAMPO ES 'status' EN EL ESQUEMA
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    notes: {
        type: String,
        maxlength: 500,
    },
}, {
    timestamps: true, // <--- REEMPLAZA EL MIDDLEWARE pre('save')
});


const Pedido = mongoose.model<IOrder>('Pedido', orderSchema);

export default Pedido;