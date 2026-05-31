import React, { useState } from 'react';
import { Modal, Input, Image, Switch, Tag } from 'antd';
import { SearchOutlined, EditOutlined, PictureOutlined } from '@ant-design/icons';
import CustomTable from '@/components/ui/CustomTable';
import Button from '@/components/ui/Button';
import CategoryForm from './CategoryForm';
import { useGetCategories, useUpdateCategoryStatus } from '@/hooks/useCategories';
import toast from 'react-hot-toast';

export default function CategoryManagement() {
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { data: categories = [], isLoading } = useGetCategories();
  const { mutate: updateStatus } = useUpdateCategoryStatus();

  const handleStatusChange = (record, newStatus) => {
    Modal.confirm({
      title: newStatus === 'ACTIVE' ? 'Kích hoạt danh mục?' : 'Tạm ẩn danh mục?',
      content: `Danh mục "${record.name}" sẽ được ${newStatus === 'ACTIVE' ? 'hiển thị' : 'ẩn'} trên hệ thống.`,
      centered: true,
      onOk: () => {
        updateStatus({ id: record.id, status: newStatus }, {
          onSuccess: () => toast.success("Cập nhật trạng thái thành công!")
        });
      }
    });
  };

  const displayedData = categories.filter(c => 
    (c.name || '').toLowerCase().includes(keyword.toLowerCase())
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { 
      title: 'Ảnh', 
      width: 80,
      render: (_, record) => record.imageUrl ? (
        <Image src={record.imageUrl} width={45} height={45} className="rounded-lg object-cover border" />
      ) : (
        <div className="w-11 h-11 rounded-lg bg-slate-50 border flex items-center justify-center text-slate-400"><PictureOutlined /></div>
      )
    },
    { 
      title: 'Tên danh mục', 
      render: (_, record) => (
        <div>
          <p className="font-semibold text-slate-700">{record.name}</p>
          {record.description && <p className="text-xs text-slate-400 line-clamp-1">{record.description}</p>}
        </div>
      )
    },
    { 
      title: 'Danh mục cha', 
      render: (_, record) => {
        if (!record.parentId) return <Tag color="default">Root</Tag>;
        const parent = categories.find(c => c.id === record.parentId);
        return <Tag color="blue">{parent?.name || `ID: ${record.parentId}`}</Tag>;
      }
    },
    { 
      title: 'Trạng thái', 
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.status === 'ACTIVE'}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
          onChange={(checked) => handleStatusChange(record, checked ? 'ACTIVE' : 'INACTIVE')}
          className={record.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-slate-400'}
        />
      )
    },
    {
      title: 'Thao tác', 
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button onClick={() => { setEditingCategory(record); setIsModalOpen(true); }} className="bg-orange-500 text-white w-8 h-8 rounded-lg flex items-center justify-center p-0">
          <EditOutlined />
        </Button>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-2 bg-white p-2 rounded-lg shadow-sm">
        <Input
          placeholder="Tìm tên danh mục..."
          prefix={<SearchOutlined className="text-slate-400" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          className="max-w-md px-4 py-2 rounded-xl"
        />
        <Button onClick={() => { setEditingCategory(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-xl">
          + Thêm danh mục
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <CustomTable 
        dataSource={displayedData}
        columns={columns} 
        loading={isLoading} rowKey="id" />
      </div>

      <Modal 
        title={<span className="text-lg font-bold">{editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}</span>} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={null}
        destroyOnClose 
        width={600}
      >
        <CategoryForm 
          initialData={editingCategory} 
          categories={categories} 
          onSuccess={() => setIsModalOpen(false)} 
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}