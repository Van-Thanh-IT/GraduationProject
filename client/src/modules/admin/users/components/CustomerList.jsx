import React, { useState } from 'react';
import { Popconfirm, Image, Tooltip } from 'antd';
import { 
  LockOutlined, 
  UnlockOutlined, 
  UserOutlined, 
  SearchOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined
} from '@ant-design/icons';

import CustomTable from '@/components/ui/CustomTable';
import { useGetUsers, useUpdateUserStatus } from '@/hooks/useUsers';
import { toast } from 'react-toastify';

// Cấu hình UI cho trạng thái
const STATUS_CONFIG = {
  ACTIVE: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Hoạt động' },
  INACTIVE: { color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Bị khóa' },
};

export default function CustomerList() {
  const [keyword, setKeyword] = useState('');

  // 1. Dùng React Query Hook (Tự động cache và loading)
  const { data: users = [], isLoading } = useGetUsers('USER');
  const { mutate: updateStatus } = useUpdateUserStatus();

  // 2. Handler đổi trạng thái Khóa/Mở khóa
  const handleStatusChange = (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    updateStatus({ userId, status: newStatus }, {
      onSuccess: () => toast.success(`Đã ${newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản thành công!`),
      onError: (err) => toast.error(err.response?.data?.message || "Cập nhật trạng thái thất bại!")
    });
  };

  // 3. LOGIC TÌM KIẾM
  const displayedUsers = users.filter((user) => {
    if (!keyword) return true;
    const lowerKeyword = keyword.toLowerCase();
    return (
      (user.id?.toString() || '').toLowerCase().includes(lowerKeyword) ||
      (user.username || '').toLowerCase().includes(lowerKeyword) ||
      (user.email || '').toLowerCase().includes(lowerKeyword) ||
      (user.phone || '').toLowerCase().includes(lowerKeyword)
    );
  });

  // 4. CẤU HÌNH CỘT (UI CHUẨN PREMIUM)
  const columns = [
    { 
      title: 'Hồ sơ khách hàng', 
      key: 'profile', 
      render: (_, record) => (
        <div className="flex items-center gap-4 py-1">
          {/* Avatar Area */}
          <div className="relative">
             {record.avatar ? (
                <Image
                  src={record.avatar} 
                  alt="avatar"
                  width={48}
                  height={48}
                  className="rounded-full object-cover border-2 border-white shadow-sm"
                  preview={true} 
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-400 shadow-sm">
                  <UserOutlined className="text-xl" />
                </div>
              )}
              {/* Chấm tròn trạng thái hoạt động */}
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${STATUS_CONFIG[record.status]?.dot || 'bg-slate-300'}`}></div>
          </div>
          
          {/* Info Area */}
          <div className="flex flex-col">
             <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-base">{record.username}</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded border border-slate-200">
                  #{record.id}
                </span>
             </div>
             <span className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MailOutlined className="text-slate-400 text-xs" /> {record.email || 'Chưa cập nhật email'}
             </span>
          </div>
        </div>
      )
    },
    { 
      title: 'Liên hệ', 
      dataIndex: 'phone', 
      key: 'phone',
      width: 180,
      render: (phone) => (
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            <PhoneOutlined className="text-xs" />
          </div>
          {phone || '---'}
        </div>
      )
    },
    { 
      title: 'Trạng thái', 
      key: 'status',
      width: 140,
      render: (_, record) => {
        const config = STATUS_CONFIG[record.status] || STATUS_CONFIG.INACTIVE;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${config.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {config.label}
          </span>
        )
      }
    },
    {
      title: 'Bảo mật', 
      key: 'action', 
      width: 140,
      align: 'center',
      render: (_, record) => {
        const isActive = record.status === 'ACTIVE';
        return (
          <Popconfirm
            title={<span className="font-bold">{isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</span>}
            description={`Bạn có chắc muốn ${isActive ? 'khóa' : 'mở khóa'} khách hàng này?`}
            onConfirm={() => handleStatusChange(record.id, record.status)}
            okText="Đồng ý" 
            cancelText="Hủy"
            okButtonProps={{ className: isActive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600' }}
          >
            <Tooltip title={isActive ? "Khóa người dùng này" : "Mở khóa cho người dùng này"}>
              <button 
                className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isActive 
                    ? 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50' 
                    : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {isActive ? <LockOutlined /> : <UnlockOutlined />}
                {isActive ? 'Khóa TK' : 'Mở khóa'}
              </button>
            </Tooltip>
          </Popconfirm>
        );
      }
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        
        {/* Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <TeamOutlined className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 m-0 leading-tight">Khách hàng thành viên</h1>
            <p className="text-sm text-slate-500 m-0 mt-1 font-medium">Quản lý tài khoản và trạng thái người dùng</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm ID, Tên, Email, SĐT..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <CustomTable 
          dataSource={displayedUsers} 
          columns={columns} 
          loading={isLoading} 
          rowKey="id"
         
        />
      </div>

    </div>
  );
}