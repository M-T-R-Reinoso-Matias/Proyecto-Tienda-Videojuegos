// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });

      // Guarda el token y el objeto completo del usuario
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));

      alert('✅ Inicio de sesión exitoso');

      // Redirección según el rol del usuario
      const rol = res.data.usuario.rol;
      if (rol === 'admin') {
        navigate('/admin');
      } else {
        navigate('/cliente');
      }
    } catch (err) {
      alert('❌ Error al iniciar sesión: ' + (err.response?.data?.error || 'Error desconocido'));
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default Login;


