// Backend/src/services/loyaltyService.ts

import Pedido, { IOrder } from '../models/Pedido'; // Necesitas importar Pedido
import LoyaltyUser from '../models/LoyaltyUser';
import LoyaltyHistory from '../models/LoyaltyHistory';
import Reward from '../models/Reward';
import mongoose from 'mongoose';

// 1. Regla de Asignación: Puntos basados en el monto de la compra (50 x 1000).
const AMOUNT_THRESHOLD = 1000;
const POINTS_PER_THRESHOLD = 50; 

interface LoyaltyInfo {
    totalPoints: number;
    history: any[]; // Usar ILoyaltyHistory[] si está importada
    exists: boolean;
}

/**
 * Calcula los puntos a otorgar. En un MVP, suele ser un porcentaje del monto.
 * @param amount El monto total de la compra.
 * @returns Los puntos a asignar (redondeados).
 */
const calculatePoints = (amount: number): number => {
    // Se redondea al número entero más cercano para evitar puntos fraccionarios
const multiplier = Math.floor(amount / AMOUNT_THRESHOLD);
return multiplier * POINTS_PER_THRESHOLD;
};


/**
 * @desc Procesa la asignación de puntos cuando un pedido es ENTREGADO.
 * @param order El documento del pedido actualizado.
 * @returns true si se asignaron puntos, false si no aplicó o ya los había ganado.
 */
export const processOrderPoints = async (order: IOrder): Promise<boolean> => {
    // 1. Validación de Pre-condiciones
    const { guestDni, totalAmount, pointsEarned } = order;
    
    const pointsToEarn = calculatePoints(totalAmount); // <--- Llama a la nueva función

    // A. NO sumar si el pedido ya otorgó puntos (Validación: El pedido solo puede sumar puntos una vez)
    if (pointsEarned) {
        console.log(`[LoyaltyService] Pedido ${order._id} ya ha otorgado puntos. Ignorando.`);
        return false;
    }

    // B. NO sumar si no hay DNI registrado.
    if (!guestDni) {
        console.log(`[LoyaltyService] Pedido ${order._id} sin DNI. Ignorando.`);
        return false;
    }
    
    if (pointsToEarn < 1) {
        console.log(`[LoyaltyService] Monto insuficiente (${totalAmount}) para sumar puntos. Ignorando.`);
        return false;
    }

    // --- Lógica Transaccional para garantizar la integridad ---
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 2. Buscar o Crear el Usuario de Lealtad (Vincular)
        const loyaltyUser = await LoyaltyUser.findOneAndUpdate(
            { dni: guestDni },
            { $inc: { totalPoints: pointsToEarn } }, // $inc: incrementa el campo totalPoints
            { 
                new: true, 
                upsert: true, // Si no existe, lo crea (con totalPoints = pointsToEarn)
                session 
            }
        );

        // 3. Generar Registro en el Historial
        const historyEntry = new LoyaltyHistory({
            dni: guestDni,
            type: 'earn',
            points: pointsToEarn,
            reference: order.id.toString(), // Usamos el ID del pedido como referencia
            date: new Date(),
        });
        await historyEntry.save({ session });
        
        // 4. Marcar el Pedido como Puntos Otorgados
        order.pointsEarned = true;
        await order.save({ session });

        // 5. Commit de la Transacción
        await session.commitTransaction();
        console.log(`[LoyaltyService] Puntos asignados: ${pointsToEarn} a DNI: ${guestDni} (Pedido: ${order._id})`);
        return true;

    } catch (error: any) {
        await session.abortTransaction();
        console.error(`[LoyaltyService] Error en transacción de puntos para Pedido ${order._id}:`, error);
        // Podrías lanzar un error o loguearlo, pero la lógica del pedido debe continuar.
        return false;
    } finally {
        session.endSession();
    }
};

// NOTA: Se ha usado una Transacción de Mongoose. Esto es crucial para la lógica de negocio:
// O se actualiza el saldo, se registra el historial Y se marca el pedido como "puntos otorgados", 
// O nada de eso ocurre. La integridad está garantizada.

