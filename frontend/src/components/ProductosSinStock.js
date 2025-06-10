/*import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductosSinStock = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const cargarSinStock = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/productos/sin-stock');
        setProductos(res.data);
      } catch (err) {
        console.error('Error al cargar productos sin stock:', err);
      }
    };

    cargarSinStock();
  }, []);

  return (
    <div className="p-4 border rounded shadow-md max-w-xl mx-auto mt-6 bg-white">
      <h2 className="text-xl font-semibold mb-4 text-red-600">🚨 Productos sin stock</h2>
      {productos.length === 0 ? (
        <p className="text-gray-500">Todos los productos tienen stock 🎉</p>
      ) : (
        <ul>
          {productos.map((p) => (
            <li key={p._id} className="py-2 border-b">
              <strong>{p.nombre}</strong> — {p.categoria}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductosSinStock;*/
