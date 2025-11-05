// Backend/src/services/loyaltyService.ts

import Pedido, { IOrder } from '../models/Pedido'; // Necesitas importar Pedido
import LoyaltyUser from '../models/LoyaltyUser';
import LoyaltyHistory from '../models/LoyaltyHistory';
import mongoose from 'mongoose';

// 1. Regla de Asignación: Puntos basados en el monto de la compra (50 x 1000).
const AMOUNT_THRESHOLD = 1000;
const POINTS_PER_THRESHOLD = 50; 

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