// File: src/layouts/admin/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon, UsersIcon, TagIcon, RectangleGroupIcon,
  SwatchIcon, CubeIcon, TicketIcon, BoltIcon,
  ShoppingBagIcon, BuildingStorefrontIcon, LifebuoyIcon, 
  XMarkIcon, NewspaperIcon, PhotoIcon
} from "@heroicons/react/24/outline";
import { StarIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  
  const { user } = useAuth();

  const currentRoles = React.useMemo(() => {
    const rawRoles = user?.roles || user?.role || [];
    const roleArray = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
    return roleArray.map(role => {
      let roleStr = typeof role === 'object' ? (role.name || role.authority || "") : String(role);
      return roleStr.replace(/^ROLE_/, '').toUpperCase();
    });
  }, [user]);

  const isAdmin = currentRoles.includes("ADMIN");

  const menuItems = [
    { name: "Tổng quan", path: "/admin", icon: HomeIcon },
    { name: "Người dùng", path: "/admin/users", icon: UsersIcon, allowedRoles: ["ADMIN"] },
    { name: "Sản phẩm", path: "/admin/products", icon: CubeIcon, allowedRoles: ["ADMIN", "STAFF"] },
    { name: "Danh mục", path: "/admin/category", icon: RectangleGroupIcon, allowedRoles: ["ADMIN"] },
    { name: "Thương hiệu", path: "/admin/brand", icon: TagIcon, allowedRoles: ["ADMIN"] },
    { name: "Thuộc tính", path: "/admin/attribute", icon: SwatchIcon, allowedRoles: ["ADMIN"] },
    { name: "Đánh giá", path: "/admin/reviews", icon: StarIcon, allowedRoles: ["ADMIN", "STAFF"] },
    { name: "Đơn hàng", path: "/admin/orders", icon: ShoppingBagIcon, allowedRoles: ["ADMIN", "STAFF"] },
    { name: "Kho hàng", path: "/admin/inventory", icon: BuildingStorefrontIcon, allowedRoles: ["ADMIN", "STAFF"] },
    { name: "Hỗ trợ & CSKH", path: "/admin/chat", icon: LifebuoyIcon, allowedRoles: ["ADMIN", "STAFF"] },
    { name: "Voucher", path: "/admin/vouchers", icon: TicketIcon, allowedRoles: ["ADMIN"] },
    { name: "Flash Sale", path: "/admin/flash-sale", icon: BoltIcon, allowedRoles: ["ADMIN"] },
    { name: "Quảng cáo", path: "/admin/banners", icon: PhotoIcon, allowedRoles: ["ADMIN"] },
    { name: "Tin tức", path: "/admin/articles", icon: NewspaperIcon, allowedRoles: ["ADMIN", "STAFF"] }, 
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.allowedRoles) return true;
    if (isAdmin) return true;
    return item.allowedRoles.some(role => currentRoles.includes(role));
  });

  return (
    <>
      {/* LỚP PHỦ MỜ (OVERLAY) TRÊN MOBILE */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* SIDEBAR CHÍNH - ĐÃ ÉP CHIỀU RỘNG VỀ CHUẨN 200PX (ĐỘ RỘNG 50 TRONG TAILWIND) */}
      <aside className={`fixed top-0 left-0 h-screen w-[200px] bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
      `}>
        
        {/* LOGO HEADER SIDEBAR */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-gray-100 shrink-0">
          <Link to="/admin" className="flex items-center gap-2 no-underline">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white">
              <CubeIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-gray-800 tracking-tight">
              {isAdmin ? "Admin" : "Staff"}<span className="text-blue-600">Pro</span>
            </span>
          </Link>
          
          <button 
            type="button"
            className="lg:hidden p-1 text-gray-400 hover:bg-gray-50 rounded-md border-none cursor-pointer flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* DANH SÁCH CÁC TAB MENU (THU GỌN PADDING GỌN GÀNG THEO CHIỀU RỘNG MỚI) */}
        <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5 custom-scrollbar">
          <span className="px-2.5 text-[9.5px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 mt-0.5">
            Hệ thống quản trị
          </span>
          
          {filteredMenuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} 
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors font-medium text-[12.5px] no-underline ${
                  active 
                    ? "bg-blue-50 text-blue-600 font-semibold" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${active ? "text-blue-600" : "text-gray-400"}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}