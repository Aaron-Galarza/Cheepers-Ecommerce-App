// Backend/src/index.ts

import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import authRoutes from './routes/authRoutes';
import addOnRoutes from './routes/addOnRoutes';

dotenv.config();

// Verifica que JWT_SECRET esté definido
if (!process.env.JWT_SECRET) {
    console.error('ERROR: La variable de entorno JWT_SECRET no está definida. Por favor, añádela a tu archivo .env');
    process.exit(1);
}

const app: Application = express();

app.use(express.json());

// --- CONFIGURACIÓN DE CORS (CORRECCIÓN TypeScript) ---
const allowedOrigins = [
    'http://localhost:3000', // Si usas Create React App local
    'http://localhost:5173', // Si usas Vite local (tu caso)
    'https://cheepersapp.vercel.app', // El dominio principal de tu frontend en Vercel
    'https://cheepersapp-p27om5d6w-aaron-galarzas-projects.vercel.app', // El subdominio de Preview/Deployment específico de Vercel
    // Si quieres permitir cualquier subdominio de Vercel (menos seguro para producción):
    // Nota: Si descomentas esta línea, podrías quitar las dos líneas de Vercel anteriores
    // Esto es un string que representa una RegEx, no una RegEx directamente en el array de strings.
    // Para usar RegEx directamente, la lógica `origin` necesita un pequeño ajuste.
    // Lo más seguro es listar los dominios explícitamente.
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin 'origin' (ej. Postman, CURL, o para archivos estáticos/mismo origen)
        if (!origin) return callback(null, true);

        // Verifica si el origen está en la lista de cadenas permitidas
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Si tienes patrones regex, puedes manejarlos aquí (ej. si usas /\.vercel\.app$/ como string):
        // const vercelRegex = /\.vercel\.app$/;
        // if (vercelRegex.test(origin)) {
        //     return callback(null, true);
        // }

        // Si el origen NO está en la lista de permitidos
        const msg = 'La política de CORS para este sitio no permite el acceso desde el origen especificado: ' + origin;
        return callback(new Error(msg), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 204
}));
// --- FIN CONFIGURACIÓN CORS ---

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