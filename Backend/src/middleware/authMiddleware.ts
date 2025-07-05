// Backend/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User, { IUser } from '../models/User'; // Aseg\u00FArate de importar tu modelo de usuario

// Extiende la interfaz Request de Express para a\u00F1adir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Define que 'user' puede ser un IUser o undefined
    }
  }
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // 1. Verificar si el token est\u00E1 presente en los headers de autorizaci\u00F3n
  // El token se suele enviar como "Bearer TOKEN_AQUI"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extraer el token
      token = req.headers.authorization.split(' ')[1];

      // 3. Verificar el token
      // Aseg\u00FArate que JWT_SECRET est\u00E1 definido
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET no est\u00E1 definido en las variables de entorno.');
      }
      
      // Decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string, email: string, isAdmin: boolean };

      // 4. Buscar el usuario en la base de datos y adjuntarlo a la request
      // Excluye la contrase\u00F1a al buscar el usuario
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401); // No autorizado
        throw new Error('Usuario no encontrado');
      }

      req.user = user; // Adjunta el usuario a la request para que est\u00E9 disponible en las rutas protegidas
      next(); // Pasa al siguiente middleware o a la funci\u00F3n de la ruta

    } catch (error: any) {
      console.error('Error de autenticaci\u00F3n:', error.message);
      res.status(401); // No autorizado
      // Mensajes m\u00E1s espec\u00EDficos para el cliente
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado. Por favor, inicie sesi\u00F3n de nuevo.');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inv\u00E1lido. Por favor, inicie sesi\u00F3n de nuevo.');
      } else {
        throw new Error('No autorizado, token fallido');
      }
    }
  }

  // Si no hay token en los headers
  if (!token) {
    res.status(401); // No autorizado
    throw new Error('No autorizado, no hay token');
  }
});

// Middleware para verificar si el usuario es administrador
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next(); // Si es admin, pasa al siguiente
  } else {
    res.status(403); // Prohibido (Forbidden)
    throw new Error('No autorizado como administrador');
  }
};