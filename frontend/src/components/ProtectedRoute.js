// src/components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';

function RutaPrivada({ children, permitido = [] }) {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) return <Navigate to="/login" />;
  if (permitido.length > 0 && !permitido.includes(rol)) return <Navigate to="/" />;

  return children;
}

export default RutaPrivada;


