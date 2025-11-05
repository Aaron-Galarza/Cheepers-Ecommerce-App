// Backend/src/models/LoyaltyHistory.ts

import mongoose, { Document, Schema } from 'mongoose';

// 1. Interfaz para TypeScript: Define la estructura del documento
export interface ILoyaltyHistory extends Document {
    dni: string;
    type: 'earn' | 'redeem';
    points: number; // Siempre un número, el signo (+/-) lo da la lógica y el campo 'type'
    reference: string; // ID del Pedido (earn) o ID del Premio (redeem)
    date: Date;
    createdAt: Date;
}

// 2. Definición del Esquema de Mongoose
const LoyaltyHistorySchema: Schema = new Schema({
    // --- Identificación del Cliente ---

    // dni: La clave para relacionar el movimiento con el cliente.
    dni: {
        type: String,
        required: [true, 'El DNI es obligatorio para el registro de historial.'],
        index: true, // Importante: Indexar para búsquedas rápidas por DNI.
    },
    
    // --- Detalles del Movimiento ---
    
    // type: Define si fue una ganancia o un canje.
    type: {
        type: String,
        enum: ['earn', 'redeem'],
        required: [true, 'El tipo de movimiento es obligatorio.'],
    },

    // points: La cantidad de puntos que se movió.
    // **Importante:** Almacenamos siempre un número POSITIVO. 
    // La lógica de negocio determina si se suma (earn) o resta (redeem).
    points: {
        type: Number,
        required: [true, 'La cantidad de puntos es obligatoria.'],
        min: [1, 'El movimiento debe ser de al menos 1 punto.'],
    },
    
    // reference: Permite auditar el origen/destino del movimiento.
    // Almacenará el `orderId` si es 'earn', o el `rewardId` si es 'redeem'.
    reference: {
        type: String,
        required: [true, 'La referencia del movimiento (ID de pedido/premio) es obligatoria.'],
    },

    // date: Almacenado como un índice separado de 'createdAt' para facilitar las consultas por rango de fechas (aunque 'createdAt' podría usarse).
    date: {
        type: Date,
        default: Date.now,
        required: true,
        index: true, // Importante para filtros por rango de fechas.
    }

}, {
    // Solo 'createdAt', ya que los movimientos de historial no se editan.
    timestamps: { createdAt: true, updatedAt: false }, 
});

// 3. Crear el modelo e incluir las tipificaciones de TypeScript
const LoyaltyHistory = mongoose.model<ILoyaltyHistory>('HistorialPuntos', LoyaltyHistorySchema);

export default LoyaltyHistory;