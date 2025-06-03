import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nuevo, setNuevo] = useState({ id_cliente: '', nombre: '', correo: '', telefono: '', direccion: '' });
  const [error, setError] = useState('');

  const fetch = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (e) {
      console.error('Error al cargar clientes:', e.message);
    }
  };

  useEffect(() => { fetch(); }, []);

  const agregar = async () => {
    try {
      setError(''); // Limpiar mensaje anterior
      await api.post('/clientes', nuevo);
      fetch();
    } catch (e) {
      if (e.response && e.response.status === 400) {
        setError(e.response.data.error); // Mostrar mensaje del backend
      } else {
        setError('Error del servidor al agregar cliente');
      }
    }
  };

  const eliminar = async (id) => {
    try {
      await api.delete(`/clientes/${id}`);
      fetch();
    } catch (e) {
      console.error('Error al eliminar cliente:', e.message);
    }
  };

  return (
    <div>
      <h2>Clientes</h2>
      <ul>
        {clientes.map(c => (
          <li key={c._id}>
            {c.nombre} - {c.correo} {' '}
            <button onClick={() => eliminar(c._id)}>Eliminar</button>
          </li>
        ))}
      </ul>

      <h3>Agregar Cliente</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input placeholder="ID" onChange={e => setNuevo({ ...nuevo, id_cliente: e.target.value })} />
      <input placeholder="Nombre" onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} />
      <input placeholder="Correo" onChange={e => setNuevo({ ...nuevo, correo: e.target.value })} />
      <input placeholder="Teléfono" onChange={e => setNuevo({ ...nuevo, telefono: e.target.value })} />
      <input placeholder="Dirección" onChange={e => setNuevo({ ...nuevo, direccion: e.target.value })} />
      <button onClick={agregar}>Agregar</button>
    </div>
  );
}
