import React, { useState } from 'react';
import { Tag, Popconfirm, Image, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import CustomTable from '@/components/ui/CustomTable'; 
import Button from '@/components/ui/Button'; 
import ArticleModal from './components/ArticleModal';
import { useAdminArticles } from '@/hooks/useAdminArticles';

export default function ArticleManagement() {
  const [page, setPage] = useState(0); 
  const [size, setSize] = useState(10);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  // Lấy dữ liệu từ Hook
  const { getArticles, createArticle, updateArticle, deleteArticle } = useAdminArticles(page, size);
  const { data: pageData, isLoading } = getArticles;
  
  const articles = pageData?.content || [];
  const totalElements = pageData?.totalElements || 0;

  // Handlers
  const handleTableChange = (pagination) => {
    setPage(pagination.current - 1);
    setSize(pagination.pageSize);
  };

  const handleSubmit = (formData) => {
    if (editingArticle) {
      updateArticle.mutate({ id: editingArticle.id, formData }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createArticle.mutate(formData, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const getStatusTag = (status) => {
    switch(status) {
      case 'PUBLISHED': return <Tag color="success" className="font-bold border-0">Xuất bản</Tag>;
      case 'DRAFT': return <Tag color="warning" className="font-bold border-0">Bản nháp</Tag>;
      case 'HIDDEN': return <Tag color="default" className="font-bold border-0">Đã ẩn</Tag>;
      default: return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Ảnh bìa',
      dataIndex: 'thumbnailUrl',
      width: 140,
      render: (img) => (
        <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-1 h-20 aspect-video">
          {img ? <Image src={img} alt="thumbnail" className="object-cover w-full h-full rounded" /> : <span className="text-xs text-gray-400">No Image</span>}
        </div>
      )
    },
    {
      title: 'Thông tin bài viết',
      render: (_, record) => (
        <div className="flex flex-col gap-1.5 py-1">
          <span className="font-bold text-slate-800 text-[15px] line-clamp-2 leading-snug hover:text-indigo-600 transition-colors cursor-pointer">
            {record.title}
          </span>
          <div className="flex gap-4 text-[12px] text-gray-500 mt-1">
            <span className="flex items-center gap-1"><UserOutlined /> {record.authorName || 'Ẩn danh'}</span>
            <span className="flex items-center gap-1"><EyeOutlined /> {record.viewCount} lượt xem</span>
          </div>
        </div>
      )
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'createdAt',
      width: 150,
      render: (date) => (
        <div className="text-[13px] text-slate-600 font-medium">
          {dayjs(date).format('HH:mm - DD/MM/YYYY')}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center',
      width: 120,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Hành động',
      align: 'center',
      width: 110,
      render: (_, record) => (
        <Space size="middle">
          <button 
             onClick={() => { setEditingArticle(record); setIsModalOpen(true); }}
             className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
          >
            <EditOutlined className="text-[16px]" />
          </button>
          
          <Popconfirm
            title="Xóa Bài Viết"
            description="Chắc chắn xóa bài viết này? Không thể khôi phục."
            onConfirm={() => deleteArticle.mutate(record.id)}
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
    <div className="p-4 md:p-6 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-[1300px] mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[20px] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight m-0">Quản lý Tin Tức & Bài Viết</h1>
            <p className="text-sm text-slate-500 font-medium mt-1 m-0">Đăng tải thông tin, khuyến mãi và đánh giá công nghệ</p>
          </div>
          
          <Button 
            variant="primary" 
            onClick={() => { setEditingArticle(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 shadow-md shadow-indigo-200"
          >
            <PlusOutlined /> Viết bài mới
          </Button>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden p-2">
          <CustomTable 
            columns={columns}
            dataSource={articles}
            rowKey="id"
            loading={isLoading}
            total={totalElements}
            currentPage={page + 1}
            pageSize={size}
            onChange={handleTableChange}
          />
        </div>

        {/* GỌI MODAL THÊM/SỬA */}
        <ArticleModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingArticle}
          onSubmit={handleSubmit}
          isPending={createArticle.isPending || updateArticle.isPending}
        />

      </div>
    </div>
  );
}