// src/pages/AdminLogin.tsx
import React, { useState } from 'react';
import styles from './adminlogin.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/negocio/login`, {
        email,
        password
      });

      if (response.data.success) {
        // Podés guardar el token en localStorage si es necesario
        localStorage.setItem('adminToken', response.data.token);
        navigate('/admin/dashboard');
      } else {
        setError(response.data.message || 'Credenciales inválidas');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Error del servidor. Intenta nuevamente.');
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
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Ingresar
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
