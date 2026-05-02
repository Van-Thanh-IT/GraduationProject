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

  // 1. Nếu đang gọi API getMe (F5 trang), hiện màn hình chờ mượt mà
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

  // 2. Chưa đăng nhập -> Đá về trang /login
  // (Nếu bạn thực sự muốn người chưa đăng nhập cũng bay về trang chủ thì sửa "/login" thành "/")
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Nếu route có yêu cầu kiểm tra Quyền (Role)
  if (allowedRoles.length > 0) {
    // Ép mảng Object [{id: 1, name: 'ADMIN'}] thành mảng String ['ADMIN']
    const userRoles = (user?.roles || []).map(roleObj => roleObj.name);
    
    // So sánh xem userRoles có chứa role nào trong allowedRoles không
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      console.warn("Bị chặn! Quyền của bạn:", userRoles, "nhưng trang yêu cầu:", allowedRoles);
      
      // XỬ LÝ ĐIỀU HƯỚNG THEO ROLE TẠI ĐÂY:
      // - Nếu là nhân viên hoặc admin (nhưng đi lạc vào trang không được cấp phép) -> Về Dashboard
      if (userRoles.includes("ADMIN") || userRoles.includes("STAFF")) {
        return <Navigate to="/admin" replace />;
      }
      
      // - Nếu là user thường (Khách hàng) cố tình vào trang Admin -> Về Trang chủ
      return <Navigate to="/" replace />;
    }
  }
  
  return <Outlet />;
};

export default ProtectedRoute;