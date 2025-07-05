// Backend/src/index.ts

import express, { Application, Request, Response, NextFunction } from 'express'; // Importa NextFunction
import dotenv from 'dotenv';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import authRoutes from './routes/authRoutes'; // Para login y register
// import adminRoutes from './routes/adminRoutes'; // <--- ELIMINAR O COMENTAR ESTA L\u00CDNEA


dotenv.config();

// Verifica que JWT_SECRET est\u00E9 definido
if (!process.env.JWT_SECRET) {
    console.error('ERROR: La variable de entorno JWT_SECRET no est\u00E1 definida. Por favor, a\u00F1adela a tu archivo .env');
    process.exit(1); // Sale de la aplicaci\u00F3n si no est\u00E1 definida
}

const app: Application = express();

app.use(express.json());

// --- CONFIGURACI\u00D3N DE CORS (Punto Clave a Corregir) ---
const allowedOrigins = [
    'http://localhost:3000', // Si usas React scripts 'start' por defecto
    'http://localhost:5173', // <--- \u00A1A\u00D1ADE ESTA L\u00CDNEA! Es el puerto que est\u00E1 usando tu frontend
    // Cuando despliegues el frontend en Render, a\u00F1ade tambi\u00E9n esa URL aqu\u00ED:
    // 'https://tu-frontend-url-en-render.onrender.com',
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin 'origin' (ej. Postman, CURL, o para archivos est\u00E1ticos/mismo origen)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'La pol\u00EDtica de CORS para este sitio no permite el acceso desde el origen especificado: ' + origin;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // M\u00E9todos HTTP permitidos
    credentials: true, // Habilita el env\u00EDo de cookies de credenciales y encabezados de autorizaci\u00F3n
    optionsSuccessStatus: 204 // C\u00F3digo de estado para las preflight requests (OPTIONS)
}));
// --- FIN CONFIGURACI\u00D3N CORS ---

// Importar la conexi\u00F3n a la base de datos
import connectDB from './config/db';
connectDB();

// Usar las rutas con sus prefijos espec\u00EDficos
app.use('/api/negocio', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// app.use('/api/negocio', adminRoutes); // <--- ELIMINAR O COMENTAR ESTA L\u00CDNEA (NO NECESARIA CON LOGIN UNIFICADO)

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
    res.send('La API de Cheepers est\u00E1 funcionando...');
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
    console.error(err.stack); // Registra el stack trace del error
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Si ya se envi\u00F3 un status 200, usar 500
    res.status(statusCode).json({
        message: err.message,
        // En producci\u00F3n, no es buena idea enviar el stack trace completo por seguridad
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