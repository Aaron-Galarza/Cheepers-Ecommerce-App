// Backend/src/models/LoyaltyUser.ts

import mongoose, { Document, Schema } from 'mongoose';

// 1. Interfaz para TypeScript: Define la estructura del documento
export interface ILoyaltyUser extends Document {
    dni: string;
    totalPoints: number;
    createdAt: Date;
    updatedAt: Date;
}

// 2. Definición del Esquema de Mongoose
const LoyaltyUserSchema: Schema = new Schema({
    // --- Campos Requeridos ---

    // DNI: La clave única de identificación.
    // 'unique: true' asegura que no haya dos usuarios con el mismo DNI.
    // 'required: true' fuerza la presencia del campo.
    dni: {
        type: String,
        required: [true, 'El DNI es obligatorio para el usuario de lealtad.'],
        unique: true,
        trim: true, // Limpia espacios en blanco alrededor
    },
    
    // totalPoints: El saldo actual de puntos del cliente.
    // Se inicializa en 0 si no se especifica.
    totalPoints: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'El total de puntos no puede ser negativo.'], // Regla simple de validación
    },
}, {
    // 3. Opciones del Esquema
    timestamps: true, // Añade automáticamente createdAt y updatedAt
});

// 4. Crear el modelo e incluir las tipificaciones de TypeScript
const LoyaltyUser = mongoose.model<ILoyaltyUser>('Clientes', LoyaltyUserSchema);

export default LoyaltyUser;
