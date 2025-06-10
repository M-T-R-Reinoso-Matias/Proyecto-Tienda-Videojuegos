// src/components/Clientes.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Recibe `usuario` desde contexto o prop (asegúrate de pasarlo)
export default function Clientes({ usuario }) {
  /* ──────────── Estados ──────────── */
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);           // ← todos los usuarios del sistema
  const [compradores, setCompradores] = useState([]);     // ← clientes con compras
  const [nuevo, setNuevo] = useState({
    id_cliente: '',
    nombre: '',
    correo: '',
    telefono: '',
    direccion: ''
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const esAdmin = usuario?.rol === 'admin';

  /* ──────────── Fetch helpers ──────────── */
  const fetchClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (e) {
      console.error('Error al cargar clientes:', e.message);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');         // necesita ruta /api/usuarios
      setUsuarios(res.data);
    } catch (e) {
      console.error('Error al cargar usuarios:', e.message);
    }
  };

  const fetchCompradores = async () => {
    try {
      const res = await api.get('/clientes/compradores'); // necesita ruta /clientes/compradores
      setCompradores(res.data);
    } catch (e) {
      console.error('Error al cargar compradores:', e.message);
    }
  };

  /* ──────────── Efectos ──────────── */
  // Clientes (siempre)
  useEffect(() => {
    fetchClientes();
  }, []);

  // Datos extra para admin
  useEffect(() => {
    if (esAdmin) {
      fetchUsuarios();
      fetchCompradores();
    }
  }, [esAdmin]);

  /* ──────────── Acciones ──────────── */
  const agregar = async () => {
    try {
      setError('');
      await api.post('/clientes', nuevo);
      setNuevo({
        id_cliente: '',
        nombre: '',
        correo: '',
        telefono: '',
        direccion: ''
      });
      fetchClientes();
    } catch (e) {
      if (e.response?.status === 400) {
        setError(e.response.data.error);
      } else {
        setError('Error del servidor al agregar cliente');
      }
    }
  };

  const eliminar = async (id) => {
    try {
      await api.delete(`/clientes/${id}`);
      fetchClientes();
    } catch (e) {
      console.error('Error al eliminar cliente:', e.message);
    }
  };

  /* ──────────── Render ──────────── */
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Sección de Clientes</h1>

      {esAdmin && (
        <>
          <h2>👥 Usuarios registrados</h2>
          {usuarios.length === 0 ? (
            <p>No hay usuarios.</p>
          ) : (
            <ul>
                {usuarios.map(u => {
                    const esCliente = clientes.some(c => c.correo === u.email);
                    const esComprador = compradores.some(c => c.correo === u.email);

                    return (
                  <li key={u._id}>
                       {u.nombre} – {u.email} ({u.rol})
                       {esCliente && <span style={{ color: 'blue' }}> [Cliente]</span>}
                       {esComprador && <span style={{ color: 'green' }}> [Comprador]</span>}
                  </li>
    );
  })}
</ul>

          )}

          <h2>🛒 Clientes que realizaron compras</h2>
          {compradores.length === 0 ? (
            <p>Aún ningún cliente ha comprado.</p>
          ) : (
            <ul>
              {compradores.map(c => (
                <li key={c._id}>
                  {c.nombre} – {c.correo}
                </li>
              ))}
            </ul>
          )}

          <hr />
        </>
      )}

      <h2>📋 Lista de clientes</h2>
      {clientes.length === 0 ? (
        <p>No hay clientes.</p>
      ) : (
        <ul>
          {clientes.map(c => (
            <li key={c._id}>
              {c.nombre} – {c.correo}{' '}
              <button onClick={() => eliminar(c._id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ marginTop: '2rem' }}>➕ Agregar cliente manualmente</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form
        onSubmit={e => {
          e.preventDefault();
          agregar();
        }}
        style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '.5rem' }}
      >
        <input
          value={nuevo.id_cliente}
          placeholder="ID cliente"
          onChange={e => setNuevo({ ...nuevo, id_cliente: e.target.value })}
          required
        />
        <input
          value={nuevo.nombre}
          placeholder="Nombre"
          onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })}
          required
        />
        <input
          type="email"
          value={nuevo.correo}
          placeholder="Correo"
          onChange={e => setNuevo({ ...nuevo, correo: e.target.value })}
          required
        />
        <input
          value={nuevo.telefono}
          placeholder="Teléfono"
          onChange={e => setNuevo({ ...nuevo, telefono: e.target.value })}
        />
        <input
          value={nuevo.direccion}
          placeholder="Dirección"
          onChange={e => setNuevo({ ...nuevo, direccion: e.target.value })}
        />

        <button type="submit">Agregar</button>
      </form>

      <button style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
        ⬅️ Volver
      </button>
    </div>
  );
}


