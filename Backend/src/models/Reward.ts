// Backend/src/models/Reward.ts

import mongoose, { Document, Schema } from 'mongoose';

// 1. Interfaz para TypeScript: Define la estructura del documento
export interface IReward extends Document {
    name: string;
    description: string;
    costPoints: number;
    imageUrl?: string; // Opcional, ya que puede que no suba la imagen al crear
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// 2. Definición del Esquema de Mongoose
const RewardSchema: Schema = new Schema({
    // --- Campos Requeridos ---

    // name: Nombre del premio (ej. "Hamburguesa Cheepers Doble").
    name: {
        type: String,
        required: [true, 'El nombre del premio es obligatorio.'],
        trim: true,
        unique: true, // Asumimos que los nombres de los premios son únicos para el CRUD
    },
    
    // description: Breve descripción para el catálogo público.
    description: {
        type: String,
        required: [true, 'La descripción del premio es obligatoria.'],
    },

    // costPoints: El costo del premio en puntos de lealtad.
    costPoints: {
        type: Number,
        required: [true, 'El costo en puntos es obligatorio.'],
        min: [1, 'El costo del premio debe ser al menos 1 punto.'],
    },

    // --- Campos Opcionales / Lógicos ---
    
    // imageUrl: URL de la imagen del premio (ej. de Cloudinary).
    imageUrl: {
        type: String,
        default: '',
    },

    // isActive: Controla si el premio es canjeable o visible en el catálogo público.
    isActive: {
        type: Boolean,
        required: true,
        default: true, // Por defecto, el premio está activo al crearse
    },
}, {
    // 3. Opciones del Esquema
    timestamps: true,
});

// 4. Crear el modelo e incluir las tipificaciones de TypeScript
const Reward = mongoose.model<IReward>('Premios', RewardSchema);

export default Reward;