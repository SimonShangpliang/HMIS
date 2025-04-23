import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { setRole, role } = useAuth();
  const [loading, setLoading] = useState(true); // 👈 Add loading state

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
    setLoading(false); // 👈 Set loading false after role is fetched (or not)
  }, [setRole]);

  if (loading) return null; // 👈 Or a spinner: <LoadingSpinner />
  if (!role) return <Navigate to="/" />;
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" />;

  return <Outlet />;
};

export default ProtectedRoute;
