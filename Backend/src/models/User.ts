// Backend/src/models/User.ts

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Define la interfaz para el documento de usuario
export interface IUser extends Document {
   _id: string; // \u00A1Aseg\u00FArate de que _id sea de tipo string aqu\u00ED!
  username: string;
  email: string;
  password: string;
  // Puedes a\u00F1adir otros campos si el "negocio" los necesita, como nombre, rol, etc.
  isAdmin: boolean; // Para diferenciar entre usuarios normales y administradores del negocio
  comparePassword(candidatePassword: string): Promise<boolean>; // M\u00E9todo para comparar contrase\u00F1as
}

// 2. Define el esquema de Mongoose
const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, 'El nombre de usuario es requerido'],
    unique: true,
    trim: true,
    minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Por favor, introduce un email v\u00E1lido']
  },
  password: {
    type: String,
    required: [true, 'La contrase\u00F1a es requerida'],
    minlength: [6, 'La contrase\u00F1a debe tener al menos 6 caracteres']
  },
  isAdmin: {
    type: Boolean,
    default: false // Por defecto, los nuevos usuarios no son administradores
  }
}, {
  timestamps: true // A\u00F1ade campos createdAt y updatedAt autom\u00E1ticamente
});

// 3. Pre-hook de Mongoose para hashear la contrase\u00F1a antes de guardarla
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) { // Solo hashear si la contrase\u00F1a ha sido modificada (o es nueva)
    next();
  }
  const salt = await bcrypt.genSalt(10); // Genera un salt (cadena aleatoria)
  this.password = await bcrypt.hash(this.password, salt); // Hashea la contrase\u00F1a
  next();
});

// 4. M\u00E9todo para comparar contrase\u00F1as al momento del login
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 5. Exporta el modelo
const User = mongoose.model<IUser>('User', UserSchema);

export default User;