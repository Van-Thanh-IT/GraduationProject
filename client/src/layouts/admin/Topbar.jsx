// File: src/layouts/admin/Topbar.jsx
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Avatar, Dropdown } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Bars3Icon } from "@heroicons/react/24/outline"; // Nút Hamburger Menu
import { useAuth } from '@/context/AuthContext';

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logoutContext } = useAuth();

  const handleLogout = () => {
    logoutContext();
  };

  const userMenu = {
    items: [
      {
        key: '1',
        label: <span className="font-medium">Cài đặt hệ thống</span>,
        icon: <UserOutlined />,
        onClick: () => navigate("/admin/settings"), 
      },
      {
        type: 'divider',
      },
      {
        key: '3',
        label: 'Đăng xuất',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    // Dùng justify-between để chia Topbar ra 2 đầu: Trái (Nút Menu) - Phải (Avatar)
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-16 bg-white border-b border-gray-200 shadow-sm shrink-0">
      
      {/* NÚT MENU (Hamburger) - Chỉ hiện trên Mobile (lg:hidden) */}
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors focus:outline-none"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {/* DROPDOWN USER (Bên phải) */}
      <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
        <div className="flex items-center gap-3 cursor-pointer p-1.5 pr-3 rounded-full border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all">
          <Avatar
            src={user?.avatar}
            icon={!user?.avatar && <UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>

          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold text-gray-700 leading-none">
              {user?.username || 'Admin'}
            </span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-1 tracking-wide">
              {user?.roles?.[0]?.name || 'ADMIN'}
            </span>
          </div>
        </div>
      </Dropdown>
    </header>
  );
};

export default Topbar;