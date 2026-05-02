import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ requiredRole = null }) {
  const token = localStorage.getItem('tm_token');
  let user = null;
  try { user = JSON.parse(localStorage.getItem('tm_user') || 'null'); } catch {}

  if (!token) return <Navigate to="/login" replace />;

  if (requiredRole && user?.role !== requiredRole) {
    const home = user?.role === 'company' ? '/dashboard' : '/discover';
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
