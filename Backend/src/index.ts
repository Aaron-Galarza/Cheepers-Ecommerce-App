// Backend/src/index.ts

import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

// Verifica que JWT_SECRET est\u00E9 definido (esto es crucial ahora que usas JWT)
if (!process.env.JWT_SECRET) {
  console.error('ERROR: La variable de entorno JWT_SECRET no esta definida. Por favor, añadela a tu archivo .env');
  process.exit(1); // Sale de la aplicaci\u00F3n si no est\u00E1 definida
}


const app: Application = express();

// Middlewares
app.use(express.json()); // Necesario para parsear el body de peticiones JSON (login/register)
app.use(cors());

// Importar la conexi\u00F3n a la base de datos
import connectDB from './config/db';
connectDB();

// --- Importar y usar Rutas ---
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes'; // <--- \u00A1A\u00F1adir esta importaci\u00F3n!

// Usar las rutas con un prefijo '/api'
app.use('/api', orderRoutes);
app.use('/api', productRoutes);
app.use('/api', authRoutes); // <--- \u00A1A\u00F1adir esta l\u00EDnea! As\u00ED quedar\u00E1 /api/negocio/login y /api/negocio/register
app.use('/api/negocio', adminRoutes); // Si adminRoutes maneja rutas espec\u00EDficas que empiezan con /negocio

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.send('La API de Cheepers está funcionando...');
});

// --- RUTA DE HEALTH CHECK (A\u00F1ade esta secci\u00F3n) ---
app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('OK');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor de Backend Cheepers corriendo en http://localhost:${PORT}`);
  console.log(`Para probar el registro: POST http://localhost:${PORT}/api/negocio/register`);
  console.log(`Para probar el login: POST http://localhost:${PORT}/api/negocio/login`);
});

// Middleware de manejo de errores (opcional, pero buena pr\u00E1ctica con asyncHandler)
// Puedes a\u00F1adirlo aqu\u00ED al final de tus rutas
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error(err.stack); // Registra el stack trace del error
    res.status(500).json({ message: 'Algo salio mal en el servidor!', error: err.message });
});