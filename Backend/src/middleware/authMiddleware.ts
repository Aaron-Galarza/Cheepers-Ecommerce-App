// Backend/src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User, { IUser } from '../models/User';
import rateLimit from 'express-rate-limit';

// Extiende la interfaz Request de Express para añadir el usuario autenticado
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

interface DecodedToken extends JwtPayload {
    id: string;
    isAdmin: boolean;
    isOwner: boolean;
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!process.env.JWT_SECRET) {
                res.status(500);
                throw new Error('JWT_SECRET no está definido.');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                res.status(401);
                throw new Error('Usuario no encontrado');
            }

            req.user = user;
            next();

        } catch (error: any) {
            console.error('Error de autenticación:', error.message);
            res.status(401);
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expirado. Por favor, inicie sesión de nuevo.');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Token inválido. Por favor, inicie sesión de nuevo.');
            } else {
                throw new Error('No autorizado, token fallido');
            }
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('No autorizado, no hay token');
    }
});

export const admin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && (req.user.isAdmin || req.user.isOwner)) {
        next();
    } else {
        res.status(403);
        throw new Error('No autorizado como administrador');
    }
};

export const owner = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.isOwner) {
        next();
    } else {
        res.status(403);
        throw new Error('No autorizado como dueño');
    }
};

export const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: 'Demasiados intentos de login fallidos desde esta IP, por favor, intenta de nuevo en 15 minutos.'
});