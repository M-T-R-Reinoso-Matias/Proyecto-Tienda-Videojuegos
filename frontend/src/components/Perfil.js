// src/components/Perfil.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Perfil() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    async function cargarPerfil() {
      try {
        const res = await api.get('/usuarios/me');
        setForm(res.data);
      } catch (err) {
        console.error('Error al cargar perfil:', err);
      }
    }
    cargarPerfil();
  }, []);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.put('/usuarios/me', form);
      setMensaje('Perfil actualizado correctamente');
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setMensaje('Error al actualizar');
    }
  };


  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Mi Perfil</h2>
      {mensaje && <p>{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre</label><br/>
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </div>
        <div>
          <label>Email</label><br/>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Teléfono</label><br/>
          <input name="telefono" value={form.telefono} onChange={handleChange} required />
        </div>
        <div>
          <label>Dirección</label><br/>
          <input name="direccion" value={form.direccion} onChange={handleChange} required />
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>Guardar cambios</button>
        <button style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>⬅️ Volver </button>
      </form>
    </div>
  );
}
