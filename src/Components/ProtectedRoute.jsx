import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, userRole } = useAuthContext();

  // Not logged in at all
  if (!currentUser) return <Navigate to="/login" />;

  // Logged in but wrong role
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}