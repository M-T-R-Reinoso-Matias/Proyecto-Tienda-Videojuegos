// Esto se usa para poner musica de fondo
// import React, { useState, useEffect } from 'react';
import React, { useState } from 'react';
import Productos from './components/Productos';
import Clientes from './components/Clientes';
import Pedidos from './components/Pedidos';
import NuevoPedido from './components/NuevoPedido';
import BuscarProducto from './components/BuscarProducto';
import ProductosSinStock from './components/ProductosSinStock';
import PantallaInicio from './components/PantallaInicio';

function App() {
  const [inicio, setInicio] = useState(false);
  const [refrescarPedidos, setRefrescarPedidos] = useState(false); // Nuevo estado

  const manejarPedidoCreado = () => {
    // Cambiar el valor de la bandera para disparar el useEffect en Pedidos
    setRefrescarPedidos(prev => !prev);
  };

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
      <Productos />
      <BuscarProducto />
      <ProductosSinStock />
      <Clientes />
      <Pedidos refrescar={refrescarPedidos} /> {/* 👈 Aquí se pasa */}
      <NuevoPedido onPedidoCreado={manejarPedidoCreado} /> {/* 👈 Aquí también */}
    </div>
  );
}

export default App;
