import { Navigate, useLocation } from "react-router-dom";
import {
  clearAuth,
  getStoredUser,
  getTokenPayload,
  isTokenExpired,
} from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const storedUser = getStoredUser();
  const payload = getTokenPayload(token);
  const user = storedUser || {
    role: payload?.role,
  };

  // TOKEN CHECK
  if (!token || isTokenExpired(token)) {
    clearAuth();

    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // ROLE CHECK
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
