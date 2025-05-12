import mongoose, { Document, Schema } from 'mongoose';

// Definir la interfaz para los artículos individuales dentro de un pedido
// Usaremos esto como un subdocumento (o esquema embebido)
export interface IPedidoItem {
  name: string;
  quantity: number;
  price: number; // Precio unitario al momento de la compra
  // product: mongoose.Types.ObjectId; // Podríamos referenciar al producto original si fuera necesario
}

// Definir la interfaz para el documento de Pedido
export interface IPedido extends Document {
  customerName: string;
  customerPhone: string;
  items: IPedidoItem[]; // Un array de artículos del pedido
  totalAmount: number;
  deliveryType: 'retiro' | 'envio'; // Puede ser 'retiro' o 'envio'
  status: 'pendiente' | 'confirmado' | 'en_preparacion' | 'listo_para_entrega' | 'entregado' | 'cancelado'; // Estados posibles del pedido
  // Aquí también iría businessId para multi-tenancy:
  // businessId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Definir el esquema de Mongoose para los artículos individuales
const PedidoItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  // product: { type: mongoose.Types.ObjectId, ref: 'Producto', required: true },
}, {
  _id: false // Los subdocumentos embebidos generalmente no necesitan su propio _id
});

// Definir el esquema principal de Mongoose para el Pedido
const PedidoSchema: Schema = new Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true }, // Podríamos añadir validación de formato aquí
  items: [PedidoItemSchema], // Definimos que 'items' será un array de 'PedidoItemSchema'
  totalAmount: { type: Number, required: true, min: 0 },
  deliveryType: { type: String, required: true, enum: ['retiro', 'envio'] }, // 'enum' restringe los valores posibles
  status: {
    type: String,
    required: true,
    enum: ['pendiente', 'confirmado', 'en_preparacion', 'listo_para_entrega', 'entregado', 'cancelado'],
    default: 'pendiente', // El estado inicial por defecto
  },
  // Para multi-tenancy:
  // businessId: { type: mongoose.Types.ObjectId, required: true, ref: 'Negocio' },
}, {
  timestamps: true, // Añade createdAt y updatedAt
});

// Crear y exportar el modelo de Mongoose
const Pedido = mongoose.model<IPedido>('Pedido', PedidoSchema);

export default Pedido;