/**
 * @desc Lógica transaccional para canjear un premio por puntos.
 * @param dni El DNI del cliente.
 * @param rewardId El ID del premio a canjear.
 * @returns Un objeto con el resultado del canje.
 */
export const redeemReward = async (dni: string, rewardId: string) => {
    // 1. Validar DNI y RewardId (Validación: Solo números y longitud. Esto idealmente es un middleware/joi)
    if (!dni || !/^\d{7,10}$/.test(dni)) { 
        throw new Error('DNI no válido. Debe ser solo números (7-10 dígitos).');
    }
    if (!mongoose.Types.ObjectId.isValid(rewardId)) {
        throw new Error('ID de premio no válido.');
    }

    // 2. Buscar Usuario y Premio
    const loyaltyUser = await LoyaltyUser.findOne({ dni });
    const reward = await Reward.findById(rewardId);

    if (!loyaltyUser) {
        throw new Error(`Usuario con DNI ${dni} no encontrado en el sistema de lealtad.`);
    }

    // (Validación: verificar que reward esté activo)
    if (!reward || !reward.isActive) {
        throw new Error('Premio no encontrado o está inactivo.');
    }

    const costPoints = reward.costPoints;

    // (Validación: verificar puntos suficientes)
    if (loyaltyUser.totalPoints < costPoints) {
        throw new Error(`Puntos insuficientes. El premio cuesta ${costPoints} puntos y el usuario tiene ${loyaltyUser.totalPoints}.`);
    }

    // --- Lógica Transaccional para garantizar la integridad (Restar y Registrar) ---
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 3. Restar Puntos del Usuario
        loyaltyUser.totalPoints -= costPoints;
        await loyaltyUser.save({ session });
        
        // 4. Guardar Movimiento en LoyaltyHistory
        const historyEntry = new LoyaltyHistory({
            dni,
            type: 'redeem',
            points: -costPoints, // Negativo para indicar egreso
            reference: rewardId, // Referencia al ID del premio
            rewardName: reward.name, 
            date: new Date(),
        });
        await historyEntry.save({ session });

        // 5. Commit de la Transacción
        await session.commitTransaction();
        
        return {
            message: 'Canje de premio exitoso.',
            reward: reward.name,
            pointsUsed: costPoints,
            remainingPoints: loyaltyUser.totalPoints,
        };

    } catch (error: any) {
        await session.abortTransaction();
        console.error(`[LoyaltyService] Error en transacción de canje para DNI ${dni}:`, error);
        
        // --- INICIO DE CORRECCIÓN ---
        // Propagar el mensaje de error original (ej. "Puntos insuficientes" o el error de Mongoose)
        if (error.name === 'ValidationError') {
            // Si es un error de validación de Mongoose, lanzamos el primer mensaje de error encontrado
            const validationErrors = Object.values(error.errors).map((e: any) => e.message);
            throw new Error(`Error de Validación: ${validationErrors.join('; ')}`);
        } else if (error.message.includes('Puntos insuficientes')) {
            // Error de negocio específico que lanzamos arriba
            throw error; 
        } else {
            // Error genérico (ej. de conexión a DB)
            throw new Error('Ocurrió un error interno desconocido al procesar el canje.');
        }
        // --- FIN DE CORRECCIÓN ---
    } finally {
        session.endSession();
    }
};

// @desc Obtiene los puntos totales y el historial de transacciones de un cliente.
export const getClientLoyaltyInfo = async (dni: string): Promise<LoyaltyInfo> => {
    // 1. Buscar el usuario de lealtad
    const user = await LoyaltyUser.findOne({ dni });

    if (!user) {
        // Si el DNI no existe en el sistema de lealtad
        return {
            totalPoints: 0,
            history: [],
            exists: false,
        };
    }

    // 2. Buscar el historial de movimientos
    // Ordenamos por fecha descendente (los más recientes primero)
    const history = await LoyaltyHistory.find({ dni })
        .sort({ date: -1 }); // Los más nuevos al principio

    // 3. Devolver los datos
    return {
        totalPoints: user.totalPoints,
        history,
        exists: true,
    };
};