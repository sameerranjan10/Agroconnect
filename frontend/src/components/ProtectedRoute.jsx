/**
 * AgroConnect - Protected Route
 * Redirects unauthenticated users and enforces role access.
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { isAuth, user } = useAuth()
  const location         = useLocation()

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user?.role)) {
    // Wrong role — redirect to their dashboard
    return <Navigate to={user?.role === 'FARMER' ? '/farmer/dashboard' : '/buyer/dashboard'} replace />
  }

  return children
}
