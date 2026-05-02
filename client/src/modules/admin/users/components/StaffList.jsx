import React, { useState } from 'react';
import { Tag, message, Modal, Select, Image, Input, Dropdown, Tooltip } from 'antd';
import { 
  UserOutlined, 
  SearchOutlined, 
  PhoneOutlined, 
  MailOutlined,
  DownOutlined,
  IdcardOutlined,
  UsergroupAddOutlined,
  EyeOutlined
} from '@ant-design/icons';

import CustomTable from '@/components/ui/CustomTable';
import Button from '@/components/ui/Button';
import AddStaffForm from './AddStaffFrom'; // Nhớ sửa lại tên file import nếu trước đó bạn viết sai chính tả (From -> Form)
import { useGetUsers, useUpdateUserStatus } from '@/hooks/useUsers';

// Cấu hình trạng thái với icon và màu sắc chi tiết hơn
const STATUS_CONFIG = {
  ACTIVE: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Hoạt động' },
  INACTIVE: { color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Tạm khóa' },
  BANNED: { color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Bị cấm' },
  TERMINATED: { color: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400', label: 'Nghỉ việc' } 
};

export default function StaffList() {
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. GỌI HOOK REACT QUERY (Tự động cache và refresh)
  const { data: staffs = [], isLoading } = useGetUsers('STAFF');
  const { mutate: updateStatus } = useUpdateUserStatus();

  // 2. HANDLER ĐỔI TRẠNG THÁI
  const handleStatusChange = (userId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return; 

    Modal.confirm({
      title: <span className="font-bold text-lg">Xác nhận thay đổi</span>,
      content: (
        <p className="text-slate-600 mt-2">
          Bạn có chắc chắn muốn đổi trạng thái nhân viên này thành <strong className={STATUS_CONFIG[newStatus].color.split(' ')[1]}>"{STATUS_CONFIG[newStatus].label}"</strong>?
        </p>
      ),
      okText: 'Đồng ý',
      cancelText: 'Hủy bỏ',
      centered: true,
      okButtonProps: { className: 'bg-blue-600 hover:bg-blue-700 shadow-md' },
      onOk: () => {
        updateStatus({ userId, status: newStatus }, {
          onSuccess: () => message.success("Cập nhật trạng thái thành công!"),
          onError: (err) => message.error(err.response?.data?.message || "Cập nhật thất bại!")
        });
      }
    });
  };

  // 3. LOGIC TÌM KIẾM TẠI CLIENT
  const displayedStaffs = staffs.filter((staff) => {
    if (!keyword) return true;
    const lowerKeyword = keyword.toLowerCase();
    return (
      (staff.id?.toString() || '').toLowerCase().includes(lowerKeyword) ||
      (staff.username || '').toLowerCase().includes(lowerKeyword) ||
      (staff.email || '').toLowerCase().includes(lowerKeyword) ||
      (staff.phone || '').toLowerCase().includes(lowerKeyword)
    );
  });

  // 4. CẤU HÌNH CỘT CHO BẢNG
  const columns = [
    { 
      title: 'Hồ sơ nhân viên', 
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
                  preview={{ mask: <EyeOutlined /> }} 
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-400 shadow-sm">
                  <UserOutlined className="text-xl" />
                </div>
              )}
              {/* Chấm tròn trạng thái hoạt động gắn lên góc avatar */}
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
                <MailOutlined className="text-slate-400 text-xs" /> {record.email}
             </span>
          </div>
        </div>
      )
    },
    { 
      title: 'Liên hệ', 
      dataIndex: 'phone', 
      key: 'phone',
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
      width: 180,
      render: (_, record) => {
        const config = STATUS_CONFIG[record.status] || STATUS_CONFIG.TERMINATED;
        const isTerminated = record.status === 'TERMINATED';

        // Dropdown Items
        const items = [
          { key: 'ACTIVE', label: 'Hoạt động' },
          { key: 'INACTIVE', label: 'Tạm khóa' },
          { key: 'BANNED', label: 'Bị cấm', danger: true },
          { type: 'divider' },
          { key: 'TERMINATED', label: 'Nghỉ việc', disabled: isTerminated },
        ];

        return (
          <Dropdown 
            menu={{ 
              items, 
              onClick: ({ key }) => handleStatusChange(record.id, record.status, key) 
            }} 
            trigger={['click']}
            disabled={isTerminated}
          >
            <button className={`
              flex items-center justify-between w-full px-3 py-1.5 rounded-lg border text-xs font-bold transition-all
              ${config.color} ${!isTerminated && 'hover:shadow-md cursor-pointer hover:brightness-95'}
              ${isTerminated && 'cursor-not-allowed opacity-80'}
            `}>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                {config.label}
              </div>
              {!isTerminated && <DownOutlined className="text-[10px] opacity-70" />}
            </button>
          </Dropdown>
        );
      }
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        
        {/* Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <IdcardOutlined className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 m-0 leading-tight">Danh sách Nhân viên</h1>
            <p className="text-sm text-slate-500 m-0 mt-1 font-medium">Quản lý hồ sơ và phân quyền truy cập hệ thống</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
            />
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none h-10 px-5 rounded-xl font-bold shadow-md shadow-blue-200 flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
          >
            <UsergroupAddOutlined className="text-lg" /> Thêm Mới
          </Button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <CustomTable 
          dataSource={displayedStaffs}
          columns={columns} 
          loading={isLoading} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* MODAL THÊM MỚI */}
      <Modal 
        title={
          <div className="flex items-center gap-2">
            <UsergroupAddOutlined className="text-blue-600" />
            <span className="text-xl font-black text-slate-800">Cấp Tài Khoản Nhân Viên</span>
          </div>
        } 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={null}
        destroyOnClose 
        width={900}
        centered
        className="premium-modal"
      >
        <AddStaffForm 
          onSuccess={() => setIsModalOpen(false)} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

    </div>
  );
}