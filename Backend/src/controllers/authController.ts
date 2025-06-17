// Backend/src/controllers/authController.ts

import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

// Funci\u00F3n auxiliar para generar JWT (lo usaremos en login y quiz\u00E1 en registro)
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '1h', // El token expirar\u00E1 en 1 hora
  });
};

// @desc    Registrar un nuevo usuario/negocio
// @route   POST /api/negocio/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password, isAdmin } = req.body;

  try {
    // 1. Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe con ese email.' });
    }

    // 2. Crear el nuevo usuario
    const user = await User.create({
      username,
      email,
      password, // La contrase\u00F1a se hashear\u00E1 autom\u00E1ticamente por el pre-hook del modelo
      isAdmin: isAdmin || false // Asegurarse que isAdmin tenga un valor, por defecto false
    });

    // 3. Respuesta exitosa y generar JWT
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id), // Generar JWT para el nuevo usuario
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario inv\u00E1lidos.' });
    }
  } catch (error: any) {
    console.error('Error en el registro:', error);
    if (error.code === 11000) { // C\u00F3digo de error de MongoDB para duplicados (username o email)
        res.status(400).json({ message: 'El nombre de usuario o email ya est\u00E1 registrado.' });
    } else {
        res.status(500).json({ message: 'Error en el servidor al registrar el usuario.', error: error.message });
    }
  }
};

// @desc    Autenticar un usuario/negocio y obtener token
// @route   POST /api/negocio/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body; // Ahora usaremos email para el login

  try {
    // 1. Verificar si el usuario existe por email
    const user = await User.findOne({ email });

    // 2. Verificar la contrase\u00F1a
    if (user && (await user.comparePassword(password))) {
      // 3. Si las credenciales son correctas, enviar datos de usuario y un token
      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id), // Generar JWT
      });
    } else {
      res.status(401).json({ message: 'Email o contrase\u00F1a incorrectos.' });
    }
  } catch (error: any) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error en el servidor al iniciar sesi\u00F3n.', error: error.message });
  }
};