import React from 'react';
import { useNavigate } from 'react-router-dom';

function NavbarCliente({ setSeccion }) {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="p-3 bg-blue-100 shadow flex justify-between items-center">
      <div className="space-x-3">
        <button onClick={() => setSeccion('productos')} className="hover:underline">
          Productos
        </button>
        <button onClick={() => setSeccion('nuevo-pedido')} className="hover:underline">
          Nuevo Pedido
        </button>
        <button onClick={() => setSeccion('juegos')} className="hover:underline">
          Juegos
        </button>
      </div>
      <button
        onClick={cerrarSesion}
        className="text-red-600 font-semibold hover:underline"
      >
        Cerrar sesión
      </button>
    </nav>
  );
}

export default NavbarCliente;
