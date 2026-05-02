// File: src/layouts/admin/SideBar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon, UsersIcon, TagIcon, RectangleGroupIcon,
  SwatchIcon, CubeIcon, TicketIcon, BoltIcon,
  ShoppingBagIcon, BuildingStorefrontIcon, LifebuoyIcon, 
  XMarkIcon, NewspaperIcon, PhotoIcon
} from "@heroicons/react/24/outline";

// Import useAuth để lấy thông tin user
import { useAuth } from "@/context/AuthContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  
  // Lấy thông tin user hiện tại từ Context
  const { user } = useAuth();

  // Helper function để lấy ra mảng Role (xử lý chung cho mọi chuẩn trả về của Backend)
  const getUserRoles = () => {
    const rawRoles = user?.roles || user?.role || [];
    const roleArray = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
    return roleArray.map(role => {
      let roleStr = typeof role === 'object' ? (role.name || role.authority || "") : String(role);
      return roleStr.replace(/^ROLE_/, '').toUpperCase();
    });
  };

  const currentRoles = getUserRoles();
  const isAdmin = currentRoles.includes("ADMIN");

  // ĐỊNH NGHĨA MENU & PHÂN QUYỀN
  // Thêm mảng `allowedRoles` vào những trang dành riêng cho từng role
  // Nếu không khai báo allowedRoles -> Mặc định ai vào được trang Admin/Staff đều thấy (Dashboard)
  const menuItems = [
    { name: "Trang chủ", path: "/admin", icon: HomeIcon }, // Ai cũng thấy
    
    // --- KHU VỰC CHỈ DÀNH CHO ADMIN ---
    { name: "Quản lý người dùng", path: "/admin/users", icon: UsersIcon, allowedRoles: ["ADMIN"] },
    { name: "Quản lý thương hiệu", path: "/admin/brand", icon: TagIcon, allowedRoles: ["ADMIN"] },
    { name: "Quản lý danh mục", path: "/admin/category", icon: RectangleGroupIcon, allowedRoles: ["ADMIN"] },
    { name: "Quản lý thuộc tính", path: "/admin/attribute", icon: SwatchIcon, allowedRoles: ["ADMIN"] },
    
    // --- KHU VỰC DÙNG CHUNG (ADMIN + STAFF) ---
    { name: "Quản lý sản phẩm", path: "/admin/products", icon: CubeIcon, allowedRoles: ["ADMIN", "STAFF"] },
    { name: "Quản lý đơn hàng", path: "/admin/orders", icon: ShoppingBagIcon, allowedRoles: ["ADMIN", "STAFF"] },
    { name: "Quản lý kho hàng", path: "/admin/inventory", icon: BuildingStorefrontIcon, allowedRoles: ["ADMIN", "STAFF"] },
    { name: "Hỗ trợ & CSKH", path: "/admin/chat", icon: LifebuoyIcon, allowedRoles: ["ADMIN", "STAFF"] },
    
    // --- KHU VỰC MARKETING / CONTENT ---
    { name: "Quản lý Voucher", path: "/admin/vouchers", icon: TicketIcon, allowedRoles: ["ADMIN"] }, // Tùy bạn muốn Staff tạo mã giảm giá không
    { name: "Quản lý Flash Sale", path: "/admin/flash-sale", icon: BoltIcon, allowedRoles: ["ADMIN"] },
    { name: "Quản lý banner", path: "/admin/banners", icon: PhotoIcon, allowedRoles: ["ADMIN"] },
    { name: "Quản lý tin tức", path: "/admin/articles", icon: NewspaperIcon, allowedRoles: ["ADMIN", "STAFF"] }, 
  ];

  // Lọc Menu: Nếu là ADMIN thì bỏ qua filter, nếu là STAFF thì chỉ lấy những mục allowedRoles có chứa "STAFF"
  const filteredMenuItems = menuItems.filter(item => {
    // Nếu không định nghĩa allowedRoles, mặc định cho phép hiển thị
    if (!item.allowedRoles) return true;
    
    // Admin thấy tất cả
    if (isAdmin) return true;
    
    // Kiểm tra xem các quyền của user hiện tại có nằm trong allowedRoles của menu item không
    return item.allowedRoles.some(role => currentRoles.includes(role));
  });

  return (
    <>
      {/* LỚP PHỦ MỜ (OVERLAY) DÀNH CHO MOBILE */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* SIDEBAR CHÍNH */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}  /* Ẩn/Hiện trên Mobile */
        lg:translate-x-0 /* Luôn hiện trên Desktop */
      `}>
        
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <CubeIcon className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">
              {isAdmin ? "Admin" : "Staff"}<span className="text-blue-600">Pro</span>
            </span>
          </Link>
          
          <button 
            className="lg:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 mt-2">
            Menu Quản Trị
          </p>
          
          {/* Lặp qua mảng đã được lọc quyền */}
          {filteredMenuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                  active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${active ? "text-blue-600" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;