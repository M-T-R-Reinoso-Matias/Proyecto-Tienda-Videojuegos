import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Juegos() {
  const [juegos, setJuegos] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: '', categoria: '', plataforma: '', stock: 0 });

  const cargarJuegos = async () => {
    const res = await api.get('/juegos');
    setJuegos(res.data);
  };

  useEffect(() => {
    cargarJuegos();
  }, []);

  const agregarJuego = async () => {
    if (!nuevo.nombre) return alert('Nombre es obligatorio');
    await api.post('/juegos', nuevo);
    setNuevo({ nombre: '', categoria: '', plataforma: '', stock: 0 });
    cargarJuegos();
  };

  const eliminarJuego = async (id) => {
    await api.delete(`/juegos/${id}`);
    cargarJuegos();
  };

  const actualizarJuego = async (id, campo, valor) => {
    const actualizado = juegos.find(j => j._id === id);
    if (!actualizado) return;

    actualizado[campo] = valor;
    await api.put(`/juegos/${id}`, actualizado);
    cargarJuegos();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📦 Juegos Físicos</h2>

      <div>
        <input placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} />
        <input placeholder="Categoría" value={nuevo.categoria} onChange={e => setNuevo({ ...nuevo, categoria: e.target.value })} />
        <input placeholder="Plataforma" value={nuevo.plataforma} onChange={e => setNuevo({ ...nuevo, plataforma: e.target.value })} />
        <input type="number" min="0" value={nuevo.stock} onChange={e => setNuevo({ ...nuevo, stock: parseInt(e.target.value) })} />
        <button onClick={agregarJuego}>Agregar Juego</button>
      </div>

      <ul>
        {juegos.map(juego => (
          <li key={juego._id}>
            <strong>{juego.nombre}</strong> | {juego.categoria} | {juego.plataforma} | Stock: 
            <input
              type="number"
              value={juego.stock}
              onChange={e => actualizarJuego(juego._id, 'stock', parseInt(e.target.value))}
              style={{ width: '60px', marginLeft: '0.5rem' }}
            />
            <button onClick={() => eliminarJuego(juego._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Juegos;
