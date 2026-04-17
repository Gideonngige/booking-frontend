// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { currentUser } = useAuthContext();

  if (!currentUser) return <Navigate to="/login" />;
  
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" />; // redirect unauthorized users
  }

  return children;
}