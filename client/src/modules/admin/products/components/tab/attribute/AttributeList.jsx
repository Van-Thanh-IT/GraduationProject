import React, { useState, useEffect } from 'react';
import { Table, Button as AntButton, Popconfirm, message, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import { ProductService } from '@/services/product.service';
import AttributeForm from './AttributeForm';

export default function AttributeList({ productId }) {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Quản lý Modal Thêm/Sửa thuộc tính
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState(null);

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const res = await ProductService.getAttributesByProductId(productId);
      setAttributes(res.data?.data || []);
    } catch (error) {
      message.error("Lỗi lấy danh sách thông số kỹ thuật!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchAttributes();
  }, [productId]);

  const handleDelete = async (id) => {
    try {
      await ProductService.deleteProductAttribute(id);
      message.success("Xóa thông số thành công!");
      fetchAttributes();
    } catch (error) {
      message.error("Xóa thông số thất bại!");
    }
  };

  const openAddModal = () => {
    setEditingAttr(null);
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingAttr(record);
    setIsModalOpen(true);
  };

  const columns = [
    { 
      title: 'Tên thông số', 
      dataIndex: ['attribute', 'name'], // Giả sử API trả về attribute.name
      key: 'attributeName',
      render: (text, record) => <span className="font-semibold text-slate-700">{text || record.attributeName || `Thông số ID: ${record.attribute?.id || record.attributeId}`}</span>
    },
    { 
      title: 'Giá trị thông số', 
      dataIndex: 'value', 
      key: 'value',
      render: (text) => <span className="text-blue-600 font-medium">{text}</span>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <AntButton type="text" onClick={() => openEditModal(record)} className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 px-2">
            <EditOutlined />
          </AntButton>
          <Popconfirm title="Xóa thông số này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <AntButton type="text" danger className="hover:bg-red-50 px-2">
              <DeleteOutlined />
            </AntButton>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-700">Thông số kỹ thuật</h3>
        <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 flex items-center gap-1">
          <PlusOutlined /> Thêm thông số
        </Button>
      </div>

      <Table 
        dataSource={attributes} 
        columns={columns} 
        rowKey="id" 
        pagination={false} 
        loading={loading}
        bordered
        size="small"
      />

      <Modal
        title={editingAttr ? 'Sửa thông số' : 'Thêm thông số mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <AttributeForm 
          productId={productId} 
          initialData={editingAttr}
          onSuccess={() => { setIsModalOpen(false); fetchAttributes(); }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}