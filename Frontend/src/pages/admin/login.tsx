import React, { useState, useEffect } from 'react';
import styles from './../css/adminlogin.module.css';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authservice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const MAX_FAILED_ATTEMPTS = 5; // Límite de intentos fallidos (igual que en el backend)
const LOCKOUT_TIME_MINUTES = 15; // Tiempo de bloqueo en minutos (para el mensaje)

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Mantenemos este estado para errores de login directos
  const [loading, setLoading] = useState(false); // Añadido estado de carga para el botón
  const navigate = useNavigate();

  // NUEVOS ESTADOS PARA LA LÓGICA DE INTENTOS FALLIDOS
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  // isLockedOut solo se usará para el mensaje, no para deshabilitar inputs/botón en el frontend
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);

  useEffect(() => {
    // Verifica si hay un motivo de cierre de sesión en sessionStorage
    const logoutReason = sessionStorage.getItem('logoutReason');
    if (logoutReason) {
      if (logoutReason === 'expired') {
        // Muestra el mensaje de advertencia para sesión expirada
        toast.warn('⚠️ Tu sesión expiró, iniciá sesión nuevamente.', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else if (logoutReason === 'invalid') {
        // Muestra un mensaje de error para token inválido/corrupto
        toast.error('❌ Sesión inválida o corrupta. Por favor, iniciá sesión nuevamente.', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
      // Limpia el motivo de sessionStorage para que no se muestre de nuevo en futuras visitas
      sessionStorage.removeItem('logoutReason');
    }

    // Si el usuario ya está autenticado (por ejemplo, al recargar la página con un token válido),
    // redirige directamente al dashboard.
    if (authService.isAuthenticated()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]); // 'navigate' como dependencia para asegurar que el efecto se ejecute si cambia

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Activa el estado de carga
    setError(''); // Limpia cualquier error previo

    try {
      await authService.login(email, password); // Usa el servicio de autenticación
      toast.success('¡Inicio de sesión exitoso!', { position: "top-center" }); // Mensaje de éxito
      setFailedAttempts(0); // Resetear intentos al éxito
      setIsLockedOut(false); // Asegurarse de que no esté bloqueado
      navigate('/admin/dashboard', { replace: true }); // Redirige al dashboard después del login
    } catch (err: any) { // Captura el error para mostrarlo
      console.error('Error al iniciar sesión:', err);
      
      // Incrementar el contador de intentos fallidos
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      let errorMessage: string;

      // Determina el mensaje de error basado en el tipo de error y los intentos
      if (axios.isAxiosError(err) && err.response) {
        // Si el backend ya indica un bloqueo (ej. 429 Too Many Requests o mensaje específico)
        if (err.response.status === 429 || err.response.data.message?.includes('bloqueada temporalmente')) {
          errorMessage = err.response.data.message; // Usar el mensaje del backend si ya indica bloqueo
          setIsLockedOut(true); // Actualizar estado local para el mensaje
        } else if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
          // Si alcanzamos el límite de intentos en el frontend
          setIsLockedOut(true); // Activar el estado de bloqueo para el mensaje
          errorMessage = `Demasiados intentos fallidos. Tu cuenta estará bloqueada por ${LOCKOUT_TIME_MINUTES} minutos.`;
        } else {
          // Mensaje de intentos restantes
          const attemptsLeft = MAX_FAILED_ATTEMPTS - newFailedAttempts;
          errorMessage = `Credenciales inválidas. Te quedan ${attemptsLeft} intento${attemptsLeft !== 1 ? 's' : ''}.`;
        }
      } else {
        // Error de conexión o desconocido
        errorMessage = 'Error de conexión. Intenta de nuevo.';
      }
      
      setError(errorMessage); // Muestra el error en el párrafo existente
      toast.error(`Error: ${errorMessage}`, { position: "top-center" }); // También muestra el error con toast
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* ToastContainer debe estar presente en tu componente raíz o en este 
          para que los toasts se muestren. No afecta tus estilos de formulario.
      */}
      <ToastContainer /> 
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <h2 className={styles.title}>Login Administrador</h2>
        {/* El mensaje de error se mostrará aquí y también en el toast */}
        {error && <p className={styles.error}>{error}</p>} 
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
          disabled={loading} // Solo deshabilitado si está cargando
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
          disabled={loading} // Solo deshabilitado si está cargando
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'} {/* Cambia el texto del botón según el estado de carga */}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
