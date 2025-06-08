import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ setSeccion }) {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="p-3 bg-gray-100 shadow-md flex justify-between">
      <div className="space-x-2">
        <button onClick={() => setSeccion('productos')}>Productos</button>
        <button onClick={() => setSeccion('clientes')}>Clientes</button>
        <button onClick={() => setSeccion('pedidos')}>Pedidos</button>
        <button onClick={() => setSeccion('juegos')}>Juegos</button>
      </div>
      <button onClick={cerrarSesion} className="text-red-600 font-semibold">Cerrar sesión</button>
    </nav>
  );
}

export default Navbar;
