// File: src/modules/admin/reviews/AdminReviewList.jsx
import React, { useState } from 'react';
import { Popconfirm, Select, Input, Rate, Image, Dropdown } from 'antd';
import { Trash2, Search, CheckCircle, XCircle, EyeOff, CheckCircle2, MoreVertical } from 'lucide-react';

// Import Custom Hooks vừa tạo
import { useGetAdminReviews, useUpdateReviewStatus, useDeleteReview } from '@/hooks/useReviews';
import CustomTable from '@/components/ui/CustomTable';
import { toast } from 'react-toastify';
import SEO from '@/components/SEO';

const STATUS_TABS = [
  { key: '', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ duyệt', color: 'text-amber-600' },
  { key: 'APPROVED', label: 'Đã duyệt', color: 'text-emerald-600' },
  { key: 'HIDDEN', label: 'Đã ẩn', color: 'text-slate-500' },
];

const ReviewManagement = () => {
  const [filters, setFilters] = useState({
    page: 1,
    size: 10,
    rating: null,
    productId: null,
    status: '', 
  });

  const { data: reviewData, isLoading, isFetching } = useGetAdminReviews(filters);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateReviewStatus();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();

  const reviews = reviewData?.content || [];
  const totalElements = reviewData?.totalElements || 0

  const handleTableChange = (newPagination) => {
    setFilters(prev => ({ ...prev, page: newPagination.current, size: newPagination.pageSize }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 })); // Đổi filter thì reset về trang 1
  };

  const handleUpdateStatus = (id, newStatus) => {
    updateStatus({ id, status: newStatus }, {
      onSuccess: () => toast.success(`Đã chuyển sang trạng thái: ${newStatus}`),
      onError: () => toast.error("Cập nhật trạng thái thất bại!")
    });
  };

  const handleDelete = (id) => {
    deleteReview(id, {
      onSuccess: () => toast.success("Đã xóa đánh giá thành công!"),
      onError: () => toast.error("Lỗi khi xóa đánh giá!")
    });
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
      width: 200,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-600 flex-shrink-0 overflow-hidden shadow-sm">
            {record.userAvatar ? (
              <img src={record.userAvatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              text?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-[13px]">{text}</span>
            <span className="text-[11px] font-medium text-slate-500">ID: {record.userId}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 220,
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-semibold text-slate-700 line-clamp-2 leading-tight" title={record.productName}>
            {record.productName}
          </span>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">ID: {record.productId}</span>
             {record.variantSpecs && (
               <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{record.variantSpecs}</span>
             )}
          </div>
        </div>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 140,
      align: 'center',
      render: (rating) => (
         <div className="flex flex-col items-center gap-1">
            <Rate disabled defaultValue={rating} className="text-[13px] text-amber-500 m-0 leading-none" />
            <span className="text-[11px] font-bold text-slate-500">{rating}/5 sao</span>
         </div>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      width: 300,
      render: (text, record) => (
        <div className="flex flex-col gap-2 py-1">
          <p className="text-[13px] text-slate-700 m-0 line-clamp-3 leading-snug">
            {text || <span className="text-slate-400 italic">Không có nội dung chữ...</span>}
          </p>
          {record.images?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-1">
              <Image.PreviewGroup>
                {record.images.map((img, idx) => (
                  <Image key={idx} width={42} height={42} src={img} className="rounded-lg object-cover border border-slate-200 shadow-sm" />
                ))}
              </Image.PreviewGroup>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      align: 'center',
      render: (_, record) => {
        if (record.status === 'APPROVED') return <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">Đã duyệt</span>;
        if (record.status === 'PENDING') return <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200 shadow-sm animate-pulse">Chờ duyệt</span>;
        return <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 shadow-sm">Đã ẩn</span>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 100,
      align: 'center',
      render: (_, record) => {
        // Cấu hình Menu Dropdown thao tác tùy theo trạng thái hiện tại
        const actionItems = [];
        
        if (record.status === 'PENDING' || record.status === 'HIDDEN') {
          actionItems.push({
            key: 'approve',
            label: <span className="text-emerald-600 font-semibold flex items-center gap-2"><CheckCircle2 size={15}/> Duyệt hiển thị</span>,
            onClick: () => handleUpdateStatus(record.id, 'APPROVED')
          });
        }
        
        if (record.status === 'PENDING' || record.status === 'APPROVED') {
          actionItems.push({
            key: 'hide',
            label: <span className="text-slate-600 font-semibold flex items-center gap-2"><EyeOff size={15}/> Ẩn đánh giá</span>,
            onClick: () => handleUpdateStatus(record.id, 'HIDDEN')
          });
        }

        actionItems.push({ type: 'divider' });
        
        actionItems.push({
          key: 'delete',
          danger: true,
          label: (
            <Popconfirm title="Xóa vĩnh viễn?" description="Đánh giá này sẽ bị xóa khỏi cơ sở dữ liệu." onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
              <div className="font-semibold flex items-center gap-2 w-full"><Trash2 size={15}/> Xóa vĩnh viễn</div>
            </Popconfirm>
          )
        });

        return (
          <Dropdown menu={{ items: actionItems }} trigger={['click']} placement="bottomRight" disabled={isUpdating || isDeleting}>
            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100">
              <MoreVertical size={18} />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <SEO title='Quản lý đánh giá' noIndex/>

      <div className="bg-[#f8fafc] min-h-[calc(100vh-64px)]  flex flex-col gap-2">
        {/* HEADER TỐI GIẢN */}
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-white border border-gray-100 shadow-sm text-indigo-600 rounded-lg">
            <CheckCircle size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Quản Lý Đánh Giá</h1>
            <p className="text-[13px] text-slate-500 font-medium">Kiểm duyệt và quản lý bình luận từ khách hàng</p>
          </div>
        </div>

        {/* KHU VỰC ĐIỀU KHIỂN: TABS TRẠNG THÁI & BỘ LỌC */}
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
          
          {/* TABS TRẠNG THÁI */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full xl:w-auto custom-scrollbar pb-1 xl:pb-0">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleFilterChange('status', tab.key)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all ${
                  filters.status === tab.key 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* INPUTS BỘ LỌC */}
          <div className="flex items-center gap-2 w-full xl:w-auto">
            <div className="w-full sm:w-40 shrink-0">
              <Select
                allowClear
                placeholder="Tất cả số sao"
                value={filters.rating}
                onChange={(value) => handleFilterChange('rating', value)}
                className="w-full custom-select-ui h-[38px]"
                options={[
                  { value: 5, label: '5 Sao (⭐⭐⭐⭐⭐)' },
                  { value: 4, label: '4 Sao (⭐⭐⭐⭐)' },
                  { value: 3, label: '3 Sao (⭐⭐⭐)' },
                  { value: 2, label: '2 Sao (⭐⭐)' },
                  { value: 1, label: '1 Sao (⭐)' },
                ]}
              />
            </div>
            
            <div className="relative w-full sm:w-60 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={15} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Nhập ID sản phẩm..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-[13px] transition-all outline-none font-medium shadow-sm h-[38px]"
                value={filters.productId || ''}
                onChange={(e) => handleFilterChange('productId', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <CustomTable
            columns={columns}
            dataSource={reviews}
            loading={isLoading || isFetching} 
            currentPage={filters.page}
            pageSize={filters.size}
            total={totalElements}
            onChange={handleTableChange}
            rowKey="id"
            bordered={false}
            className="custom-modern-table"
          />
        </div>
      </div>
    </>
  );
};

export default ReviewManagement;