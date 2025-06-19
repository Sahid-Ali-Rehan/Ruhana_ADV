import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  return user && user.role === role ? children : <Navigate to="/login" />;
};
