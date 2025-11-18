// src/services/authService.ts
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Asegúrate de tener esto

const API_BASE_URL = import.meta.env.VITE_API_URL;
const ADMIN_TOKEN_KEY = 'adminToken';

// --- 1. CREAMOS EL CLIENTE API CENTRALIZADO ---
// Esta es la instancia de Axios que usará toda tu app de admin.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// --- 2. INTERCEPTOR DE SOLICITUD (AÑADIR TOKEN) ---
// Esto se ejecuta ANTES de cada llamada de 'apiClient'.
apiClient.interceptors.request.use(
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

// --- 3. INTERCEPTOR DE RESPUESTA (MANEJAR ERRORES GLOBALES) ---
// Esto se ejecuta DESPUÉS de cada respuesta de 'apiClient'.
apiClient.interceptors.response.use(
  (response) => response, // Pasa las respuestas exitosas (ej. 200)
  (error) => {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message || 'Ocurrió un error inesperado.';

      // Evitamos mostrar un toast global de "Sesión expirada" en la pantalla de Login
      if (error.config?.url?.includes('/api/negocio/login')) {
         // El componente Login se encargará de mostrar "Credenciales inválidas"
      } else {
        // Manejo global para todas las OTRAS llamadas
        switch (statusCode) {
          case 400:
            toast.error(`Error de datos: ${errorMessage}`, { position: "top-center" });
            break;
          case 401: // Unauthorized
            toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', { position: "top-center" });
            // Forzamos el logout y recargamos la página para ir al login
            authService.logout('expired');
            window.location.reload(); 
            break;
          case 403: // Forbidden
            toast.error(`Acceso denegado: ${errorMessage}`, { position: "top-center" });
            break;
          case 404:
            toast.error(`Recurso no encontrado: ${errorMessage}`, { position: "top-center" });
            break;
          case 500: // Server Error
            toast.error(`Error del servidor: ${errorMessage}.`, { position: "top-center" });
            break;
          default:
            toast.error(`Error: ${errorMessage}`, { position: "top-center" });
            break;
        }
      }
    } else {
      toast.error('Ocurrió un error de red. Revisa tu conexión.', { position: "top-center" });
    }
    
    // Rechazamos la promesa para que el '.catch()' en tu componente (ej. PuntosManagement)
    // también sepa que hubo un error.
    return Promise.reject(error);
  }
);


// --- 4. HELPER PARA DECODIFICAR JWT ---
// (Tu función, sin cambios)
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

// --- 5. SERVICIO DE AUTENTICACIÓN ---
// (Ahora usa 'apiClient' en lugar de 'axios' global)
const authService = {
  
  login: async (email: string, password: string): Promise<any> => {
    try {
      // Usamos 'apiClient' para la llamada
      const response = await apiClient.post(`/api/negocio/login`, {
        email,
        password,
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, response.data.token);
        return response.data; // Devolvemos la data (user, token)
      } else {
        // Si el backend responde 200 pero con error (ej. success: false)
        throw new Error(response.data.message || 'Credenciales inválidas');
      }
    } catch (error) {
      // El interceptor ya mostró el toast si fue 401, 500, etc.
      // Re-lanzamos el error para que el componente Login sepa que falló.
      throw error;
    }
  },

  logout: (reason?: string): void => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    if (reason) {
      sessionStorage.setItem('logoutReason', reason);
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);

    if (!adminToken) {
      return false;
    }

    try {
      const decodedToken = decodeJwt(adminToken);

      if (!decodedToken || typeof decodedToken.exp !== 'number') {
        console.warn("JWT en localStorage es inválido. Eliminando token.");
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
      console.error("Error al verificar la validez del JWT:", error);
      authService.logout('invalid');
      return false;
    }
  },
};

// --- 6. EXPORTACIONES ---
export default authService;

export { apiClient };