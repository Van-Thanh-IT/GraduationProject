import React, { useState } from 'react';
import { Modal, Input, Image, Spin, Dropdown, message } from 'antd';
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
import { ProductService } from '@/services/product.service'; 
import AddProductForm from './components/AddProductForm';
import EditProductForm from './components/EditProductForm';
// import AdminReviewList from '../review/ReviewManagement';
import API from '@/api/API'; 

// IMPORT HOOKS ĐÃ TẠO
import { useGetAllProducts, useUpdateProductStatus, useGetProductStats } from '@/hooks/useProducts';
import AdminReviewList from '../review/ReviewManagement';

// CẤU HÌNH TRẠNG THÁI PREMIUM UI
const STATUS_CONFIG = {
  ACTIVE: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Đang bán' },
  INACTIVE: { color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Ngừng bán' },
  OUT_OF_STOCK: { color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Hết hàng' },
};

// ==========================================
// COMPONENT CON: CELL THỐNG KÊ SẢN PHẨM
// ==========================================
const ProductStatsCell = ({ productId }) => {
  // Tự động fetch và cache bằng Hook!
  const { data: stats, isLoading } = useGetProductStats(productId);

  if (isLoading) {
    return <div className="h-10 flex items-center"><Spin size="small" /></div>;
  }

  const vCount = stats?.totalVariants || 0;
  const iCount = stats?.totalImages || 0;
  const aCount = stats?.totalAttributes || 0;

  return (
    <div className="flex flex-col gap-1.5 text-[11px] font-bold">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded w-7 text-center border ${vCount > 0 ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
          {vCount}
        </span>
        <span className="text-slate-500 uppercase tracking-wider text-[10px]">Biến thể</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded w-7 text-center border ${iCount > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
          {iCount}
        </span>
        <span className="text-slate-500 uppercase tracking-wider text-[10px]">Hình ảnh</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded w-7 text-center border ${aCount > 0 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
          {aCount}
        </span>
        <span className="text-slate-500 uppercase tracking-wider text-[10px]">Thông số</span>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT CHÍNH: QUẢN LÝ SẢN PHẨM
// ==========================================
export default function ProductManagement() {
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); 

  // HOOKS LẤY DỮ LIỆU
  const { data: products = [], isLoading: isProductsLoading } = useGetAllProducts();
  const { mutate: updateStatus } = useUpdateProductStatus();

  // Hook tạm lấy Global Stats (Sử dụng useQuery trực tiếp cho lẹ)
  const { data: globalStats = {} } = useQuery({
    queryKey: ['globalProductStats'],
    queryFn: async () => {
      const res = await API.get('/admin/dashboard/stats');
      return res.data?.data || { totalProducts: 0, totalVariants: 0, totalAttributes: 0, totalImages: 0 };
    }
  });

  // HANDLERS
  const handleStatusChange = (productId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return; 

    Modal.confirm({
      title: <span className="font-bold text-lg">Đổi trạng thái sản phẩm?</span>,
      content: `Xác nhận chuyển sản phẩm sang trạng thái "${STATUS_CONFIG[newStatus]?.label || newStatus}"?`,
      centered: true,
      okButtonProps: { className: 'bg-blue-600 hover:bg-blue-700 shadow-md' },
      onOk: () => {
        updateStatus({ id: productId, status: newStatus }, {
          onSuccess: () => message.success("Cập nhật thành công!"),
          onError: () => message.error("Cập nhật thất bại!")
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

  // TÌM KIẾM CLIENT-SIDE
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

  // CẤU HÌNH CỘT BẢNG
  const columns = [
    { 
      title: 'Hồ sơ sản phẩm', 
      key: 'product',
      render: (_, record) => (
        <div className="flex items-start gap-4 py-1">
          {record.thumbnail ? (
             <Image
               src={record.thumbnail} 
               alt="thumbnail"
               width={56}
               height={56}
               className="rounded-xl object-cover border border-slate-200 shadow-sm"
               preview={true} 
             />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm shrink-0">
              <PictureOutlined className="text-2xl" />
            </div>
          )}
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-[15px] line-clamp-1">{record.name}</span>
             </div>
             <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">#{record.id}</span>
                <span className="text-xs font-medium text-slate-400 truncate max-w-[200px]">SKU: {record.slug}</span>
             </div>
          </div>
        </div>
      )
    },
    { 
      title: 'Phân loại', 
      key: 'classification',
      render: (_, record) => (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded w-max border border-slate-100">
            Thương hiệu: <span className="text-blue-600">{record.brandName || '---'}</span>
          </span>
          <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded w-max border border-slate-100">
            Danh mục: <span className="text-orange-600">{record.categoryName || '---'}</span>
          </span>
        </div>
      )
    },
    {
      title: 'Thành phần',
      key: 'metrics',
      render: (_, record) => <ProductStatsCell productId={record.id} />
    },
    { 
      title: 'Trạng thái', 
      key: 'status', 
      width: 160,
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
            <button className={`
              flex items-center justify-between w-full px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:shadow-md hover:brightness-95 ${config.color}
            `}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
                {config.label}
              </div>
              <DownOutlined className="text-[10px] opacity-70" />
            </button>
          </Dropdown>
        );
      }
    },
    {
      title: 'Thao tác', 
      key: 'action', 
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button 
          onClick={() => handleEditClick(record)} 
          className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-100 hover:border-blue-300 w-10 h-10 rounded-xl flex items-center justify-center p-0 transition-all shadow-sm"
          title="Chỉnh sửa sản phẩm"
        >
          <EditOutlined className="text-base" />
        </Button>
      )
    }
  ];

  return (
    <div className="p-2 md:p-2 max-w-[1090px] mx-auto min-h-screen space-y-2">
      
      {/* KHU VỰC THỐNG KÊ NHANH */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        <KpiCard title="Tổng Sản Phẩm" value={globalStats.totalProducts} icon={<AppstoreOutlined />} color="blue" />
        <KpiCard title="Tổng Biến Thể" value={globalStats.totalVariants} icon={<BuildOutlined />} color="purple" />
        <KpiCard title="Thuộc Tính" value={globalStats.totalAttributes} icon={<TagsOutlined />} color="orange" />
        <KpiCard title="Hình Ảnh" value={globalStats.totalImages} icon={<PictureOutlined />} color="emerald" />
      </div>

      {/* HEADER & THANH TÌM KIẾM */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <InboxOutlined className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 m-0 leading-tight">Kho Sản Phẩm</h1>
            <p className="text-sm text-slate-500 m-0 mt-1 font-medium">Quản lý mặt hàng và cấu hình hiển thị</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Tìm theo tên, hãng, danh mục..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
            />
          </div>
          
          <Button 
            onClick={handleAddClick} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-none h-[44px] px-6 rounded-xl font-bold shadow-md shadow-indigo-200 whitespace-nowrap transition-all active:scale-95"
          >
            + Thêm Mới
          </Button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-2">
           <CustomTable 
             dataSource={displayedProducts} 
             columns={columns} 
             loading={isProductsLoading} 
             rowKey="id" 
             pagination={{ pageSize: 10 }}
           />
        </div>
        <AdminReviewList/>
      </div>

      {/* MODAL THÊM/SỬA SẢN PHẨM GỐC */}
      <Modal 
        title={
          <div className="flex items-center gap-2">
            <InboxOutlined className="text-indigo-600 text-xl" />
            <span className="text-xl font-black text-slate-800">
              {editingProduct ? `Cập Nhật: ${editingProduct.name}` : 'Thêm Sản Phẩm Mới'}
            </span>
          </div>
        } 
        open={isModalOpen} 
        onCancel={handleCloseModal} 
        footer={null}
        destroyOnClose 
        width={editingProduct ? 1100 : 900} 
        centered
        className="premium-modal"
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

// ==========================================
// COMPONENT PHỤ: THẺ KPI
// ==========================================
const KpiCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-600 text-blue-600 icon-bg-blue',
    purple: 'bg-purple-500 text-purple-600 icon-bg-purple',
    orange: 'bg-orange-500 text-orange-600 icon-bg-orange',
    emerald: 'bg-emerald-500 text-emerald-600 icon-bg-emerald',
  };
  
  // Custom styles for soft icon backgrounds
  const iconBgMap = {
    blue: 'bg-blue-50 border-blue-100',
    purple: 'bg-purple-50 border-purple-100',
    orange: 'bg-orange-50 border-orange-100',
    emerald: 'bg-emerald-50 border-emerald-100',
  };

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${iconBgMap[color]} ${colorMap[color].split(' ')[1]}`}>
        {icon}
      </div>
      <div className="z-10 relative">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 m-0 leading-none">{value}</h3>
      </div>
    </div>
  );
};