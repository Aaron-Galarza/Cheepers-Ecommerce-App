// Backend/src/models/Pedido.ts

import mongoose, { Schema, Document } from 'mongoose';

// Interfaces para tipado fuerte con TypeScript
export interface IProductItem {
    productId: mongoose.Types.ObjectId;
    name: string;      // <--- A\u00D1ADIDO AL ESQUEMA
    imageUrl: string;  // <--- A\u00D1ADIDO AL ESQUEMA
    quantity: number;
    priceAtOrder: number;
}

export interface IShippingAddress {
    street: string;
    city: string;
    postalCode: string;
    // Puedes a\u00F1adir m\u00E1s campos aqu\u00ED si tu direcci\u00F3n de env\u00EDo es m\u00E1s compleja (ej. 'province', 'country', 'apartment/unit')
}

export interface IOrder extends Document {
    guestEmail: string;
    guestPhone: string;
    products: IProductItem[];
    totalAmount: number;
    shippingAddress: IShippingAddress;
    paymentMethod: 'cash' | 'card' | 'transfer';
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Estado del pedido
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

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
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            name: { // <--- A\u00D1ADIDO AL ESQUEMA
                type: String,
                required: true,
            },
            imageUrl: { // <--- A\u00D1ADIDO AL ESQUEMA
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            priceAtOrder: {
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

// REMOVED: Middleware para actualizar `updatedAt` autom\u00E1ticamente en cada guardado del documento
// orderSchema.pre<IOrder>('save', function(next) {
//   this.updatedAt = new Date();
//   next();
// });

const Pedido = mongoose.model<IOrder>('Pedido', orderSchema);

export default Pedido;