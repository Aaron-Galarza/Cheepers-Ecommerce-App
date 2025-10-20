import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Schedule, { IDaySchedule } from '../models/Schedule'; 

// Configurar los plugins CORRECTAMENTE
dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = "America/Argentina/Buenos_Aires";

// Función auxiliar para mapear el índice numérico de dayjs al nombre del día en el modelo
const getDayName = (dayIndex: number): IDaySchedule['day'] => {
    const dayMap: { [key: number]: IDaySchedule['day'] } = {
        0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 
        4: 'Jueves', 5: 'Viernes', 6: 'Sábado'
    };
    return dayMap[dayIndex] || 'Domingo';
};

/**
 * Obtiene el estado de apertura/cierre de la tienda consultando la base de datos.
 */
export const getStoreOpenStatus = async (): Promise<{ isOpen: boolean, openTime: string, closeTime: string, dayName: string }> => {
    const schedule = await Schedule.getOrCreateSchedule();
    const now = dayjs().tz(TIMEZONE);
    const currentDayName = getDayName(now.day());

    const todaySchedule = schedule.dailySchedule.find(d => d.day === currentDayName);

    if (!todaySchedule || !todaySchedule.isStoreOpen) {
        return { isOpen: false, openTime: '', closeTime: '', dayName: currentDayName };
    }

    const { openTime, closeTime } = todaySchedule;

    // Lógica avanzada de comparación de tiempo (necesaria para cierres después de medianoche)
    const openTimeToday = dayjs.tz(`${now.format('YYYY-MM-DD')} ${openTime}`, TIMEZONE);
    let closeTimeToday = dayjs.tz(`${now.format('YYYY-MM-DD')} ${closeTime}`, TIMEZONE);

    let isCurrentlyOpen = false;
    
    // Si la hora de cierre es menor que la hora de apertura (ej: 23:00 a 01:00)
    if (closeTimeToday.isBefore(openTimeToday)) {
        // Asumimos que el cierre es al día siguiente
        closeTimeToday = closeTimeToday.add(1, 'day');
        isCurrentlyOpen = now.isAfter(openTimeToday) || now.isBefore(closeTimeToday);
    } else {
        // Cierre el mismo día (ej: 10:00 a 22:00)
        isCurrentlyOpen = now.isAfter(openTimeToday) && now.isBefore(closeTimeToday);
    }

    return { 
        isOpen: isCurrentlyOpen, 
        openTime, 
        closeTime, 
        dayName: currentDayName 
    };
};

/**
 * Obtiene el estado de la promoción de descuento en efectivo.
 */
export const getCashDiscountStatus = async (): Promise<{ isActive: boolean, percentage: number }> => {
    const schedule = await Schedule.getOrCreateSchedule();
    
    if (!schedule.cashDiscountActive) {
        return { isActive: false, percentage: 0 };
    }

    const now = dayjs().tz(TIMEZONE);
    const currentDayName = getDayName(now.day());

    // Verifica si el día actual está en la lista de días de descuento configurados
    const isCashDiscountDay = schedule.cashDiscountDays.includes(currentDayName);

    return { 
        isActive: isCashDiscountDay, 
        percentage: isCashDiscountDay ? schedule.cashDiscountPercentage : 0 
    };
};