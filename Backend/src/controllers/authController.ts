import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler'; // Importamos asyncHandler

// Interfaz para el cuerpo de la solicitud de login
interface LoginRequestBody {
  username: string;
  password: string;
}

// Valores hardcodeados para la simulación de login
const HARDCODED_USERNAME = 'admin';
const HARDCODED_PASSWORD = 'password123'; // ¡En un proyecto real, nunca hardcodees contrase\u00F1as as\u00ED!

export const loginAdmin = asyncHandler(async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  const { username, password } = req.body;

  // Validaci\u00F3n b\u00E1sica de campos
  if (!username || !password) {
    res.status(400).json({ message: 'Se requiere nombre de usuario y contrase\u00F1a.' });
    return;
  }

  // Simular la validaci\u00F3n de credenciales
  if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
    // Si las credenciales coinciden
    res.status(200).json({
      message: 'Login exitoso (simulado).',
      user: {
        username: username,
        role: 'admin', // Puedes a\u00F1adir un rol simulado
        // En un futuro, aqu\u00ED enviar\u00EDamos el token JWT
      },
    });
  } else {
    // Si las credenciales no coinciden
    res.status(401).json({ message: 'Credenciales inv\u00E1lidas (simuladas).' });
  }
});

// Puedes a\u00F1adir m\u00E1s funciones aqu\u00ED en el futuro, como registerAdmin, etc.