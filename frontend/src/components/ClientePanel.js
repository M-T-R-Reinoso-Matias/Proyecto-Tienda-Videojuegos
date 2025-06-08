import React, { useState } from 'react';
import Productos from './Productos';
import NuevoPedido from './NuevoPedido';
import Juegos from './Juegos';
import Pedidos from './Pedidos';
import { useNavigate } from 'react-router-dom';

function ClientePanel() {
  const [seccion, setSeccion] = useState('productos');
  const [refrescarPedidos, setRefrescarPedidos] = useState(false);
  const navigate = useNavigate();

  const manejarPedidoCreado = () => {
    setRefrescarPedidos(prev => !prev);
    setSeccion('pedidos'); // Opcional: redirigir al ver pedidos
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Panel del Cliente</h1>

      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        <button onClick={() => setSeccion('productos')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Productos</button>
        <button onClick={() => setSeccion('nuevo')} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Nuevo Pedido</button>
        <button onClick={() => setSeccion('pedidos')} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Mis Pedidos</button>
        <button onClick={() => setSeccion('juegos')} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">Juegos</button>
        <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Cerrar Sesión</button>
      </div>

      <div className="bg-white p-4 rounded shadow-md">
        {seccion === 'productos' && <Productos />}
        {seccion === 'nuevo' && <NuevoPedido onPedidoCreado={manejarPedidoCreado} />}
        {seccion === 'pedidos' && <Pedidos refrescar={refrescarPedidos} />}
        {seccion === 'juegos' && <Juegos />}
      </div>
    </div>
  );
}

export default ClientePanel;


