// src/components/Pedidos.js
import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';


function Pedidos({ refrescar }) {
  const [pedidos, setPedidos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const clickSoundRef = useRef(null);
  const navigate = useNavigate();

  // Obtener usuario
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const res = await api.get('/usuarios');
        setUsuario(res.data);
      //console.log('Usuario cargado desde backend:', res.data);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      }
    };
    cargarUsuario();
  }, []);

  // Obtener pedidos al cargar usuario
  useEffect(() => {
    if (usuario) {
      clickSoundRef.current = new Audio('/mario-bros-lose-life.mp3');
      fetchPedidos();
    }
  }, [refrescar, usuario]);

  const fetchPedidos = async () => {
    try {
      const res = await api.get('/pedidos');
    //console.log('Pedidos recibidos:', res.data);
      setPedidos(res.data);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
    }
  };

  const reproducirSonido = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play();
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/pedidos/${id}`, { estado: nuevoEstado });
      fetchPedidos();
    } catch (error) {
      console.error('Error al actualizar estado', error);
    }
  };

  const cancelarPedido = async (id) => {
    try {
      const confirm = window.confirm('¿Seguro que deseas cancelar este pedido?');
      if (!confirm) return;

      await api.patch(`/pedidos/cancelar/${id}`);
      alert('✅ Pedido cancelado, eliminado y stock devuelto');
      fetchPedidos();
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      alert(`❌ ${error.response?.data?.error || 'Error al cancelar pedido'}`);
    }
  };

  const eliminarPedidoAdmin = async (id) => {
  const confirm = window.confirm('¿Estás seguro que deseas eliminar este pedido?\n\n⚠ Esta acción no se puede deshacer.');

  if (!confirm) return;

  try {
    const res = await api.delete(`/pedidos/${id}`);
    alert(`✅ ${res.data.message || 'Pedido eliminado correctamente'}`);
    fetchPedidos();
  } catch (error) {
    console.error('Error al eliminar pedido:', error);

    const status = error.response?.status;
    const mensaje = error.response?.data?.error;

    if (status === 400 && mensaje?.includes('enviado')) {
      alert('❌ Este pedido ya fue enviado y no puede ser eliminado hasta que se entregue.');
    } else if (status === 403) {
      alert('❌ No tienes permisos para eliminar este pedido.');
    } else if (status === 404) {
      alert('❌ El pedido no existe o ya fue eliminado.');
    } else {
      alert(`❌ ${mensaje || 'Error inesperado al eliminar el pedido.'}`);
    }
  }
};


  return (
    <div style={{ width: '100%', maxWidth: 'auto 900px', margin: '2rem auto' }}>
      <h2>Lista de Pedidos</h2>
        {usuario?.rol === 'cliente' && (
      <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
        <button onClick={() => navigate('/')}>
          ⬅️ Volver al Inicio
        </button>
      </div>)}

      {pedidos.length === 0 ? (
        <p style={{ color: '#aaa' }}>No hay pedidos registrados.</p>
      ) : (
        pedidos.map((pedido) => {
          const fecha = pedido.fecha_pedido ? new Date(pedido.fecha_pedido).toLocaleDateString() : 'Fecha no disponible';

          return (
            <div
              key={pedido._id}
              style={{
                border: '2px solid #00ffcc',
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                boxShadow: '0 0 20px #00ffcc50',
                padding: '1.5rem',
                marginBottom: '2rem',
                animation: 'fadeIn 1s ease-in-out',
              }}
            >
              <h3 title={`MongoID: ${pedido._id}`}>Pedido {pedido.id_pedido || 'N/A'}</h3>
              <p><strong>Fecha:</strong> {fecha}</p>
              <p><strong>Cliente:</strong> {pedido.cliente?.nombre}</p>
              <p><strong>Correo:</strong> {pedido.cliente?.correo}</p>
              <p><strong>Teléfono:</strong> {pedido.cliente?.telefono}</p>
              <p><strong>Dirección:</strong> {pedido.cliente?.direccion}</p>
              <p><strong>Estado:</strong> <span style={{ color: '#00ffcc' }}>{pedido.estado}</span></p>

              {pedido.productos?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ color: '#00ffcc' }}>Productos:</h4>
                  <ul>
                    {pedido.productos.map((prod, idx) => (
                      <li key={idx}>
                        {prod.nombre} - {prod.cantidad} x ${prod.precio_unitario} = <strong>${(prod.cantidad * prod.precio_unitario).toFixed(2)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pedido.juegos?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ color: '#00ffcc' }}>Juegos:</h4>
                  <ul>
                    {pedido.juegos.map((juego, idx) => (
                      <li key={idx}>
                        {juego.nombre} ({juego.categoria}) - {juego.cantidad} x ${juego.precio_unitario} = <strong>${(juego.cantidad * juego.precio_unitario).toFixed(2)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#00ffcc' }}>
                <strong>Total:</strong> ${pedido.total?.toFixed(2)}
              </p>

               {/* Opciones para el administrador */}
              {usuario?.rol === 'admin' ? (
                <div style={{ marginTop: '1.5rem' }}>
                  <label htmlFor={`estado-${pedido._id}`} style={{ marginRight: '0.5rem' }}>Actualizar Estado:</label>
                  <select
                    id={`estado-${pedido._id}`}
                    value={pedido.estado}
                    onChange={e => actualizarEstado(pedido._id, e.target.value)}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="procesando">Procesando</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>

                  <button
                      style={{
                      marginLeft: '1rem',
                      backgroundColor:
                      pedido.estado === 'enviado' ? 'gray' :
                      pedido.estado === 'entregado' ? '#004488' : 'darkred',
                      color: 'white',
                      cursor: pedido.estado === 'enviado' ? 'not-allowed' : 'pointer'
                      }}
                        onClick={() => {
                          if (pedido.estado === 'enviado') {
                                alert('❌ Este pedido ya fue enviado y no se puede eliminar hasta que sea entregado.');
                        } else {
                            eliminarPedidoAdmin(pedido._id);
                        }
                      }}
  disabled={pedido.estado === 'enviado'}
>
  {pedido.estado === 'enviado'
    ? 'No se puede eliminar (el pedido se encuentra en camino)'
    : pedido.estado === 'entregado'
    ? 'Eliminar sin devolver stock'
    : 'Eliminar Pedido'}
</button>
                </div>
              ) : (
                pedido.estado === 'pendiente' && (
                  <button
                    style={{ marginTop: '1.5rem', backgroundColor: 'red', color: 'white' }}
                    onClick={() => {
                      reproducirSonido();
                      cancelarPedido(pedido._id);
                    }}
                  >
                    Eliminar Pedido
                  </button>
                )
              )}
            </div>
          );
        })
      )}
    </div>

  );
}

export default Pedidos;
