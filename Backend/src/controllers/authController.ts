// Backend/src/controllers/authController.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User'; // Aseg\u00FArate que la ruta a tu modelo User es correcta
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

declare module 'express-serve-static-core' {
    interface Request {
        rateLimit?: {
            reset: () => void;
        };
    }
}

// Helper para generar el token JWT (si no lo tienes, a\u00F1adelo)
const generateToken = (id: string, email: string, isAdmin: boolean, isOwner: boolean) => {
    return jwt.sign(
        { id, email, isAdmin, isOwner }, // Incluimos isAdmin en el payload del token
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' } // El token expirar\u00E1 en 1 hora
    );
};

// Funci\u00F3n para registrar un nuevo usuario/negocio
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password, isAdmin } = req.body;

    // Validaci\u00F3n b\u00E1sica
    if (!username || !email || !password) {
        res.status(400).json({ message: 'Por favor, completa todos los campos' });
        return; // Importante para detener la ejecuci\u00F3n
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400).json({ message: 'El usuario ya existe con este email' });
        return;
    }

    // Crear el nuevo usuario
    const user = await User.create({
        username,
        email,
        password, // El pre-hook en el modelo hashear\u00E1 la contrase\u00F1a
        isAdmin: isAdmin || false // Aseg\u00FArate de que isAdmin sea booleano
    });

    if (user) {
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token: generateToken(user._id, user.email, user.isAdmin, user.isOwner), // Genera el token con isAdmin
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } else {
        res.status(400).json({ message: 'Datos de usuario inv\u00E1lidos' });
    }
});

// Funci\u00F3n para el login de usuario (incluye administradores)
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // 1. Validaci\u00F3n b\u00E1sica
    if (!email || !password) {
        res.status(400).json({ success: false, message: 'Por favor, ingresa email y contrase\u00F1a' });
        return;
    }

    // 2. Buscar usuario por email
    const user = await User.findOne({ email });

    // 3. Verificar si el usuario existe y si la contrase\u00F1a es correcta
    if (user && (await user.comparePassword(password))) {

 // --- AQUÍ ES DONDE AGREGAS LA LÍNEA PARA REINICIAR EL CONTADOR ---
        if (req.rateLimit) {
            req.rateLimit.reset();
        }

        // 4. Si las credenciales son v\u00E1lidas, generar JWT (incluyendo isAdmin)
        const token = generateToken(user._id, user.email, user.isAdmin, user.isOwner);

        // 5. Enviar respuesta de \u00E9xito
        res.status(200).json({
            success: true,
            message: 'Inicio de sesi\u00F3n exitoso',
            token,
            user: { // Puedes devolver datos del usuario (sin la contrase\u00F1a)
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin // \u00A1Importante: Enviamos isAdmin aqu\u00ED!
            }
        });
    } else {
        // Credenciales inv\u00E1lidas
        res.status(401).json({ success: false, message: 'Credenciales inv\u00E1lidas' });
    }
});