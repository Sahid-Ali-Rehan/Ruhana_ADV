import { Route, Navigate } from "react-router-dom";

const PrivateRoute = ({ role, children }) => {
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null; // Decode token to get user data

  if (!token || (role === "admin" && user.role !== "admin")) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
