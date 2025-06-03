import React, { useState, useEffect } from 'react';
import api from '../services/api';

function NuevoPedido({ onPedidoCreado }) {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [items, setItems] = useState([{ productoId: '', cantidad: 1 }]);
  const [errores, setErrores] = useState([]);

  useEffect(() => {
    const fetchDatos = async () => {
      const clientesRes = await api.get('/clientes');
      const productosRes = await api.get('/productos');
      setClientes(clientesRes.data);
      setProductos(productosRes.data);
    };
    fetchDatos();
  }, []);

  const handleChangeItem = (index, field, value) => {
    const nuevosItems = [...items];
    nuevosItems[index][field] = value;
    setItems(nuevosItems);
  };

  const agregarItem = () => {
    setItems([...items, { productoId: '', cantidad: 1 }]);
  };

  const validar = () => {
    const errores = [];

    if (!clienteId) errores.push('Debes seleccionar un cliente.');

    const idsSeleccionados = new Set();
    items.forEach((item, index) => {
      if (!item.productoId) {
        errores.push(`El producto en la línea ${index + 1} está vacío.`);
      } else {
        if (idsSeleccionados.has(item.productoId)) {
          errores.push(`El producto en la línea ${index + 1} está duplicado.`);
        } else {
          idsSeleccionados.add(item.productoId);
        }
      }

      const cantidad = parseInt(item.cantidad, 10);
      if (isNaN(cantidad) || cantidad <= 0) {
        errores.push(`La cantidad en la línea ${index + 1} no es válida.`);
      } else {
        const producto = productos.find(p => p._id === item.productoId);
        if (producto && cantidad > producto.stock) {
          errores.push(
            `No hay suficiente stock para "${producto.nombre}" (disponible: ${producto.stock}, solicitado: ${cantidad}).`
          );
        }
      }
    });

    setErrores(errores);
    return errores.length === 0;
  };

  const enviarPedido = async () => {
    if (!validar()) return;

    try {
      const cliente = clientes.find(c => c._id === clienteId);
      const productosPedido = items.map(item => {
        const producto = productos.find(p => p._id === item.productoId);
        return {
          id_producto: producto._id,
          nombre: producto.nombre,
          cantidad: parseInt(item.cantidad, 10),
          precio_unitario: producto.precio,
        };
      });

      await api.post('/pedidos', {
        cliente: {
          id_cliente: cliente._id,
          nombre: cliente.nombre,
          correo: cliente.correo,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
        },
        productos: productosPedido,
      });

      alert('✅ Pedido creado con éxito');
      setClienteId('');
      setItems([{ productoId: '', cantidad: 1 }]);
      setErrores([]);

      if (onPedidoCreado) {
        onPedidoCreado(); // 🔁 Notificar al padre para recargar pedidos
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error al crear el pedido');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Nuevo Pedido</h2>

      {errores.length > 0 && (
        <div style={{ background: '#ffe6e6', padding: '1rem', color: '#900', marginBottom: '1rem' }}>
          <ul>
            {errores.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label>Cliente:</label>
        <select value={clienteId} onChange={e => setClienteId(e.target.value)}>
          <option value="">Selecciona un cliente</option>
          {clientes.map(cliente => (
            <option key={cliente._id} value={cliente._id}>
              {cliente.nombre}
            </option>
          ))}
        </select>
      </div>

      <h4>Productos:</h4>
      {items.map((item, index) => (
        <div key={index} style={{ marginBottom: '1rem' }}>
          <select
            value={item.productoId}
            onChange={e => handleChangeItem(index, 'productoId', e.target.value)}
          >
            <option value="">Selecciona un producto</option>
            {productos.map(producto => (
              <option key={producto._id} value={producto._id}>
                {producto.nombre} (stock: {producto.stock})
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={item.cantidad}
            onChange={e => handleChangeItem(index, 'cantidad', e.target.value)}
            style={{ marginLeft: '1rem', width: '60px' }}
          />
        </div>
      ))}

      <button onClick={agregarItem}>+ Agregar otro producto</button>
      <br /><br />
      <button onClick={enviarPedido}>Enviar Pedido</button>
    </div>
  );
}

export default NuevoPedido;

