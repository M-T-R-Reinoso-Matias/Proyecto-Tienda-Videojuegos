import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PantallaInicio from './components/PantallaInicio';
import Home from './components/Home';
import Juegos from './components/Juegos';
import Carrito from './components/Carrito';
import Login from './components/Login';
import Registro from './components/Registro';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './components/AdminPanel';
import ClientePanel from './components/ClientePanel';


function App() {
  const [inicio, setInicio] = useState(false);

  if (!inicio) return <PantallaInicio onStart={() => setInicio(true)} />;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* 👈 ruta principal */}
        <Route path="/juegos" element={<Juegos />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute permitido={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente"
          element={
            <ProtectedRoute permitido={['cliente', 'admin']}>
              <ClientePanel />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div>404: Página no encontrada</div>} />
      </Routes>
    </Router>
  );
}

export default App;

