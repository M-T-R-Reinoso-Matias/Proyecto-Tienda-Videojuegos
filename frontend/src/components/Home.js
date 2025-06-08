// src/components/Home.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    try {
      const data = localStorage.getItem('usuario');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object' && parsed.nombre) {
        setUsuario(parsed);
      } else {
        console.warn('Usuario inválido en localStorage');
        localStorage.removeItem('usuario'); // limpia datos corruptos
      }
    } catch (e) {
      console.warn('Usuario inválido en localStorage');
      localStorage.removeItem('usuario');
    }
  }, []);

  // Obtener productos
  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/productos');
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerProductos();
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    setUsuario(null);
    navigate('/');
  };

  const agregarAlCarrito = async (producto) => {
  if (!usuario) {
    alert('🔒 Debes iniciar sesión para agregar productos al carrito.');
    navigate('/login');
    return;
  }

  if (producto.stock <= 0) {
    alert('❌ Este producto no tiene stock disponible.');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('🔒 Token no encontrado. Por favor inicia sesión de nuevo.');
    navigate('/login');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/carrito/agregar', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`  // Aquí va el token
      },
      body: JSON.stringify({
        productoId: producto._id,
        tipo: 'Producto'  
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.mensaje || 'Error al agregar al carrito');
    }

    alert(`✅ "${producto.nombre}" agregado al carrito.`);

    // Actualizar productos
    const actualizar = await fetch('http://localhost:5000/api/productos');
    const data = await actualizar.json();
    setProductos(data);

  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    alert(`❌ ${error.message}`);
  }
};


  return (
    <div style={{ padding: '1rem' }}>
      <h1>Bienvenido a la Tienda Virtual</h1>

      {usuario ? (
        <div>
          <p>Hola, {usuario.nombre} 👋</p>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      ) : (
        <div>
          <Link to="/login"><button>Iniciar sesión</button></Link>
          <Link to="/registro" style={{ marginLeft: '1rem' }}><button>Registrarse</button></Link>
        </div>
      )}

      <hr />

      <div style={{ marginBottom: '1rem' }}>
        <Link to="/carrito"><button>🛒 Ver carrito</button></Link>
        <Link to="/juegos" style={{ marginLeft: '1rem' }}><button>🎮 Ver juegos</button></Link>
      </div>

      <h2>Productos disponibles</h2>

      {cargando ? (
        <p>Cargando productos...</p>
      ) : productos.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {productos.map((prod) => (
            <div key={prod._id} style={{ border: '1px solid #ccc', padding: '1rem', width: '250px' }}>
              <h3>{prod.nombre}</h3>
              <p>{prod.descripcion}</p>
              <p><strong>${prod.precio}</strong></p>
              <p>Stock: {prod.stock}</p>
              {usuario ? (
                <button onClick={() => agregarAlCarrito(prod)} disabled={prod.stock === 0}>
                  {prod.stock === 0 ? 'Sin stock' : '🛒 Agregar al carrito'}
                </button>
              ) : (
                <button onClick={() => navigate('/login')}>
                  Inicia sesión para comprar
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No hay productos disponibles.</p>
      )}
    </div>
  );
}

export default Home;

