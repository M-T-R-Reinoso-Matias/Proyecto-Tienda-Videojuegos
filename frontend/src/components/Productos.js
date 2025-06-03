import React, { useEffect, useState } from 'react';
import api from '../services/api';

const link= document.createElement('link');
link.rel = 'stylesheet';
link.href = 'Estilos.css';
document.head.appendChild(link);
//link.href = 'Estilos/Productos.css';

const clickSound = new Audio('/mario-level-up-app.mp3');

const handleClick = () => {
  clickSound.play();
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [nuevo, setNuevo] = useState({ id_producto:'', nombre:'', precio:0, stock:0, categoria:'' });

  const fetch = async () => setProductos((await api.get('/productos')).data);
  useEffect(() => { fetch(); }, []);

  const agregar = async () => {
  if (!nuevo.id_producto || !nuevo.nombre || nuevo.precio <= 0) {
    alert('Completa los campos obligatorios: ID, Nombre, Precio');
    return;
  }

  try {
    await api.post('/productos', nuevo);
    fetch();
  } catch (error) {
    console.error('Error al agregar producto:', error);
    alert('Error al agregar producto: ' + (error.response?.data?.error || error.message));
  }
};

  const eliminar = async (id) => { await api.delete(`/productos/${id}`); fetch(); };

  return (
    <div>
      <h2>Productos</h2>
      <ul>
        {productos.map(p => <li key={p._id}>{p.nombre} - <button onClick={()=>eliminar(p._id)}>Eliminar</button></li>)}
      </ul>
      <h3>Agregar</h3>
      <input placeholder="ID" onChange={e=>setNuevo({...nuevo,id_producto:e.target.value})}/>
      <input placeholder="Nombre" onChange={e=>setNuevo({...nuevo,nombre:e.target.value})}/>
      <input type="number" placeholder="Precio" onChange={e=>setNuevo({...nuevo,precio:+e.target.value})}/>
      <input type="number" placeholder="Stock" onChange={e=>setNuevo({...nuevo,stock:+e.target.value})}/>
      <input placeholder="Categoria" onChange={e=>setNuevo({...nuevo,categoria:e.target.value})}/>
      <button onClick={() => {
    handleClick(); // sonido
    agregar(); // buscar
  }}>Agregar</button>
    </div>
  );
}