// src/components/Carrito.js
import React, { useEffect, useState } from 'react';

const Carrito = () => {
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const token = localStorage.getItem('token');

  const obtenerCarrito = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/carrito', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(await res.text());

      const datos = await res.json();
      const items = datos.items || [];
      setCarrito(items);
      calcularTotal(items);
    } catch (err) {
      console.error('Error al obtener carrito:', err);
    }
  };

  const calcularTotal = (items) => {
    const total = items.reduce((acc, item) =>
      item.producto ? acc + item.producto.precio * item.cantidad : acc, 0);
    setTotal(total);
  };

  const eliminarProducto = async (productoId, tipo) => {
    try {
      await fetch('http://localhost:5000/api/carrito/eliminar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productoId, tipo })
      });
      obtenerCarrito();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
    }
  };

  const vaciarCarrito = async () => {
    try {
      await fetch('http://localhost:5000/api/carrito/vaciar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setCarrito([]);
      setTotal(0);
    } catch (err) {
      console.error('Error al vaciar carrito:', err);
    }
  };

  const finalizarCompra = () => {
    alert("✅ Compra finalizada (simulada). ¡Gracias por tu compra!");
    vaciarCarrito();
  };

  useEffect(() => {
    obtenerCarrito();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>🛒 Carrito de Compras</h2>
      {carrito.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {carrito.map((item, i) => (
              <tr key={`${item.producto?._id || 'sin-id'}-${item.tipo}-${i}`}>
                <td>{item.producto ? item.producto.nombre : '❌ Eliminado'}</td>
                <td>${item.producto?.precio?.toFixed(2) || '—'}</td>
                <td>{item.cantidad}</td>
                <td>
                  {item.producto
                    ? `$${(item.producto.precio * item.cantidad).toFixed(2)}`
                    : '—'}
                </td>
                <td>
                  <button onClick={() => {
                    if (window.confirm('¿Eliminar este producto del carrito?')) {
                      eliminarProducto(item.producto?._id, item.tipo);
                    }
                  }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3>Total: ${total.toFixed(2)}</h3>
      {carrito.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <button onClick={vaciarCarrito}>Vaciar carrito</button>
          <button onClick={finalizarCompra} style={{ marginLeft: '10px' }}>
           ✅ Finalizar compra
          </button>
        </div>
      )}
    </div>
  );
};

export default Carrito;







