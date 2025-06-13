// backend/src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  // A\u00F1ade m\u00E1s campos seg\u00FAn tus necesidades (ej. password, role)
}

const userSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  // password: { type: String, required: true }, // Si manejas autenticaci\u00F3n
  // role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true }); // Para tener createdAt y updatedAt autom\u00E1ticamente

const User = mongoose.model<IUser>('User', userSchema);
export default User;