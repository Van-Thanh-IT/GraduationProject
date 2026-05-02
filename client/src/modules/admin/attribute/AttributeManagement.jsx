import React, { useState } from 'react';
import { Modal, Input, Switch, message, Tag } from 'antd';
import { SearchOutlined, EditOutlined, SlidersOutlined } from '@ant-design/icons';
import CustomTable from '@/components/ui/CustomTable';
import Button from '@/components/ui/Button';
import AttributeForm from './AttributeFrom';
import { useGetAttributes, useUpdateAttributeStatus } from '@/hooks/useAttributes';

export default function AttributeManagement() {
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);

  // Hook React Query
  const { data: attributes = [], isLoading } = useGetAttributes();
  const { mutate: updateStatus } = useUpdateAttributeStatus();

  const handleStatusChange = (record, newStatus) => {
    Modal.confirm({
      title: newStatus === 'ACTIVE' ? 'Kích hoạt thuộc tính?' : 'Tạm ẩn thuộc tính?',
      content: `Thuộc tính "${record.name}" sẽ được cập nhật trạng thái trên hệ thống.`,
      centered: true,
      onOk: () => {
        updateStatus({ id: record.id, status: newStatus }, {
          onSuccess: () => message.success("Cập nhật thành công!")
        });
      }
    });
  };

  const displayedData = attributes.filter(a => {
    const s = keyword.toLowerCase();
    return (a.name || '').toLowerCase().includes(s) || (a.code || '').toLowerCase().includes(s);
  });

  const getFilterGroupTag = (group) => {
    const colors = { DISPLAY: 'cyan', PERFORMANCE: 'volcano', CAMERA: 'purple', BATTERY: 'green', CONNECTIVITY: 'blue' };
    return <Tag color={colors[group] || 'default'} className="rounded-md font-medium">{group}</Tag>;
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { 
      title: 'Tên thuộc tính', 
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
            <SlidersOutlined />
          </div>
          <span className="font-bold text-slate-700">{record.name}</span>
        </div>
      )
    },
    { 
      title: 'Mã (Code)', 
      render: (_, record) => <code className="text-blue-500 bg-blue-50 px-2 py-1 rounded text-xs font-bold">{record.code}</code>
    },
    { title: 'Nhóm bộ lọc', dataIndex: 'filterGroup', render: (text) => getFilterGroupTag(text) },
    { 
      title: 'Trạng thái', 
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.status === 'ACTIVE'}
          onChange={(checked) => handleStatusChange(record, checked ? 'ACTIVE' : 'INACTIVE')}
          className={record.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-slate-300'}
        />
      )
    },
    {
      title: 'Thao tác', 
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button onClick={() => { setEditingAttribute(record); setIsModalOpen(true); }} className="bg-orange-500 text-white w-9 h-9 rounded-xl flex items-center justify-center p-0 shadow-md shadow-orange-100">
          <EditOutlined />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <Input
          placeholder="Tìm tên hoặc mã thuộc tính..."
          prefix={<SearchOutlined className="text-slate-400" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          className="max-w-md h-11 rounded-xl bg-slate-50 border-none px-4"
        />
        <Button onClick={() => { setEditingAttribute(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 h-11 rounded-xl shadow-lg shadow-blue-200">
          + Thêm thuộc tính
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <CustomTable dataSource={displayedData} columns={columns} loading={isLoading} rowKey="id" />
      </div>

      <Modal 
        title={<span className="text-xl font-black text-slate-800">{editingAttribute ? 'Chỉnh Sửa Thuộc Tính' : 'Tạo Thuộc Tính Mới'}</span>} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={null} 
        destroyOnClose 
        width={500}
        centered
      >
        <AttributeForm initialData={editingAttribute} onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}