import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Importar la conexión a la base de datos
import connectDB from './config/db';
connectDB();

// --- Importar y usar Rutas ---
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import adminRoutes from './routes/adminRoutes'; // <-- A\u00F1adir esta importaci\u00F3n

// Usar las rutas con un prefijo '/api'
app.use('/api', orderRoutes);
app.use('/api', productRoutes);
app.use('/api/negocio', adminRoutes); // <-- A\u00F1adir esta l\u00EDnea, con prefijo '/api/negocio'

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.send('La API de Cheepers est\u00E1 funcionando...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor de Backend Cheepers corriendo en http://localhost:${PORT}`);
});

// Middleware de manejo de errores (opcional, pero buena pr\u00E1ctica con asyncHandler)
// Puedes añadirlo aqu\u00ED al final de tus rutas
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error(err.stack); // Registra el stack trace del error
    res.status(500).json({ message: 'Algo sali\u00F3 mal en el servidor!', error: err.message });
});