import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Juegos() {
  const [juegos, setJuegos] = useState([]);
  const [nuevoJuego, setNuevoJuego] = useState({
    nombre: '',
    plataforma: '',
    categoria: '',
    stock: 0,
    precio: ''
  });
  const [editarId, setEditarId] = useState(null);

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const esAdmin = usuario?.rol === 'admin';

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
    const { nombre, plataforma, categoria, stock, precio } = nuevoJuego;

    if (
      !nombre.trim() || !plataforma.trim() || !categoria.trim() ||
      isNaN(stock) || stock < 0 ||
      isNaN(precio) || precio < 0
    ) {
      alert('⚠️ Todos los campos son obligatorios y los valores deben ser válidos.');
      return;
    }

    try {
      await api.post('/juegos', {
        nombre,
        plataforma,
        categoria,
        stock: Number(stock),
        precio: Number(precio)
      });
      setNuevoJuego({ nombre: '', plataforma: '', categoria: '', stock: 0, precio: '' });
      fetchJuegos();
      alert('✅ Juego agregado');
    } catch (err) {
      console.error(err);
      alert('❌ Error del servidor: ' + (err.response?.data?.error || err.message));
    }
  };

  const eliminarJuego = async (id) => {
    if (!esAdmin) return alert('🔒 Solo los administradores pueden eliminar.');
    if (window.confirm('¿Estás seguro de eliminar este juego?')) {
      await api.delete(`/juegos/${id}`);
      fetchJuegos();
    }
  };

  const iniciarEdicion = (juego) => {
    if (!esAdmin) return alert('🔒 Solo los administradores pueden editar.');
    setEditarId(juego._id);
    setNuevoJuego({
      nombre: juego.nombre,
      plataforma: juego.plataforma,
      categoria: juego.categoria,
      stock: juego.stock,
      precio: juego.precio
    });
  };

  const guardarEdicion = async () => {
    try {
      await api.put(`/juegos/${editarId}`, {
        ...nuevoJuego,
        stock: Number(nuevoJuego.stock),
        precio: Number(nuevoJuego.precio)
      });
      setEditarId(null);
      setNuevoJuego({ nombre: '', plataforma: '', categoria: '', stock: 0, precio: '' });
      fetchJuegos();
      alert('✅ Juego actualizado');
    } catch (err) {
      alert('❌ Error: ' + err.response?.data?.error);
    }
  };

  const agregarAlCarrito = async (juego) => {
  if (!usuario) return alert('🔒 Debes iniciar sesión para comprar.');

  if (juego.stock <= 0) {
    return alert('❌ No hay stock disponible de este juego.');
  }

  try {
    // Llamada al backend para agregar al carrito (y que también reduzca stock)
    await api.post('/carrito/agregar', {
      productoId: juego._id,
      tipo: 'Juego'
    });

    fetchJuegos(); // refrescar stock en pantalla
    alert(`🕹️ "${juego.nombre}" agregado al carrito`);
  } catch (err) {
    alert('❌ Error al agregar al carrito: ' + (err.response?.data?.mensaje || err.message));
  }
};


  return (
    <div style={{ padding: '2rem' }}>
      <h2>🎮 Juegos Físicos</h2>

      {esAdmin && (
        <div style={{ marginBottom: '1rem' }}>
          <input name="nombre" placeholder="Nombre" value={nuevoJuego.nombre} onChange={handleChange} />
          <input name="plataforma" placeholder="Plataforma" value={nuevoJuego.plataforma} onChange={handleChange} />
          <input name="categoria" placeholder="Categoría" value={nuevoJuego.categoria} onChange={handleChange} />
          <input name="precio" type="number" placeholder="Precio" value={nuevoJuego.precio} onChange={handleChange} />
          <input name="stock" type="number" placeholder="Stock" value={nuevoJuego.stock} onChange={handleChange} />

          {editarId ? (
            <button onClick={guardarEdicion}>Guardar</button>
          ) : (
            <button onClick={agregarJuego}>Agregar</button>
          )}
        </div>
      )}

      <ul>
        {juegos.map((j) => (
          <li key={j._id} style={{ marginBottom: '1rem' }}>
            <strong>{j.nombre}</strong> - {j.plataforma} - {j.categoria}-💲{j.precio} -  Stock: {j.stock}

            {usuario && (
              <button onClick={() => agregarAlCarrito(j)} style={{ marginLeft: '1rem' }}>🛒 Agregar</button>
            )}

            {esAdmin && (
              <>
                <button onClick={() => iniciarEdicion(j)}>Editar</button>
                <button onClick={() => eliminarJuego(j._id)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Juegos;


