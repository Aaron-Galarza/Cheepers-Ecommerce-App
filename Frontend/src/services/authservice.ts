// src/services/authService.ts
import axios from 'axios';

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';
const ADMIN_TOKEN_KEY = 'adminToken'; // Clave para el token en localStorage

// Interceptor de solicitudes de Axios: Adjunta el token a cada request saliente
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * @function decodeJwt
 * @description Decodifica la parte del payload de un JWT sin verificar la firma.
 * Esto es seguro para obtener claims públicos como 'exp'.
 * @param {string} token - El JWT completo.
 * @returns {any | null} El payload decodificado del JWT o null si hay un error.
 */
const decodeJwt = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1]; // Obtener la parte del payload
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decodificando JWT en frontend:", e);
    return null;
  }
};


const authService = {
  /**
   * Inicia sesión del administrador.
   * @param email - El correo electrónico del administrador.
   * @param password - La contraseña del administrador.
   * @returns Una promesa que resuelve con el token si el login es exitoso.
   */
  login: async (email: string, password: string): Promise<string> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/negocio/login`, {
        email,
        password,
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, response.data.token);
        return response.data.token;
      } else {
        throw new Error(response.data.message || 'Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error en authService.login:', error);
      throw error; // Re-lanza el error para que el componente que llama lo maneje
    }
  },

  /**
   * Cierra la sesión del administrador.
   * Elimina el token de localStorage.
   * @param {string} [reason] - Un motivo opcional para el cierre de sesión (ej. 'expired').
   */
  logout: (reason?: string): void => { // <-- CAMBIO AQUÍ: Añade 'reason'
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    if (reason) {
      // Puedes almacenar el motivo en sessionStorage para que persista UNA VEZ
      // y sea leído por la página de login.
      sessionStorage.setItem('logoutReason', reason);
    }
  },

  /**
   * Obtiene el token de autenticación del administrador.
   * @returns El token de autenticación o null si no existe.
   */
  getToken: (): string | null => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  /**
   * Verifica si el administrador está autenticado y si el token no ha expirado.
   * @returns true si el token existe y es válido (no expirado), false en caso contrario.
   */
  isAuthenticated: (): boolean => {
    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);

    if (!adminToken) {
      return false; // No hay token, no autenticado
    }

    try {
      const decodedToken = decodeJwt(adminToken);

      // Si no se pudo decodificar o no tiene la propiedad 'exp' (expiración)
      if (!decodedToken || typeof decodedToken.exp !== 'number') {
        console.warn("JWT en localStorage es inválido o sin 'exp' claim. Eliminando token.");
        authService.logout('invalid'); // <-- CAMBIO AQUÍ: Llama a logout con motivo 'invalid'
        return false;
      }

      // 'exp' es una marca de tiempo Unix en segundos.
      // Date.now() devuelve milisegundos, así que dividimos por 1000.
      const currentTimeInSeconds = Date.now() / 1000;

      if (decodedToken.exp < currentTimeInSeconds) {
        // El token ha expirado
        console.log("JWT expirado en el frontend. Eliminando token.");
        authService.logout('expired'); // <-- CAMBIO AQUÍ: Llama a logout con motivo 'expired'
        return false;
      }

      // El token existe y no ha expirado (según la verificación del frontend)
      return true;

    } catch (error) {
      // En caso de cualquier otro error al procesar el token, asumimos que es inválido
      console.error("Error al verificar la validez del JWT en frontend:", error);
      authService.logout('invalid'); // <-- CAMBIO AQUÍ: Llama a logout con motivo 'invalid'
      return false;
    }
  },
};

export default authService;
