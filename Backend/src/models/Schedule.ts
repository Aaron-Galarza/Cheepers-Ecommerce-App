import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para definir la estructura de un día de la semana
export interface IDaySchedule {
    day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
    openTime: string; // Ej: "10:00"
    closeTime: string; // Ej: "22:00"
    isStoreOpen: boolean; // Indica si la tienda está abierta ese día
}

// Interfaz para el documento principal de Horarios/Configuración
export interface ISchedule extends Document {
    storeName: string;
    dailySchedule: IDaySchedule[];
    // Configuración de la promoción/descuento en efectivo
    cashDiscountActive: boolean;
    cashDiscountPercentage: number;
    cashDiscountDays: ('Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo')[];
}

const dayScheduleSchema: Schema = new Schema({
    day: { type: String, required: true, enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] },
    openTime: { type: String, required: true, default: "10:00" },
    closeTime: { type: String, required: true, default: "22:00" },
    isStoreOpen: { type: Boolean, required: true, default: true },
}, { _id: false });

const scheduleSchema: Schema = new Schema({
    storeName: { 
        type: String, 
        required: true, 
        default: 'Mi Tienda de Comidas',
        unique: true
    },
    dailySchedule: {
        type: [dayScheduleSchema],
        required: true
    },
    cashDiscountActive: { type: Boolean, required: true, default: true },
    cashDiscountPercentage: { type: Number, required: true, default: 10 },
    cashDiscountDays: { 
        type: [String], 
        required: true, 
        enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        default: ['Lunes', 'Martes', 'Miércoles', 'Jueves']
    },
}, {
    timestamps: true
});

// Función estática para asegurar que SIEMPRE tengamos un documento de configuración
scheduleSchema.statics.getOrCreateSchedule = async function () {
    let schedule = await this.findOne({});
    
    if (!schedule) {
        schedule = new this({
            storeName: 'Mi Tienda de Comidas',
            dailySchedule: [
                { day: 'Domingo', openTime: '20:00', closeTime: '23:00', isStoreOpen: true },
                { day: 'Lunes', openTime: '20:00', closeTime: '23:00', isStoreOpen: true },
                { day: 'Martes', openTime: '20:00', closeTime: '23:00', isStoreOpen: true },
                { day: 'Miércoles', openTime: '20:00', closeTime: '23:00', isStoreOpen: true },
                { day: 'Jueves', openTime: '20:00', closeTime: '23:00', isStoreOpen: true },
                { day: 'Viernes', openTime: '20:00', closeTime: '23:00', isStoreOpen: true },
                { day: 'Sábado', openTime: '20:00', closeTime: '23:59', isStoreOpen: true },
            ],
            cashDiscountActive: true,
            cashDiscountPercentage: 10,
            cashDiscountDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves'],
        });
        await schedule.save();
    }

    return schedule;
};

// Extender el modelo con la función estática
interface IScheduleModel extends mongoose.Model<ISchedule> {
    getOrCreateSchedule(): Promise<ISchedule>;
}

const Schedule = mongoose.model<ISchedule, IScheduleModel>('Schedule', scheduleSchema);

export default Schedule;