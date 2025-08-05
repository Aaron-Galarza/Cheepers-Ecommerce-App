import React, { useState, useEffect } from 'react';
import styles from './../css/adminlogin.module.css';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authservice'; // Importa el servicio de autenticación
import { ToastContainer, toast } from 'react-toastify'; // Importa ToastContainer y toast
import 'react-toastify/dist/ReactToastify.css'; // Importa los estilos de react-toastify
import axios from 'axios'; // Importa axios para manejar errores de red específicos de Axios

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Mantenemos este estado para errores de login directos
  const [loading, setLoading] = useState(false); // Añadido estado de carga para el botón
  const navigate = useNavigate();

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
      navigate('/admin/dashboard', { replace: true }); // Redirige al dashboard después del login
    } catch (err: any) { // Captura el error para mostrarlo
      console.error('Error al iniciar sesión:', err);
      // Determina el mensaje de error basado en el tipo de error
      const errorMessage = axios.isAxiosError(err) && err.response
        ? err.response.data.message || 'Credenciales inválidas.' // Mensaje del backend o genérico
        : 'Error de conexión. Intenta de nuevo.'; // Error de red
      
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
        {error && <p className={styles.error}>{error}</p>} 
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'} {/* Cambia el texto del botón según el estado de carga */}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;