// File: src/layouts/admin/AdminLayout.jsx
import React, { useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./SideBar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  // State quản lý việc mở Sidebar trên màn hình nhỏ
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden relative">
      
      {/* TRUYỀN STATE VÀ HÀM ĐÓNG CHO SIDEBAR */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* MAIN CONTENT:
        - lg:ml-64 -> Trên Desktop: Nội dung thụt vào 64 để chừa chỗ cho Sidebar cố định
        - ml-0 -> Trên Mobile: Nội dung chiếm toàn màn hình
      */}
      <div className="flex-1 flex flex-col w-full lg:ml-50 overflow-hidden transition-all duration-300">
        
        {/* TRUYỀN HÀM MỞ CHO TOPBAR */}
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-2 md:p-4 overflow-hidden">
          <div className="h-full overflow-auto custom-scrollbar">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;