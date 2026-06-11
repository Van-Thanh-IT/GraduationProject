import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Component bảo vệ Router
 * @param {Array} allowedRoles - Mảng chứa các role được phép truy cập (VD: ["ADMIN", "STAFF"])
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">Đang kiểm tra phiên đăng nhập...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const userRoles = (user?.roles || []).map(roleObj => roleObj.name);
    
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      console.warn("Bị chặn! Quyền của bạn:", userRoles, "nhưng trang yêu cầu:", allowedRoles);
    
      if (userRoles.includes("ADMIN") || userRoles.includes("STAFF")) {
        return <Navigate to="/admin" replace />;
      }
      
      return <Navigate to="/" replace />;
    }
  }
  
  return <Outlet />;
};

export default ProtectedRoute;