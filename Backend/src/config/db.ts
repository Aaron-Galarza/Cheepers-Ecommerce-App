import mongoose from 'mongoose';
import dotenv from 'dotenv'; // Importa dotenv para cargar variables de entorno

// Carga las variables de entorno desde el archivo .env
// Asumimos que el archivo .env estará en la raíz de la carpeta Backend
dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    // La URL de conexión a MongoDB se leerá de la variable de entorno MONGO_URI
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.error('Error: La variable de entorno MONGO_URI no está definida.');
      process.exit(1); // Sale del proceso si la variable no está definida
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB conectado: ${conn.connection.host}`);

  } catch (error: any) {
    console.error(`Error al conectar con MongoDB: ${error.message}`);
    process.exit(1); // Sale del proceso con un error
  }
};

export default connectDB;