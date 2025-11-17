import { describe } from "node:test";
import Reward from "../models/Reward";
import {Types} from 'mongoose';

interface RewardData {
    name: string;
    description: string;
    costPoints: number;
    imageUrls?: string;
    isActive: boolean;
}

/**
 * @desc Crea un nuevo premio en la base de datos.
 */

//verificacion de campos
export const createRewardInDB = async (data: RewardData) => {
    const reward = new Reward({  
        name: data.name,
        description: data.description,
        costPoints: data.costPoints,
        imageUrl: data.imageUrls || '',
        isActive: data.isActive  !== undefined ? data.isActive : true,
    })
    return await reward.save();
}

/**
 * @desc Actualiza un premio existente.
 */
export const updateRewardInDB = async (id: string, data: Partial<RewardData>) => {
    if (!Types.ObjectId.isValid(id)) {
        throw new Error('ID de premio no válido.');
    }

    const reward = await Reward.findById(id);

    if (!reward) {
        throw new Error('Premio no encontrado.');
    }

    // Actualizamos solo los campos que vienen en el 'data' (parcial)
    Object.assign(reward, data);
    
    // Lógica específica de negocio (ej. no permitir un costo negativo)
    if (reward.costPoints < 0) {
        throw new Error('El costo en puntos no puede ser negativo.');
    }

    return await reward.save();
};

/**
 * @desc Desactiva (Elimina lógicamente) un premio por ID.
 */
export const deactivateRewardInDB = async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
        throw new Error('ID de premio no válido.');
    }
    
    const reward = await Reward.findById(id);

    if (!reward) {
        throw new Error('Premio no encontrado.');
    }

    reward.isActive = false; // Desactivar en lugar de eliminar
    await reward.save();
    return { message: 'Premio marcado como inactivo (eliminado lógicamente).' };
};

/**
 * @desc Obtiene todos los premios (incluidos los inactivos, para Admin).
 */
export const getAllRewardsAdmin = async () => {
    return await Reward.find({});
};

/**
 * @desc Obtiene un premio por ID.
 */
export const getRewardByIdInDB = async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
        throw new Error('ID de premio no válido.');
    }
    return await Reward.findById(id);
};

/**
 * @desc Obtiene todos los premios que están marcados como activos (para uso público/cliente).
 */
export const getActiveRewards = async () => {
    return await Reward.find({isActive: true});
    
}