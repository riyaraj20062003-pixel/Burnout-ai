import type React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import type { UserRole } from "@shared/api";
import { getStoredRole, getToken } from "@/lib/auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const params = useParams();
  const token = getToken();
  const role = getStoredRole();

  if (!token) {
    return <Navigate to="/login/student" replace state={{ from: location.pathname }} />;
  }

  if (!role) {
    return <Navigate to="/login/student" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  const routeRole = params.role;
  if (routeRole && routeRole !== role) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <>{children}</>;
}
