// Esto se usa para poner musica de fondo
// import React, { useState, useEffect } from 'react';
import React, { useState } from 'react';
import Productos from './components/Productos';
import Clientes from './components/Clientes';
import Pedidos from './components/Pedidos';
import Juegos from './components/Juegos';
import NuevoPedido from './components/NuevoPedido';
import BuscarProducto from './components/BuscarProducto';
import ProductosSinStock from './components/ProductosSinStock';
import PantallaInicio from './components/PantallaInicio';

function App() {
  const [inicio, setInicio] = useState(false);
  // Segun la ruta seleccionada es donde va a iniciar despues de darle al boton start
  const [seccion, setSeccion] = useState('productos');
  const [refrescarPedidos, setRefrescarPedidos] = useState(false); // Nuevo estado

  const manejarPedidoCreado = () => {
    // Cambiar el valor de la bandera para disparar el useEffect en Pedidos
    setRefrescarPedidos(prev => !prev);
  };


  // Esta es la funcion para aplicar la musica de fondo
  /*useEffect(() => {
    let musica;
    if (!inicio) {
      musica = new Audio('/background.mp3');
      musica.volume = 0.4;
      musica.loop = true;
      musica.play();
    }

    return () => {
      if (musica) {
        musica.pause();
        musica.currentTime = 0;
      }
    };
  }, [inicio]);*/

  if (!inicio) {
    return <PantallaInicio onStart={() => setInicio(true)} />;
  }

  return (
    <div>
      {seccion === 'productos' && (
        <>
          <Productos />
          <BuscarProducto />
          <ProductosSinStock />
        </>
      )}

      {seccion === 'clientes' && <Clientes />}

      {seccion === 'pedidos' && (
      <>
      <Pedidos refrescar={refrescarPedidos} /> {/* 👈 Aquí se pasa */}
      <NuevoPedido onPedidoCreado={manejarPedidoCreado} /> {/* 👈 Aquí también */}
      </>
      )}

      {seccion === 'juegos' && <Juegos />}

      <nav style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => setSeccion('productos')}>Productos</button>
        <button onClick={() => setSeccion('clientes')}>Clientes</button>
        <button onClick={() => setSeccion('pedidos')}>Pedidos</button>
        <button onClick={() => setSeccion('juegos')}>Juegos</button>
        <button onClick={() => setSeccion('Inicio')}></button>
      </nav>
    </div>
  );
}

export default App;
