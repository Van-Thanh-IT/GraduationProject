// File: src/modules/admin/products/ProductManagement.jsx
import React, { useState } from 'react';
import { Modal, Image, Spin, Dropdown, Tooltip } from 'antd';
import { 
  SearchOutlined, 
  EditOutlined, 
  PictureOutlined,
  AppstoreOutlined, 
  BuildOutlined, 
  TagsOutlined,
  DownOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';

import CustomTable from '@/components/ui/CustomTable';
import Button from '@/components/ui/Button';
import AddProductForm from './components/AddProductForm';
import EditProductForm from './components/EditProductForm';
import API from '@/api/API'; 

import { useGetAllProducts, useUpdateProductStatus, useGetProductStats } from '@/hooks/useProducts';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
  ACTIVE: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Đang bán' },
  INACTIVE: { color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Ngừng bán' },
  OUT_OF_STOCK: { color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Hết hàng' },
};

const ProductStatsCell = ({ productId }) => {
  const { data: stats, isLoading } = useGetProductStats(productId);

  if (isLoading) {
    return <div className="h-10 flex items-center"><Spin size="small" /></div>;
  }

  const vCount = stats?.totalVariants || 0;
  const iCount = stats?.totalImages || 0;
  const aCount = stats?.totalAttributes || 0;

  return (
    <div className="flex flex-col gap-1 text-[11px] font-bold">
      <div className="flex items-center gap-1.5">
        <span className={`px-1.5 py-0.5 rounded w-6 text-center border text-[10px] ${vCount > 0 ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
          {vCount}
        </span>
        <span className="text-gray-400 font-medium text-[10px]">Biến thể</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`px-1.5 py-0.5 rounded w-6 text-center border text-[10px] ${iCount > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
          {iCount}
        </span>
        <span className="text-gray-400 font-medium text-[10px]">Hình ảnh</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`px-1.5 py-0.5 rounded w-6 text-center border text-[10px] ${aCount > 0 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
          {aCount}
        </span>
        <span className="text-gray-400 font-medium text-[10px]">Thông số</span>
      </div>
    </div>
  );
};

export default function ProductManagement() {
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); 

  const { data: products = [], isLoading: isProductsLoading } = useGetAllProducts();
  const { mutate: updateStatus } = useUpdateProductStatus();

  const { data: globalStats = {} } = useQuery({
    queryKey: ['globalProductStats'],
    queryFn: async () => {
      const res = await API.get('/management/dashboard/stats');
      return res.data?.data || { totalProducts: 0, totalVariants: 0, totalAttributes: 0, totalImages: 0 };
    }
  });

  const handleStatusChange = (productId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return; 

    Modal.confirm({
      title: <span className="font-bold text-base">Đổi trạng thái sản phẩm?</span>,
      content: `Xác nhận chuyển sản phẩm sang trạng thái "${STATUS_CONFIG[newStatus]?.label || newStatus}"?`,
      centered: true,
      onOk: () => {
        updateStatus({ id: productId, status: newStatus }, {
          onSuccess: () => toast.success("Cập nhật thành công!"),
          onError: () => toast.error("Cập nhật thất bại!")
        });
      }
    });
  };

  const handleAddClick = () => {
    setEditingProduct(null); 
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null); 
  };

  const displayedProducts = products.filter((product) => {
    if (!keyword) return true;
    const lowerKeyword = keyword.toLowerCase();
    return (
      (product.name || '').toLowerCase().includes(lowerKeyword) ||
      (product.brandName || '').toLowerCase().includes(lowerKeyword) ||
      (product.categoryName || '').toLowerCase().includes(lowerKeyword) ||
      (product.slug || '').toLowerCase().includes(lowerKeyword)
    );
  });

  const columns = [
    { 
      title: 'Hồ sơ sản phẩm', 
      key: 'product',
      width: 320,
      render: (_, record) => (
        <div className="flex items-center gap-3 py-0.5 max-w-[320px]">
          {record.thumbnail ? (
             <Image
               src={record.thumbnail} 
               alt="thumbnail"
               width={44}
               height={44}
               className="rounded-lg object-contain border border-gray-200 bg-white"
               preview={true} 
             />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 shrink-0">
              <PictureOutlined className="text-lg" />
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
             {/* ẨN TÊN DÀI VÀ HIỂN THỊ TOOLTIP KHI RÊ CHUỘT VÀO */}
             <Tooltip title={record.name} placement="topLeft" mouseEnterDelay={0.2}>
                <span className="font-bold text-gray-800 text-[13.5px] block truncate cursor-pointer hover:text-blue-600 transition-colors">
                  {record.name}
                </span>
             </Tooltip>
             <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-1 rounded border border-blue-100">#{record.id}</span>
                <span className="text-[11px] text-gray-400 truncate flex-1" title={record.slug}>SKU: {record.slug}</span>
             </div>
          </div>
        </div>
      )
    },
    { 
      title: 'Phân loại', 
      key: 'classification',
      width: 200,
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded w-max border border-gray-100">
            Hãng: <span className="text-blue-600 font-bold">{record.brandName || '---'}</span>
          </span>
          <span className="text-[11px] font-semibold text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded w-max border border-gray-100">
            Mục: <span className="text-orange-600 font-bold">{record.categoryName || '---'}</span>
          </span>
        </div>
      )
    },
    {
      title: 'Thành phần',
      key: 'metrics',
      width: 140,
      render: (_, record) => <ProductStatsCell productId={record.id} />
    },
    { 
      title: 'Trạng thái', 
      key: 'status', 
      width: 130,
      render: (_, record) => {
        const config = STATUS_CONFIG[record.status] || STATUS_CONFIG.INACTIVE;
        
        const items = [
          { key: 'ACTIVE', label: 'Đang bán' },
          { key: 'INACTIVE', label: 'Ngừng bán', danger: true },
          { type: 'divider' },
          { key: 'OUT_OF_STOCK', label: 'Hết hàng', disabled: true },
        ];

        return (
          <Dropdown 
            menu={{ items, onClick: ({ key }) => handleStatusChange(record.id, record.status, key) }} 
            trigger={['click']}
          >
            <button type="button" className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer hover:border-gray-300 ${config.color}`}>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                {config.label}
              </div>
              <DownOutlined className="text-[8px] opacity-60" />
            </button>
          </Dropdown>
        );
      }
    },
    {
      title: 'Thao tác', 
      key: 'action', 
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button 
          type="button"
          onClick={() => handleEditClick(record)} 
          className="bg-white hover:bg-gray-50 text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-gray-300 w-8 h-8 rounded-lg flex items-center justify-center p-0 transition-colors shadow-none"
          title="Chỉnh sửa sản phẩm"
        >
          <EditOutlined className="text-sm" />
        </Button>
      )
    }
  ];

  return (
    <div className="p-3 max-w-[1200px] mx-auto min-h-screen space-y-4 font-sans">
      
      {/* THỐNG KÊ KPI PHẲNG */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Tổng Sản Phẩm" value={globalStats.totalProducts} icon={<AppstoreOutlined />} color="blue" />
        <KpiCard title="Tổng Biến Thể" value={globalStats.totalVariants} icon={<BuildOutlined />} color="purple" />
        <KpiCard title="Thuộc Tính" value={globalStats.totalAttributes} icon={<TagsOutlined />} color="orange" />
        <KpiCard title="Hình Ảnh" value={globalStats.totalImages} icon={<PictureOutlined />} color="emerald" />
      </div>

      {/* SEARCH BAR & HEADER THU GỌN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
            <InboxOutlined className="text-xl" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800 uppercase tracking-wide m-0 leading-none">Kho Sản Phẩm</h1>
            <p className="text-xs text-gray-400 m-0 mt-1">Quản lý mặt hàng và cấu hình trạng thái</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Tìm theo tên, hãng..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 h-9 bg-gray-50 border border-gray-200 rounded-lg outline-none text-xs transition-colors focus:bg-white focus:border-gray-400"
            />
          </div>
          
          <Button 
            type="button"
            onClick={handleAddClick} 
            className="bg-blue-600 hover:bg-blue-700 text-white border-none h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-colors"
          >
            + Thêm Mới
          </Button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-1">
         <CustomTable 
           dataSource={displayedProducts} 
           columns={columns} 
           loading={isProductsLoading} 
           rowKey="id"    
         />
      </div>

      {/* MODAL BIỂU MẪU */}
      <Modal 
        title={
          <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <InboxOutlined className="text-blue-600 text-lg" />
            <span className="text-base font-bold text-gray-800 uppercase tracking-wide">
              {editingProduct ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </span>
          </div>
        } 
        open={isModalOpen} 
        onCancel={handleCloseModal} 
        footer={null}
        destroyOnClose 
        width={editingProduct ? 1100 : 900} 
        centered
      >
        <div className="mt-4">
          {editingProduct ? (
            <EditProductForm 
              initialData={editingProduct} 
              onSuccess={handleCloseModal} 
              onCancel={handleCloseModal} 
            />
          ) : (
            <AddProductForm 
              onSuccess={handleCloseModal} 
              onCancel={handleCloseModal} 
            />
          )}
        </div>
      </Modal>
    </div>
  );
}

const KpiCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3 relative overflow-hidden">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg shrink-0 border ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 m-0">{title}</p>
        <h3 className="text-xl font-bold text-gray-800 m-0 leading-none">{value}</h3>
      </div>
    </div>
  );
};