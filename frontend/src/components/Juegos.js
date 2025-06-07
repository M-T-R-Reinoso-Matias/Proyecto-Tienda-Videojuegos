import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Juegos() {
  const [juegos, setJuegos] = useState([]);
  const [nuevoJuego, setNuevoJuego] = useState({ nombre: '', plataforma: '', categoria: '', stock: 0 });
  const [editarId, setEditarId] = useState(null);

  const fetchJuegos = async () => {
    const res = await api.get('/juegos');
    setJuegos(res.data);
  };

  useEffect(() => {
    fetchJuegos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoJuego({ ...nuevoJuego, [name]: value });
  };

  const agregarJuego = async () => {
  const { nombre, plataforma, categoria, stock } = nuevoJuego;

  if (!nombre.trim() || !plataforma.trim() || !categoria.trim() || isNaN(stock) || stock < 0) {
    alert('⚠️ Todos los campos son obligatorios y el stock debe ser un número no negativo.');
    return;
  }

  try {
    await api.post('/juegos', { nombre, plataforma, categoria, stock: Number(stock) });
    setNuevoJuego({ nombre: '', plataforma: '', categoria: '', stock: 0 });
    fetchJuegos();
    alert('✅ Juego agregado');
  } catch (err) {
    console.error(err);
    alert('❌ Error del servidor: ' + (err.response?.data?.error || err.message));
  }
};


  const eliminarJuego = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este juego?')) {
      await api.delete(`/juegos/${id}`);
      fetchJuegos();
    }
  };

  const iniciarEdicion = (juego) => {
    setEditarId(juego._id);
    setNuevoJuego({
      nombre: juego.nombre,
      plataforma: juego.plataforma,
      categoria: juego.categoria,
      stock: juego.stock
    });
  };

  const guardarEdicion = async () => {
    try {
      await api.put(`/juegos/${editarId}`, nuevoJuego);
      setEditarId(null);
      setNuevoJuego({ nombre: '', plataforma: '', categoria: '', stock: 0 });
      fetchJuegos();
      alert('✅ Juego actualizado');
    } catch (err) {
      alert('❌ Error: ' + err.response.data.error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Juegos Físicos</h2>

      <input name="nombre" placeholder="Nombre" value={nuevoJuego.nombre} onChange={handleChange} />
      <input name="plataforma" placeholder="Plataforma" value={nuevoJuego.plataforma} onChange={handleChange} />
      <input name="categoria" placeholder="Categoría" value={nuevoJuego.categoria} onChange={handleChange} />
      <input name="stock" type="number" placeholder="Stock" value={nuevoJuego.stock} onChange={handleChange} />

      {editarId ? (
        <button onClick={guardarEdicion}>Guardar</button>
      ) : (
        <button onClick={agregarJuego}>Agregar</button>
      )}

      <ul>
        {juegos.map(j => (
          <li key={j._id}>
            <strong>{j.nombre}</strong> - {j.plataforma} - {j.categoria} - Stock: {j.stock}
            <button onClick={() => iniciarEdicion(j)}>Editar</button>
            <button onClick={() => eliminarJuego(j._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Juegos;
