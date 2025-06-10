import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Carrito = () => {
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const [camposFaltantes, setCamposFaltantes] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autorizado, setAutorizado] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (!token || !usuario || usuario.rol !== 'cliente') {
      setAutorizado(false);
    } else {
      obtenerCarrito();
    }
  }, [token]);

  const obtenerCarrito = async () => {
    try {
      const res = await api.get('/carrito');
      const datos = res.data;
      const items = datos.items || [];
      setCarrito(items);
      calcularTotal(items);
    } catch (err) {
      console.error('Error al obtener carrito:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else {
        setError('Error al cargar el carrito.');
      }
    }
  };

  const calcularTotal = (items) => {
    const totalCalculado = items.reduce((acc, item) => {
      const datos = item[item.tipo.toLowerCase()];
      if (datos && typeof datos.precio === 'number') {
        return acc + datos.precio * item.cantidad;
      }
      return acc;
    }, 0);
    setTotal(totalCalculado);
  };

  const eliminarProducto = async (productoId, tipo) => {
    try {
      await api.post('/carrito/eliminar', { productoId, tipo });
      obtenerCarrito();
    } catch (err) {
      console.error('Error al eliminar producto:', err.response?.data || err.message);
    }
  };

  const vaciarCarrito = async () => {
    try {
      await api.post('/carrito/vaciar');
      setCarrito([]);
      setTotal(0);
    } catch (err) {
      console.error('Error al vaciar carrito:', err.response?.data || err.message);
    }
  };

  const finalizarCompra = async () => {
    if (isSubmitting) return;
    setError('');
    setCamposFaltantes([]);
    if (!window.confirm('¿Deseás finalizar la compra y generar el pedido?')) return;
    setIsSubmitting(true);

    try {
      const res = await api.post('/carrito/finalizar');
      alert('✅ Pedido generado correctamente');
      setCarrito([]);
      setTotal(0);
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 400 && data?.camposFaltantes) {
        setCamposFaltantes(data.camposFaltantes);
      } else {
        setError(data?.error || 'Error al finalizar el pedido');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatearPrecio = (precio) =>
    typeof precio === 'number' ? `$${precio.toFixed(2)}` : '—';

  if (!autorizado) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🛒 Carrito de Compras</h2>
        <p style={{ color: 'red' }}>
          Solo los clientes pueden acceder al carrito.
        </p>
        <button onClick={() => navigate('/')}>Ir al inicio</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>🛒 Carrito de Compras</h2>
      <button style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>⬅️ Volver </button>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {camposFaltantes.length > 0 && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          Para completar tu pedido, actualiza tu perfil agregando: <strong>{camposFaltantes.join(', ')}</strong>.
        </div>
      )}

      {carrito.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((item, index) => {
                const datos = item[item.tipo.toLowerCase()];
                const nombre = datos?.nombre || '❌ Eliminado';
                const precio = datos?.precio;
                const subtotal = typeof precio === 'number'
                  ? formatearPrecio(precio * item.cantidad)
                  : '—';

                return (
                  <tr key={`${datos?._id || 'sin-id'}-${item.tipo}-${index}`}>
                    <td>{nombre}</td>
                    <td>{item.tipo}</td>
                    <td>{formatearPrecio(precio)}</td>
                    <td>{item.cantidad}</td>
                    <td>{subtotal}</td>
                    <td>
                      {datos?._id ? (
                        <button
                          onClick={() => {
                            if (window.confirm('¿Eliminar este producto del carrito?')) {
                              eliminarProducto(datos._id, item.tipo);
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      ) : (
                        <em>No disponible</em>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <h3>Total: {formatearPrecio(total)}</h3>
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
                  vaciarCarrito();
                }
              }}
              disabled={isSubmitting}
            >
              🗑 Vaciar carrito
            </button>
            <button
              onClick={finalizarCompra}
              style={{ marginLeft: '10px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : '✅ Finalizar compra'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Carrito;




