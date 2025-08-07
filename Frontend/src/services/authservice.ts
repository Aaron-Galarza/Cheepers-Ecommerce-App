// src/services/authService.ts
import axios from 'axios';
import { toast } from 'react-toastify'; // Importa toast para mostrar mensajes
const API_BASE_URL = import.meta.env.VITE_API_URL;
const ADMIN_TOKEN_KEY = 'adminToken';

// Interceptor de solicitudes (ya lo tienes)
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

// =========================================================================
// NUEVO: Interceptor de respuestas para manejar errores HTTP
// =========================================================================
axios.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, la pasa
  (error) => {
    // Si hay un error en la respuesta
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message || 'Ocurrió un error inesperado.';

      switch (statusCode) {
        case 400:
          // Bad Request (ej. validación de input fallida en backend)
          toast.error(`Error de datos: ${errorMessage}`, { position: "top-center" });
          break;
        case 401:
          // Unauthorized (ej. token inválido o expirado)
          // La lógica de authService.isAuthenticated() ya maneja la redirección y toast para 'expired'/'invalid'
          // Si llega aquí, es un 401 de otra API.
          console.error("Error 401 en solicitud API:", error.config?.url);
          // authService.logout('expired'); // Podrías forzar el logout aquí también si no lo hace isAuthenticated()
          // toast.error('Tu sesión ha expirado o es inválida. Por favor, inicia sesión nuevamente.', { position: "top-center" });
          break;
        case 403:
          // Forbidden (ej. usuario no tiene permisos para esa acción)
          toast.error(`Acceso denegado: ${errorMessage}`, { position: "top-center" });
          break;
        case 404:
          // Not Found
          toast.error(`Recurso no encontrado: ${errorMessage}`, { position: "top-center" });
          break;
        case 500:
          // Internal Server Error
          toast.error(`Error del servidor: ${errorMessage}. Por favor, intenta más tarde.`, { position: "top-center" });
          break;
        default:
          // Otros errores HTTP o de red
          toast.error(`Error de conexión: ${errorMessage}`, { position: "top-center" });
          break;
      }
    } else {
      // Errores que no son de Axios (ej. problemas de red antes de la solicitud)
      toast.error('Ocurrió un error de red. Por favor, revisa tu conexión.', { position: "top-center" });
    }
    
    // Es importante rechazar la promesa para que el bloque catch del componente que hizo la llamada
    // pueda seguir manejando el error si es necesario.
    return Promise.reject(error);
  }
);

// ... el resto de tu authService (login, logout, isAuthenticated, etc.) ...

const authService = {
  // ... tus funciones login, logout, getToken, isAuthenticated ...
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
        // Si el backend no devuelve un error HTTP sino un success:false
        throw new Error(response.data.message || 'Credenciales inválidas');
      }
    } catch (error) {
      // El interceptor de respuesta ya mostrará el toast para errores Axios
      // Aquí solo re-lanzamos para que el componente que llama pueda manejarlo si quiere
      throw error; 
    }
  },

  /**
   * Cierra la sesión del administrador.
   * Elimina el token de localStorage.
   * @param {string} [reason] - Un motivo opcional para el cierre de sesión (ej. 'expired').
   */
  logout: (reason?: string): void => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    if (reason) {
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
      return false;
    }

    try {
      const decodedToken = decodeJwt(adminToken);

      if (!decodedToken || typeof decodedToken.exp !== 'number') {
        console.warn("JWT en localStorage es inválido o sin 'exp' claim. Eliminando token.");
        authService.logout('invalid');
        return false;
      }

      const currentTimeInSeconds = Date.now() / 1000;

      if (decodedToken.exp < currentTimeInSeconds) {
        console.log("JWT expirado en el frontend. Eliminando token.");
        authService.logout('expired');
        return false;
      }

      return true;

    } catch (error) {
      console.error("Error al verificar la validez del JWT en frontend:", error);
      authService.logout('invalid');
      return false;
    }
  },
};

// Helper para decodificar la parte del payload de un JWT
const decodeJwt = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default authService;
