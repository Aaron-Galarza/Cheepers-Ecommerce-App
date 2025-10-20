import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Schedule, { IDaySchedule } from '../models/Schedule';

// @desc    Obtener la configuración actual de horarios y descuentos
// @route   GET /api/schedule/
// @access  Public (lo usará el front-end y el admin)
export const getSchedule = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await Schedule.getOrCreateSchedule(); 
    res.status(200).json(schedule);
});

// @desc    Actualizar la configuración de horarios y descuentos (Admin)
// @route   PUT /api/schedule/
// @access  Admin 
export const updateSchedule = asyncHandler(async (req: Request, res: Response) => {
    const { 
        storeName, 
        dailySchedule, 
        cashDiscountActive, 
        cashDiscountPercentage, 
        cashDiscountDays 
    } = req.body;

    const schedule = await Schedule.findOne({}); 

    if (!schedule) {
        res.status(404);
        throw new Error('Documento de Horarios/Configuración no encontrado.');
    }

    // --- ACTUALIZACIÓN INTELIGENTE ---
    
    // 1. Actualizar storeName si se proporciona
    if (storeName !== undefined) {
        schedule.storeName = storeName;
    }

    // 2. Actualizar dailySchedule de manera inteligente
    if (dailySchedule !== undefined && Array.isArray(dailySchedule)) {
        // Si se envía un array completo, reemplazar todo
        if (dailySchedule.length === 7) {
            schedule.dailySchedule = dailySchedule;
        } 
        // Si se envía solo algunos días, actualizar solo esos
        else if (dailySchedule.length > 0 && dailySchedule.length < 7) {
            for (const updatedDay of dailySchedule) {
                const existingDayIndex = schedule.dailySchedule.findIndex(
                    day => day.day === updatedDay.day
                );
                
                if (existingDayIndex !== -1) {
                    // Actualizar el día existente
                    schedule.dailySchedule[existingDayIndex] = {
                        ...schedule.dailySchedule[existingDayIndex],
                        ...updatedDay
                    };
                } else {
                    // Agregar nuevo día (no debería pasar con días de la semana)
                    schedule.dailySchedule.push(updatedDay);
                }
            }
        }
    }

    // 3. Actualizar configuración de descuentos
    if (cashDiscountActive !== undefined) {
        schedule.cashDiscountActive = cashDiscountActive;
    }
    
    if (cashDiscountPercentage !== undefined) {
        schedule.cashDiscountPercentage = cashDiscountPercentage;
    }
    
    if (cashDiscountDays !== undefined && Array.isArray(cashDiscountDays)) {
        schedule.cashDiscountDays = cashDiscountDays;
    }

    const updatedSchedule = await schedule.save();

    res.status(200).json({ 
        message: 'Configuración de horarios y descuentos actualizada exitosamente.', 
        schedule: updatedSchedule 
    });
});

// @desc    Actualizar un día específico del horario
// @route   PATCH /api/schedule/day
// @access  Admin 
export const updateDaySchedule = asyncHandler(async (req: Request, res: Response) => {
    const { day, openTime, closeTime, isStoreOpen } = req.body;

    if (!day) {
        res.status(400);
        throw new Error('El campo "day" es obligatorio.');
    }

    const schedule = await Schedule.findOne({}); 

    if (!schedule) {
        res.status(404);
        throw new Error('Documento de Horarios/Configuración no encontrado.');
    }

    // Encontrar y actualizar el día específico
    const dayIndex = schedule.dailySchedule.findIndex(d => d.day === day);
    
    if (dayIndex === -1) {
        res.status(404);
        throw new Error(`Día "${day}" no encontrado en la configuración.`);
    }

    // Actualizar solo los campos proporcionados
    if (openTime !== undefined) schedule.dailySchedule[dayIndex].openTime = openTime;
    if (closeTime !== undefined) schedule.dailySchedule[dayIndex].closeTime = closeTime;
    if (isStoreOpen !== undefined) schedule.dailySchedule[dayIndex].isStoreOpen = isStoreOpen;

    const updatedSchedule = await schedule.save();

    res.status(200).json({ 
        message: `Horario del ${day} actualizado exitosamente.`, 
        schedule: updatedSchedule 
    });
});