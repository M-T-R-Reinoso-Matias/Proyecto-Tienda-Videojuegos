// src/components/Clientes.js
import React, { useEffect, useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Clientes({ usuario }) {
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [compradores, setCompradores] = useState([]);
  const [nuevo, setNuevo] = useState({
    id_cliente: '',
    nombre: '',
    correo: '',
    telefono: '',
    direccion: ''
  });
  const [error, setError] = useState('');

  //const navigate = useNavigate();
  const esAdmin = usuario?.rol === 'admin';

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
      const res = await api.get('/usuarios/todos');
      setUsuarios(res.data);
    } catch (e) {
      console.error('Error al cargar usuarios:', e.message);
    }
  };

  const fetchCompradores = async () => {
    try {
      const res = await api.get('/clientes/compradores');
      setCompradores(res.data);
    } catch (e) {
      console.error('Error al cargar compradores:', e.message);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (esAdmin) {
      fetchUsuarios();
      fetchCompradores();
    }
  }, [esAdmin]);

  const agregar = async () => {
  setError('');

  const correoIngresado = nuevo.correo.toLowerCase();

  const correoYaEsCliente = clientes.some(c => c.correo.toLowerCase() === correoIngresado);
  const correoYaEsUsuario = usuarios.some(u => u.email.toLowerCase() === correoIngresado);

  if (correoYaEsCliente) {
    setError('⚠️ Ya existe un cliente con ese correo.');
    return;
  }

  if (correoYaEsUsuario) {
    setError('⚠️ Ese correo ya está registrado como usuario. No se puede crear un cliente duplicado.');
    return;
  }

  try {
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
    if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;
    try {
      await api.delete(`/clientes/${id}`);
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (e) {
      console.error('Error al eliminar cliente:', e.message);
    }
  };

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
              {usuarios.map((u, i) => {
                const esCliente = clientes.some(c => c.correo === u.email);
                const esComprador = compradores.some(c => c.correo === u.email);
                return (
                  <li key={u._id || u.email || i}>
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
              {compradores.map((c, i) => (
                <li key={c._id || c.correo || i}>
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
          {clientes.map((c, i) => (
            <li key={c._id || c.correo || i}>
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
    </div>
  );
}


