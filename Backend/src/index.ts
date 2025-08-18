// Backend/src/index.ts

import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet'; // Importamos helmet
import rateLimit from 'express-rate-limit'; // Importamos rateLimit
import mongoSanitize from 'express-mongo-sanitize'; // Importamos express-mongo-sanitize
import { setupSchedule } from './utils/schedule'; // <-- IMPORTA LA FUNCIÓN


// Importamos tus rutas
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import authRoutes from './routes/authRoutes';
import addOnRoutes from './routes/addOnRoutes';

dotenv.config();

if (!process.env.JWT_SECRET) {
    console.error('ERROR: La variable de entorno JWT_SECRET no está definida. Por favor, añádela a tu archivo .env');
    process.exit(1);
}

const app: Application = express();

// --- MIDDLEWARES DE SEGURIDAD GENERALES ---
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // Esto se encarga de las inyecciones de Mongo
setupSchedule();

// --- CONFIGURACIÓN DE CORS ---
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://cheepersapp.vercel.app',
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        const msg = 'La política de CORS para este sitio no permite el acceso desde el origen especificado: ' + origin;
        return callback(new Error(msg), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 204
}));

// --- LIMITADOR DE VELOCIDAD PARA RUTAS ESPECÍFICAS (LOGIN) ---
export const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: 'Demasiados intentos de login fallidos desde esta IP, por favor, intenta de nuevo en 15 minutos.'
});

// Importar la conexión a la base de datos
import connectDB from './config/db';
connectDB();

// Usar las rutas con sus prefijos específicos
app.use('/api/negocio', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addons', addOnRoutes);

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
    res.send('La API de Cheepers está funcionando...');
});

// --- RUTA DE HEALTH CHECK ---
app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('OK');
});

// --- Manejo de errores (Mejorado) ---
// Middleware para manejar rutas no encontradas (404)
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: `Ruta no encontrada: ${req.originalUrl}` });
});

// Middleware de manejo de errores global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? 'Production Error' : err.stack
    });
});
// --- FIN Manejo de errores ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor de Backend Cheepers corriendo en http://localhost:${PORT}`);
    console.log(`Para probar el registro: POST http://localhost:${PORT}/api/negocio/register`);
    console.log(`Para probar el login: POST http://localhost:${PORT}/api/negocio/login`);
});