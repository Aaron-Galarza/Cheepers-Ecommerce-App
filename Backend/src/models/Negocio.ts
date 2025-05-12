import mongoose, { Document, Schema } from 'mongoose'; // Eliminamos HookNextFunction de la importación
import bcrypt from 'bcryptjs'; // Necesitaremos instalar bcryptjs

// Definir la interfaz para el documento de Negocio/Administrador
export interface INegocio extends Document {
  username: string;
  password: string; // La contraseña se almacenará hasheada
  email?: string; // Opcional: email del administrador
  // Aquí podríamos añadir más campos relacionados con el negocio en sí, si fuera necesario para el MVP
  // businessName?: string;
  // etc.
  createdAt: Date;
  updatedAt: Date;

  // Método para comparar contraseñas (implementado en el esquema)
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Definir el esquema de Mongoose para el Negocio/Administrador
const NegocioSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true, // El nombre de usuario debe ser único
    trim: true, // Elimina espacios en blanco al principio y al final
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true, // El email también podría ser único (opcional)
    trim: true,
    // match: [/^\S+@\S+.\S+$/, 'Por favor, usa un email válido'], // Validación de formato de email (opcional)
  },
  // Campos adicionales si se necesitan para el negocio:
  // businessName: { type: String },
}, {
  timestamps: true, // Añade createdAt y updatedAt
});

// --- Middlewares de Mongoose (Hooks) ---
// Antes de guardar, hashear la contraseña si ha sido modificada
// ** CORRECCIÓN AQUÍ: Eliminamos el tipado explícito de 'next' **
NegocioSchema.pre('save', async function (this: INegocio & Document, next) {
  // 'this' se refiere al documento Negocio que se va a guardar
  if (!this.isModified('password')) {
    // Si la contraseña no ha sido modificada, pasa al siguiente middleware o a guardar
    return next(); // Usamos return next() aquí para salir correctamente
  }

  // Si la contraseña sí ha sido modificada, la hasheamos
  const salt = await bcrypt.genSalt(10); // Genera un "salt"
  // TypeScript ahora sabe que this.password es un string
  this.password = await bcrypt.hash(this.password, salt);
  next(); // Pasa al siguiente middleware o a guardar
});

// --- Métodos del Esquema ---
// Método para comparar la contraseña ingresada con la contraseña hasheada guardada
NegocioSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  // 'this' aquí se refiere a la instancia del documento, tipado por la interfaz
  // 'this.password' es la contraseña hasheada almacenada en la base de datos
  return await bcrypt.compare(enteredPassword, this.password);
};


// Crear y exportar el modelo de Mongoose
const Negocio = mongoose.model<INegocio>('Negocio', NegocioSchema);

export default Negocio;