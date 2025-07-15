// src/services/authService.ts
import axios from 'axios';

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';
const ADMIN_TOKEN_KEY = 'adminToken'; // Clave para el token en localStorage

// Configurar una instancia de Axios para la API, si es necesario,
// o configurar el interceptor directamente en la instancia global de Axios.
// Para simplificar, lo haremos directamente en la instancia global de Axios.

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
   */
  logout: (): void => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    // Opcional: Si tu backend tiene un endpoint de logout para invalidar el token en el servidor,
    // lo llamarías aquí. Por ahora, solo es logout del lado del cliente.
  },

  /**
   * Obtiene el token de autenticación del administrador.
   * @returns El token de autenticación o null si no existe.
   */
  getToken: (): string | null => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  /**
   * Verifica si el administrador está autenticado.
   * @returns true si el token existe, false en caso contrario.
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(ADMIN_TOKEN_KEY);
  },
};

export default authService;
