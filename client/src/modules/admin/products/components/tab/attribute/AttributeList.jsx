// File: src/modules/admin/products/components/tab/attribute/AttributeList.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button as AntButton, Popconfirm, message, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import { ProductService } from '@/services/product.service';
import AttributeForm from './AttributeForm';
import { toast } from 'react-toastify';

export default function AttributeList({ productId }) {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState(null);
  const [backendError, setBackendError] = useState(null); // STATE QUẢN LÝ LỖI VALIDATION TỪ BACKEND

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const res = await ProductService.getAttributesByProductId(productId);
      setAttributes(res.data?.data || []);
    } catch (error) {
      toast.error("Lỗi lấy danh sách thông số kỹ thuật!");
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
      toast.success("Xóa thông số thành công!");
      fetchAttributes();
    } catch (error) {
      console.error(error);
      toast.error("Xóa thông số thất bại!");
    }
  };

  const openAddModal = () => {
    setEditingAttr(null);
    setBackendError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingAttr(record);
    setBackendError(null);
    setIsModalOpen(true);
  };

  const columns = [
    { 
      title: 'Tên thông số', 
      dataIndex: ['attribute', 'name'], 
      key: 'attributeName',
      render: (text, record) => <span className="font-semibold text-gray-700 text-xs">{text || record.attributeName || `Thông số ID: ${record.attribute?.id || record.attributeId}`}</span>
    },
    { 
      title: 'Giá trị thực tế', 
      dataIndex: 'value', 
      key: 'value',
      render: (text) => <span className="text-blue-600 font-medium text-xs">{text}</span>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center gap-1">
          <AntButton type="text" onClick={() => openEditModal(record)} className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 w-7 h-7 flex items-center justify-center p-0 rounded-md">
            <EditOutlined className="text-sm" />
          </AntButton>
          <Popconfirm title="Xóa thông số này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" centered>
            <AntButton type="text" danger className="hover:bg-red-50 w-7 h-7 flex items-center justify-center p-0 rounded-md">
              <DeleteOutlined className="text-sm" />
            </AntButton>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="font-sans">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide m-0">Thông số kỹ thuật sản phẩm</h3>
        <Button type="button" onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 rounded-md flex items-center gap-1 border-none">
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
        className="[&_.ant-table-thead_th]:!text-[11px] [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!text-gray-500 [&_.ant-table-thead_th]:!bg-gray-50/70"
      />

      <Modal
        title={
          <div className="text-sm font-bold text-gray-800 uppercase tracking-wide pb-2 border-b border-gray-100">
            {editingAttr ? 'Cập nhật thông số' : 'Thêm thông số mới'}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={440}
        centered
      >
        {/* TRUYỀN BACKENDERROR VÀ CÁC THAY ĐỔI CỦA API CATCH LỖI XUỐNG ĐÂY */}
        <AttributeForm 
          productId={productId} 
          initialData={editingAttr}
          backendError={backendError}
          onSuccess={() => { setIsModalOpen(false); fetchAttributes(); }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}