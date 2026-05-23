import React, { useState } from 'react';
import { Tag, Switch, Popconfirm, Image, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, LinkOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import CustomTable from '@/components/ui/CustomTable';
import Button from '@/components/ui/Button';
import BannerForm from './components/BannerForm';
import { useAdminBanners } from '@/hooks/useAdminBanners';

export default function BannerManagementPage() {
  // Spring Boot dùng page bắt đầu từ 0
  const [page, setPage] = useState(0); 
  const [size, setSize] = useState(10);
  
  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // GỌI API THÔNG QUA HOOK
  const { getBanners, createBanner, updateBanner, deleteBanner } = useAdminBanners(page, size);
  const { data: pageData, isLoading } = getBanners;
  
  // Bóc tách dữ liệu từ API Response
  const banners = pageData?.content || [];
  const totalElements = pageData?.totalElements || 0;

  // --- HANDLERS ---
  const handleTableChange = (pagination) => {
    // Antd đếm trang từ 1, ta trừ đi 1 để gửi về Spring Boot (đếm từ 0)
    setPage(pagination.current - 1);
    setSize(pagination.pageSize);
  };

  const handleSubmit = (formData) => {
    if (editingBanner) {
      updateBanner.mutate({ id: editingBanner.id, formData }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createBanner.mutate(formData, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  // --- CẤU HÌNH CỘT TABLE ---
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      width: 160,
      render: (img, record) => (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-1 h-20">
          <Image src={img} alt="banner" className="object-contain w-full h-full max-h-16 rounded" />
          {record.mobileImageUrl && (
            <div className="absolute top-0 right-0 bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">
              Mobile
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Thông tin chiến dịch',
      dataIndex: 'title',
      render: (text, record) => (
        <div className="flex flex-col gap-1.5">
          <span className="font-bold text-slate-800 text-[15px] line-clamp-1">{text}</span>
          <div className="flex gap-2 text-xs items-center">
            <Tag color={record.placement === 'HOME_MAIN_SLIDER' ? 'blue' : 'purple'} className="m-0 border-0 font-semibold">
              {record.placement}
            </Tag>
            {record.targetUrl && (
              <a href={record.targetUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                <LinkOutlined /> Link đích
              </a>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Thời gian chạy',
      width: 180,
      render: (_, record) => {
        if (!record.startDate && !record.endDate) return <span className="text-slate-400 font-medium text-xs bg-slate-100 px-2 py-1 rounded">Không giới hạn</span>;
        return (
          <div className="text-[12px] text-slate-600 flex flex-col gap-1">
            <div className="flex items-center gap-1.5"><ClockCircleOutlined className="text-emerald-500"/> <span className="font-semibold">{record.startDate ? dayjs(record.startDate).format('HH:mm DD/MM/YY') : '-'}</span></div>
            <div className="flex items-center gap-1.5"><ClockCircleOutlined className="text-rose-400"/> <span className="font-semibold">{record.endDate ? dayjs(record.endDate).format('HH:mm DD/MM/YY') : '-'}</span></div>
          </div>
        );
      }
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'sortOrder',
      align: 'center',
      width: 90,
      render: (val) => <span className="font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">{val}</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      align: 'center',
      width: 110,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'} className="m-0 font-bold px-2 py-0.5 border-0 rounded-md">
          {isActive ? 'Đang Bật' : 'Đã Tắt'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      align: 'center',
      width: 110,
      render: (_, record) => (
        <Space size="middle">
          <button 
             onClick={() => { setEditingBanner(record); setIsModalOpen(true); }}
             className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
          >
            <EditOutlined className="text-[16px]" />
          </button>
          
          <Popconfirm
            title="Xóa Banner"
            description="Chắc chắn xóa banner này? Hành động không thể hoàn tác."
            onConfirm={() => deleteBanner.mutate(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <button className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
              <DeleteOutlined className="text-[16px]" />
            </button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-[1300px] mx-auto space-y-2">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-2 rounded-[20px] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight m-0">Quản lý Banner Quảng Cáo</h1>
            <p className="text-sm text-slate-500 font-medium mt-1 m-0">Cấu hình hình ảnh hiển thị trên toàn hệ thống</p>
          </div>
          
          <Button 
            variant="primary" 
            onClick={() => { setEditingBanner(null); setIsModalOpen(true); }}
             className="bg-indigo-600 hover:bg-indigo-700 text-white border-none h-[44px] px-6 rounded-xl font-bold shadow-md shadow-indigo-200 whitespace-nowrap transition-all active:scale-95"
          >
            <PlusOutlined /> Thêm Banner
          </Button>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden p-2">
          <CustomTable 
            columns={columns}
            dataSource={banners}
            rowKey="id"
            loading={isLoading}
            
            // Map state phân trang vào CustomTable
            total={totalElements}
            currentPage={page + 1} // Giao diện Antd cần base 1
            pageSize={size}
            onChange={handleTableChange}
          />
        </div>

        {/* GỌI MODAL THÊM/SỬA */}
        <BannerForm 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingBanner}
          onSubmit={handleSubmit}
          isPending={createBanner.isPending || updateBanner.isPending}
        />

      </div>
    </div>
  );
}