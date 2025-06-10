import React, { useEffect, useState } from 'react';
import api from '../services/api';

const clickSound = new Audio('/mario-level-up-app.mp3');

const handleClick = () => {
  clickSound.play();
};

export default function Juegos() {
  const [juegos, setJuegos] = useState([]);
  const [nuevo, setNuevo] = useState({
    nombre: '', plataforma: '', categoria: '', precio: 0, stock: 0
  });
  const [editando, setEditando] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [filtroSinStock, setFiltroSinStock] = useState(false);

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const token = localStorage.getItem('token');
  const esAdmin = usuario?.rol === 'admin';

  const fetch = async () => {
    try {
      const res = await api.get('/juegos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJuegos(res.data);
    } catch (error) {
      console.error('Error al cargar juegos:', error);
    }
  };

  useEffect(() => { fetch(); }, []);

  const agregar = async () => {
    if (!nuevo.nombre || !nuevo.plataforma || !nuevo.categoria || nuevo.precio <= 0 || nuevo.stock < 0) {
      alert('⚠️ Completa todos los campos correctamente.\n- Todos son obligatorios.\n- Precio mayor a 0.\n- Stock no negativo.');
      return;
    }

    try {
      await api.post('/juegos', nuevo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetch();
      setNuevo({ nombre: '', plataforma: '', categoria: '', precio: 0, stock: 0 });
      alert('✅ Juego agregado correctamente.');
    } catch (error) {
      console.error('Error al agregar juego:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const eliminar = async (id) => {
    if (!esAdmin) return alert('🔒 Solo el administrador puede eliminar.');
    if (window.confirm('¿Seguro que deseas eliminar este juego?')) {
      try {
        await api.delete(`/juegos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetch();
      } catch (error) {
        console.error('Error al eliminar juego:', error);
        alert('Error al eliminar: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const actualizar = async (id, datosActualizados) => {
    if (!datosActualizados.nombre || !datosActualizados.plataforma || !datosActualizados.categoria ||
        datosActualizados.precio <= 0 || datosActualizados.stock < 0) {
      alert('⚠️ Los campos de edición no son válidos.');
      return;
    }

    try {
      await api.put(`/juegos/${id}`, datosActualizados, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Juego actualizado correctamente.');
      fetch();
      setEditando((prev) => ({ ...prev, [id]: false }));
    } catch (error) {
      console.error('Error al actualizar juego:', error);
      alert('Error al actualizar: ' + (error.response?.data?.error || error.message));
    }
  };

  const manejarCambio = (id, campo, valor) => {
    setEditando((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: campo === 'precio' || campo === 'stock' ? +valor : valor }
    }));
  };

  const empezarEdicion = (juego) => {
    setEditando((prev) => ({
      ...prev,
      [juego._id]: { ...juego }
    }));
  };

  const cancelarEdicion = (id) => {
    setEditando((prev) => ({ ...prev, [id]: false }));
  };

  // 🔍 Lógica de búsqueda y filtro sin stock (corregida para evitar error)
  const juegosFiltrados = juegos.filter(j =>
    (j.nombre || '').toLowerCase().includes((busqueda || '').toLowerCase()) &&
    (!filtroSinStock || j.stock === 0)
  );

  return (
    <div>
      <h2>🎮 Juegos Físicos</h2>

      {/* 🔍 Búsqueda */}
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />

      {/* 🚫 Filtro sin stock */}
      <label style={{ marginLeft: '10px' }}>
        <input
          type="checkbox"
          checked={filtroSinStock}
          onChange={e => setFiltroSinStock(e.target.checked)}
        />
        Mostrar solo juegos sin stock
      </label>

      <table border="1" cellPadding="5" style={{ marginTop: '10px' }}>
        <thead>
          <tr>
            <th>ID Juego</th>
            <th>Nombre</th>
            <th>Plataforma</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            {esAdmin && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {juegosFiltrados.map(j => (
            <tr key={j._id}>
              <td>{j.id_juego}</td>
              {editando[j._id] ? (
                <>
                  <td><input value={editando[j._id].nombre} onChange={e => manejarCambio(j._id, 'nombre', e.target.value)} /></td>
                  <td><input value={editando[j._id].plataforma} onChange={e => manejarCambio(j._id, 'plataforma', e.target.value)} /></td>
                  <td><input value={editando[j._id].categoria} onChange={e => manejarCambio(j._id, 'categoria', e.target.value)} /></td>
                  <td><input type="number" value={editando[j._id].precio} onChange={e => manejarCambio(j._id, 'precio', e.target.value)} /></td>
                  <td><input type="number" value={editando[j._id].stock} onChange={e => manejarCambio(j._id, 'stock', e.target.value)} /></td>
                </>
              ) : (
                <>
                  <td>{j.nombre}</td>
                  <td>{j.plataforma}</td>
                  <td>{j.categoria}</td>
                  <td>${j.precio}</td>
                  <td>{j.stock}</td>
                </>
              )}
              {esAdmin && (
                <td>
                  {editando[j._id] ? (
                    <>
                      <button onClick={() => actualizar(j._id, editando[j._id])}>Guardar</button>
                      <button onClick={() => cancelarEdicion(j._id)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => empezarEdicion(j)}>Editar</button>
                      <button onClick={() => eliminar(j._id)}>Eliminar</button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {esAdmin && (
        <>
          <h3>Agregar Nuevo Juego</h3>
          <input placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} />
          <input placeholder="Plataforma" value={nuevo.plataforma} onChange={e => setNuevo({ ...nuevo, plataforma: e.target.value })} />
          <input placeholder="Categoría" value={nuevo.categoria} onChange={e => setNuevo({ ...nuevo, categoria: e.target.value })} />
          <input type="number" placeholder="Precio" value={nuevo.precio} onChange={e => setNuevo({ ...nuevo, precio: +e.target.value })} />
          <input type="number" placeholder="Stock" value={nuevo.stock} onChange={e => setNuevo({ ...nuevo, stock: +e.target.value })} />
          <button onClick={() => { handleClick(); agregar(); }}>Agregar</button>
        </>
      )}
    </div>
  );
}







