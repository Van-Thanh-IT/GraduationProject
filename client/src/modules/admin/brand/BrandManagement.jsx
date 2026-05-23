import React, { useState } from 'react';
import { Modal, Input, Image, Switch, message } from 'antd';
import { SearchOutlined, EditOutlined, PictureOutlined } from '@ant-design/icons';
import CustomTable from '@/components/ui/CustomTable';
import Button from '@/components/ui/Button';
import BrandForm from './BrandFrom';
import { useGetBrands, useUpdateBrandStatus } from '@/hooks/useBrands';

export default function BrandManagement() {
  const [keyword, setKeyword] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // 1. Lấy dữ liệu từ React Query
  // brands sẽ tự động có dữ liệu, isLoading tự động quản lý trạng thái xoay vòng
  const { data: brands = [], isLoading } = useGetBrands();
  
  // 2. Hook cập nhật trạng thái
  const { mutate: updateStatus } = useUpdateBrandStatus();

  const handleStatusChange = (record, newStatus) => {
    const isActivating = newStatus === 'ACTIVE';
    
    Modal.confirm({
      title: isActivating ? 'Kích hoạt thương hiệu?' : 'Tạm ẩn thương hiệu?',
      content: isActivating 
        ? `Thương hiệu "${record.name}" sẽ hiển thị trở lại trên hệ thống.` 
        : `Thương hiệu "${record.name}" sẽ bị ẩn khỏi hệ thống.`,
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      centered: true,
      onOk: () => {
        // mutate nhận vào object {id, status} như đã định nghĩa trong Hook
        updateStatus({ id: record.id, status: newStatus }, {
          onSuccess: () => {
            message.success("Cập nhật trạng thái thành công!");
          },
          onError: () => {
            message.error("Cập nhật trạng thái thất bại!");
          }
        });
      }
    });
  };

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingBrand(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  // Logic filter dữ liệu tại client
  const displayedData = brands.filter(b => 
    (b.name || '').toLowerCase().includes(keyword.toLowerCase())
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { 
      title: 'Logo', 
      width: 100,
      align: 'center',
      render: (_, record) => (record.logoUrl || record.imageUrl) ? (
        <div className="w-14 h-14 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden p-1 shadow-sm">
           <Image src={record.logoUrl || record.imageUrl} width="100%" height="100%" className="object-contain" />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
          <PictureOutlined />
        </div>
      )
    },
    { 
      title: 'Tên thương hiệu', 
      render: (_, record) => (
        <div>
          <p className="font-semibold text-slate-700 text-base">{record.name}</p>
          {record.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{record.description}</p>}
        </div>
      )
    },
    { 
      title: 'Trạng thái', 
      width: 140,
      align: 'center',
      render: (_, record) => {
        const isActive = record.status === 'ACTIVE';
        return (
          <Switch
            checked={isActive}
            checkedChildren="Hoạt động"
            unCheckedChildren="Tạm ẩn"
            onChange={(checked) => {
              const newStatus = checked ? 'ACTIVE' : 'INACTIVE';
              handleStatusChange(record, newStatus);
            }}
            className={isActive ? 'bg-blue-600' : 'bg-slate-400'}
          />
        );
      }
    },
    {
      title: 'Thao tác', 
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button 
          onClick={() => handleOpenEdit(record)} 
          className="bg-orange-500 hover:bg-orange-600 text-white w-8 h-8 rounded-lg flex items-center justify-center p-0"
        >
          <EditOutlined />
        </Button>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-2 bg-white p-2 rounded-lg shadow-sm">
        <Input
          placeholder="Tìm tên thương hiệu..."
          prefix={<SearchOutlined className="text-slate-400" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          className="max-w-md px-4 py-2 rounded-xl"
        />
        <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl shadow-md">
          + Thêm thương hiệu
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <CustomTable 
          dataSource={displayedData} 
          columns={columns} 
          loading={isLoading} 
          rowKey="id" 
        />
      </div>

      <Modal 
        title={<span className="text-lg font-bold">{editingBrand ? 'Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới'}</span>} 
        open={isModalOpen} 
        onCancel={handleCloseModal} 
        footer={null}
        destroyOnClose 
        width={500}
      >
        <BrandForm 
          initialData={editingBrand} 
          onSuccess={handleCloseModal} // onSuccess của React Query trong Form sẽ gọi hàm này
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}