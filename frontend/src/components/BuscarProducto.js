import React, { useState } from 'react';
import api from '../api'; // Asegurate de que la ruta sea correcta
const clickSound = new Audio('/super-mario-bros-tuberia.mp3');

const handleClick = () => {
  clickSound.play();
};

const BuscarProducto = () => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);

  const buscarProductos = async () => {
    if (!query.trim()) return;
    try {
      const res = await api.get(`/productos/buscar?query=${query}`);
      setResultados(res.data);
    } catch (error) {
      console.error('Error al buscar productos:', error);
    }
  };

  return (
    <div className="p-4 border rounded shadow-md max-w-xl mx-auto mt-6 bg-white">
      <h2 className="text-xl font-semibold mb-4">Buscar Productos</h2>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o categoría"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-l"
        />
        <button
          onClick={() => {
            handleClick();
            buscarProductos();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>
      <ul>
        {resultados.map((prod) => (
          <li key={prod._id} className="border-b py-2">
            <strong>{prod.nombre}</strong> — {prod.categoria} — Stock: {prod.stock}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BuscarProducto;
