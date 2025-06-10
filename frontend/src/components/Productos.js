import React, { useEffect, useState } from 'react';
import api from '../services/api';

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'Estilos.css';
document.head.appendChild(link);

const clickSound = new Audio('/mario-level-up-app.mp3');

const handleClick = () => {
  clickSound.play();
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [productosSinStock, setProductosSinStock] = useState([]);
  const [nuevo, setNuevo] = useState({ id_producto:'', nombre:'', precio:0, stock:0, categoria:'' });
  const [editando, setEditando] = useState({});

  const fetch = async () => {
    try {
      const res = await api.get('/productos');
      setProductos(res.data);

      const sinStockRes = await api.get('/productos/sin-stock');
      setProductosSinStock(sinStockRes.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  useEffect(() => { fetch(); }, []);

  const agregar = async () => {
    if (!nuevo.id_producto || !nuevo.nombre || nuevo.precio <= 0 || nuevo.stock < 0) {
      alert('⚠️ Completa todos los campos correctamente.\n- ID y Nombre obligatorios.\n- Precio debe ser mayor a 0.\n- Stock no puede ser negativo.');
      return;
    }

    try {
      await api.post('/productos', nuevo);
      fetch();
      setNuevo({ id_producto:'', nombre:'', precio:0, stock:0, categoria:'' });
      alert('✅ Producto agregado correctamente.');
    } catch (error) {
      console.error('Error al agregar producto:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const eliminar = async (id) => {
    await api.delete(`/productos/${id}`);
    fetch();
  };

  const actualizar = async (id, datosActualizados) => {
    if (!datosActualizados.nombre || datosActualizados.precio <= 0 || datosActualizados.stock < 0) {
      alert('⚠️ Los campos de edición no son válidos.\n- Nombre requerido.\n- Precio debe ser mayor a 0.\n- Stock no puede ser negativo.');
      return;
    }

    try {
      await api.put(`/productos/${id}`, datosActualizados);
      alert('✅ Producto actualizado correctamente.');
      fetch();
      setEditando((prev) => ({ ...prev, [id]: false }));
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      alert('Error al actualizar: ' + (error.response?.data?.error || error.message));
    }
  };

  const manejarCambio = (id, campo, valor) => {
    setEditando((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: campo === 'precio' || campo === 'stock' ? +valor : valor }
    }));
  };

  const empezarEdicion = (producto) => {
    setEditando((prev) => ({
      ...prev,
      [producto._id]: { ...producto }
    }));
  };

  const cancelarEdicion = (id) => {
    setEditando((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div>
      <h2>Productos</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID Producto</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p._id}>
              <td>{p.id_producto}</td>
              {editando[p._id] ? (
                <>
                  <td><input value={editando[p._id].nombre} onChange={e => manejarCambio(p._id, 'nombre', e.target.value)} /></td>
                  <td><input type="number" value={editando[p._id].precio} onChange={e => manejarCambio(p._id, 'precio', e.target.value)} /></td>
                  <td><input type="number" value={editando[p._id].stock} onChange={e => manejarCambio(p._id, 'stock', e.target.value)} /></td>
                  <td><input value={editando[p._id].categoria} onChange={e => manejarCambio(p._id, 'categoria', e.target.value)} /></td>
                </>
              ) : (
                <>
                  <td>{p.nombre}</td>
                  <td>${p.precio}</td>
                  <td>{p.stock}</td>
                  <td>{p.categoria}</td>
                </>
              )}
              <td>
                {editando[p._id] ? (
                  <>
                    <button onClick={() => actualizar(p._id, editando[p._id])}>Guardar</button>
                    <button onClick={() => cancelarEdicion(p._id)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => empezarEdicion(p)}>Editar</button>
                    <button onClick={() => eliminar(p._id)}>Eliminar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Agregar Nuevo Producto</h3>
      <input placeholder="ID" value={nuevo.id_producto} onChange={e => setNuevo({ ...nuevo, id_producto: e.target.value })} />
      <input placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} />
      <input type="number" placeholder="Precio" value={nuevo.precio} onChange={e => setNuevo({ ...nuevo, precio: +e.target.value })} />
      <input type="number" placeholder="Stock" value={nuevo.stock} onChange={e => setNuevo({ ...nuevo, stock: +e.target.value })} />
      <input placeholder="Categoría" value={nuevo.categoria} onChange={e => setNuevo({ ...nuevo, categoria: e.target.value })} />
      <button onClick={() => { handleClick(); agregar(); }}>Agregar</button>

      <div className="p-4 border rounded shadow-md max-w-xl mx-auto mt-6 bg-white">
        <h2 className="text-xl font-semibold mb-4 text-red-600">🚨 Productos sin stock</h2>
        {productosSinStock.length === 0 ? (
          <p className="text-gray-500">Todos los productos tienen stock 🎉</p>
        ) : (
          <ul>
            {productosSinStock.map((p) => (
              <li key={p._id} className="py-2 border-b">
                <strong>{p.nombre}</strong> — {p.categoria}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


