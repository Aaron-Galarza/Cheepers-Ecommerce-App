import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db'; // Importamos la función de conexión a la DB
import productRoutes from './routes/productRoutes'; // Importamos las rutas de productos

// Cargar variables de entorno
// Asegúrate de que el archivo .env esté en la raíz de la carpeta Backend
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express(); // Inicializar la aplicación Express

// Middlewares
app.use(express.json()); // Middleware para parsear cuerpos de petición JSON

// Rutas
// Montamos las rutas de productos en el path /api/productos
app.use('/api/productos', productRoutes);

// Definir el puerto
// Usamos el puerto definido en las variables de entorno (ej. PORT=5000 en .env)
// o por defecto el puerto 5000 si no está definido
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en modo ${process.env.NODE_ENV || 'desarrollo'} en el puerto ${PORT}`);
});

// Middleware básico para manejar rutas no encontradas (opcional pero recomendado)
app.use((req, res, next) => {
  res.status(404).send('Ruta no encontrada');
});

// Middleware básico para manejar errores (opcional pero recomendado)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack); // Loggear el stack del error en la consola del servidor
    res.status(500).send('Algo salió mal!'); // Enviar una respuesta de error genérica al cliente
});