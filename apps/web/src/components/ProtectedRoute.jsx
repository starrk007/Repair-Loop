import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { cuentaFirebase } = useAuth();

  if (!cuentaFirebase) {
    return <Navigate to="/acceso" replace />;
  }

  return children;
}