// src/components/Home.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [productos, setProductos] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const data = localStorage.getItem('usuario');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object' && parsed.nombre) {
        setUsuario(parsed);
      } else {
        console.warn('Usuario No Logeado');
        localStorage.removeItem('usuario');
      }
    } catch (e) {
      console.warn('Usuario inválido en localStorage');
      localStorage.removeItem('usuario');
    }
  }, []);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const resProductos = await fetch('http://localhost:5000/api/productos');
        const dataProductos = await resProductos.json();
        setProductos(dataProductos);

        const resJuegos = await fetch('http://localhost:5000/api/juegos');
        const dataJuegos = await resJuegos.json();
        setJuegos(dataJuegos);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    setUsuario(null);
    navigate('/');
  };

  const agregarAlCarrito = async (producto, tipo) => {
    if (!usuario) {
      alert('🔒 Debes iniciar sesión para agregar productos al carrito.');
      navigate('/login');
      return;
    }

    if (usuario.rol !== 'cliente') {
      alert('🔒 Solo los clientes pueden agregar productos al carrito.');
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productoId: producto._id,
          tipo: tipo
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.mensaje || 'Error al agregar al carrito');
      }

      alert(`✅ "${producto.nombre}" agregado al carrito.`);

      // Actualizar stock
      if (tipo === 'Producto') {
        const resProductos = await fetch('http://localhost:5000/api/productos');
        const dataProductos = await resProductos.json();
        setProductos(dataProductos);
      } else {
        const resJuegos = await fetch('http://localhost:5000/api/juegos');
        const dataJuegos = await resJuegos.json();
        setJuegos(dataJuegos);
      }

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
          <button onClick={() => navigate('/perfil')}>Mi Perfil</button>
          <button onClick={cerrarSesion}>Cerrar sesión</button>

          {/* 🔒 Botón solo visible para administradores */}
          {usuario.rol === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              style={{ marginLeft: '1rem' }}
            >
              ⚙️ Panel de Administrador
            </button>
          )}
        </div>
      ) : (
        <div>
          <Link to="/login"><button>Iniciar sesión</button></Link>
          <Link to="/registro" style={{ marginLeft: '1rem' }}><button>Registrarse</button></Link>
        </div>
      )}

      <hr />

      {/* Solo los clientes o visitantes pueden ver estos botones */}
      {(!usuario || usuario.rol === 'cliente') && (
        <div style={{ marginBottom: '1rem',  }}>
          <Link to="/carrito"><button>🛒 Ver carrito</button></Link>
          {/*<Link to="/juegos" style={{ marginLeft: '1rem' }}><button>🎮 Ver juegos</button></Link>*/}
        </div>
      )}

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
              {usuario && usuario.rol === 'cliente' ? (
                <button onClick={() => agregarAlCarrito(prod, 'Producto')} disabled={prod.stock === 0}>
                  {prod.stock === 0 ? 'Sin stock' : '🛒 Agregar al carrito'}
                </button>
              ) : usuario ? (
                <p>🔒 Los administradores no pueden comprar.</p>
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

      <h2>Juegos disponibles</h2>

      {cargando ? (
        <p>Cargando juegos...</p>
      ) : juegos.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {juegos.map((juego) => (
            <div key={juego._id} style={{ border: '1px solid #ccc', padding: '1rem', width: '250px' }}>
              <h3>{juego.nombre}</h3>
              <p>Plataforma: {juego.plataforma}</p>
              <p>Categoría: {juego.categoria}</p>
              <p><strong>${juego.precio}</strong></p>
              <p>Stock: {juego.stock}</p>
              {usuario && usuario.rol === 'cliente' ? (
                <button onClick={() => agregarAlCarrito(juego, 'Juego')} disabled={juego.stock === 0}>
                  {juego.stock === 0 ? 'Sin stock' : '🛒 Agregar al carrito'}
                </button>
              ) : usuario ? (
                <p>🔒 Los administradores no pueden comprar.</p>
              ) : (
                <button onClick={() => navigate('/login')}>
                  Inicia sesión para comprar
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No hay juegos disponibles.</p>
      )}
    </div>
  );
}

export default Home;





