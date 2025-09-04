import mongoose, { Schema, Document } from 'mongoose';

// ADICIÓN: Interfaz para un adicional seleccionado dentro de un producto en el pedido
export interface ISelectedAddOn {
    addOnId: mongoose.Types.ObjectId; // Referencia al ID del adicional original
    name: string; // Nombre del adicional al momento de la orden
    quantity: number; // Cantidad de este adicional (ej. 2x carne extra)
    priceAtOrder: number; // Precio del adicional al momento de la orden
}

// ADICIÓN: Esquema para un adicional seleccionado
const SelectedAddOnSchema: Schema = new Schema({
    addOnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Adicional', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtOrder: { type: Number, required: true, min: 0 },
}, { _id: false }); // _id: false para que Mongoose no cree un _id por defecto para subdocumentos

// Interfaces para el producto entrante al pedido (MODIFICADO)
export interface IProductItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    imageUrl: string;
    quantity: number;
    priceAtOrder: number;
    addOns?: ISelectedAddOn[]; // ADICIÓN: Array opcional de adicionales seleccionados
}

// la constante del producto entrante (MODIFICADO)
const IProductItemSchema: Schema = new Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtOrder: { type: Number, required: true, min: 1 },
    imageUrl: { type: String },
    addOns: { type: [SelectedAddOnSchema], default: [] } // ADICIÓN: Referencia al nuevo esquema de adicionales
}, { _id: false });

// interfaces para la direccion (si es delivery)
export interface IShippingAddress {
    street: string;
    city: string;
}

// la constante de la direccion
const ShippingAddressSchema: Schema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true, default: 'Resistencia' },
}, { _id: false });

// Interface para el pedido
export interface IOrder extends Document {
    guestEmail?: string;
    guestPhone: string;
    guestName: string;
    products: IProductItem[];
    totalAmount: number;
    shippingAddress?: IShippingAddress;
    deliveryType: 'delivery' | 'pickup';
    paymentMethod: 'cash' | 'card' | 'transfer';
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// la constante del pedido
const orderSchema: Schema = new Schema({
    guestEmail: {
        type: String,
        required: false,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Por favor, introduce un email valido'],
    },
    guestPhone: {
        type: String,
        required: true,
    },
    guestName: {
        type: String,
        required: true,
    },
    products: [IProductItemSchema], // Ahora IProductItemSchema incluye `addOns`
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    deliveryType: {
        type: String,
        enum: ['delivery', 'pickup'],
        required: true,
        default: 'delivery'
    },
    shippingAddress: {
        type: ShippingAddressSchema,
        required: function(this: IOrder) {
            return this.deliveryType === 'delivery';
        }
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'transfer'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    notes: {
        type: String,
        maxlength: 500,
    },
}, {
    timestamps: true,
});

const Pedido = mongoose.model<IOrder>('Pedido', orderSchema);

export default Pedido;