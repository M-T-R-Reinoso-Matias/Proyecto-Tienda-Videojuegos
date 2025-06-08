import React, { useState } from 'react';
import Productos from './Productos';
import Clientes from './Clientes';
import Pedidos from './Pedidos';
import Juegos from './Juegos';
import BuscarProducto from './BuscarProducto';
import ProductosSinStock from './ProductosSinStock';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const [seccion, setSeccion] = useState('productos');
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Panel de Administración</h1>

      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        <button onClick={() => setSeccion('productos')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Productos</button>
        <button onClick={() => setSeccion('clientes')} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Clientes</button>
        <button onClick={() => setSeccion('pedidos')} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Pedidos</button>
        <button onClick={() => setSeccion('juegos')} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Juegos</button>
        <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Cerrar Sesión</button>
      </div>

      <div className="bg-white p-4 rounded shadow-md">
        {seccion === 'productos' && (
          <>
            <Productos />
            <BuscarProducto />
            <ProductosSinStock />
          </>
        )}
        {seccion === 'clientes' && <Clientes />}
        {seccion === 'pedidos' && <Pedidos />}
        {seccion === 'juegos' && <Juegos />}
      </div>
    </div>
  );
}

export default AdminPanel;


