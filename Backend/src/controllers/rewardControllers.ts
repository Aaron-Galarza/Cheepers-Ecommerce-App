// Backend/src/controllers/rewardController.ts (Versión refactorizada)

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { 
    createRewardInDB, 
    updateRewardInDB, 
    deactivateRewardInDB, 
    getRewardByIdInDB,
    getAllRewardsAdmin,
    getActiveRewards
} from '../services/rewardService'; 

// Interfaz para el cuerpo de la solicitud (puede ser la misma)
interface RewardBody {
    name: string;
    description: string;
    costPoints: number;
    imageUrl?: string;
    isActive: boolean;
}

// @desc    Crear un nuevo premio
// @route   POST /api/rewards
// @access  Private/Admin
export const createReward = asyncHandler(async (req: Request<{}, {}, RewardBody>, res: Response) => {
    const { name, description, costPoints } = req.body;

    // Validación mínima en Controller
    if (!name || !description || !costPoints) {
        res.status(400);
        throw new Error('Faltan campos obligatorios: nombre, descripción y costo en puntos.');
    }

    // Delegación al servicio
    const createdReward = await createRewardInDB(req.body); 
    res.status(201).json(createdReward);
});


// @desc    Actualizar un premio existente
// @route   PUT /api/rewards/:id
// @access  Private/Admin
export const updateReward = asyncHandler(async (req: Request<{ id: string }, {}, Partial<RewardBody>>, res: Response) => {
    const { id } = req.params;
    
    // Delegación al servicio (maneja la validación de ID y si existe o no)
    const updatedReward = await updateRewardInDB(id, req.body);
    res.json(updatedReward);
});


// @desc    Obtener un premio por ID
// @route   GET /api/rewards/:id
// @access  Private/Admin
export const getRewardById = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    
    const reward = await getRewardByIdInDB(id);

    if (!reward) {
        res.status(404);
        throw new Error('Premio no encontrado.');
    }
    res.json(reward);
});

// @desc    Obtener todos los premios (para uso Admin)
// @route   GET /api/rewards/admin
// @access  Private/Admin
export const getAllRewardsForAdmin = asyncHandler(async (req: Request, res: Response) => {
    const rewards = await getAllRewardsAdmin();
    res.json(rewards);
});


// @desc    Eliminar un premio (marcar como inactivo)
// @route   DELETE /api/rewards/:id
// @access  Private/Admin
export const deleteReward = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    
    // Delegación al servicio (maneja la validación y el cambio a isActive: false)
    const result = await deactivateRewardInDB(id); 
    res.json(result);
});

// @desc    Obtener todos los premios activos (para uso de Cliente)
// @route   GET /api/rewards
// @access  Public (solo requiere autenticación básica si el resto de tu app la requiere)
export const listActiveRewards = asyncHandler(async(req: Request, res: Response) => {
    const rewards = await getActiveRewards()

    if (!rewards) {
        res.status(204).json({"message":"No hay productos activos para mostrar. Por favor consulte el Panel Admin"})
    } else {
        res.status(200).json(rewards)

    }
})