
import React, { useState } from 'react';
import styles from './adminlogin.module.css';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authservice'; // Importa el nuevo servicio

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await authService.login(email, password); // Usa el servicio de autenticación
      navigate('/admin/dashboard');
    } catch (err: any) { // Captura el error para mostrarlo
      console.error('Error al iniciar sesión:', err);
      setError(err.message || 'Error del servidor. Intenta nuevamente.');
    }
  };

  return (
    <div className={styles.loginContainer}>
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
        <button type="submit" className={styles.button}>
          Ingresar
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
