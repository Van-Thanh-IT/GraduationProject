
import React, { useState, useEffect } from 'react';
import { Button as AntButton, message, Collapse, Popconfirm, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import { ProductService } from '@/services/product.service';
import AddVariantForm from './AddVariantForm';
import EditVariantAndImageForm from './EditVariantAndImageForm';

export default function VariantList({ product }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const res = await ProductService.getVariantsByProduct(product.id);
      setVariants(res.data?.data || []);
    } catch (error) {
      message.error("Lỗi lấy danh sách biến thể!");
    } finally {
      setLoading(false);
    }
  };

  // 1. ĐÃ SỬA: Đổi productId thành product?.id
  useEffect(() => {
    if (product?.id) fetchVariants();
  }, [product?.id]);

  const handleDeleteVariant = async (e, variantId) => {
    e.stopPropagation(); // Ngăn sự kiện mở Collapse khi bấm xóa
    try {
      await ProductService.softDeleteVariant(variantId);
      message.success("Xóa biến thể thành công!");
      fetchVariants();
    } catch (error) {
      message.error("Xóa biến thể thất bại!");
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-4">
      {/* KHU VỰC NÚT THÊM */}
      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
        <span className="font-semibold text-slate-700">Tổng số: {variants.length} biến thể</span>
        <Button onClick={() => setIsAddMode(true)} disabled={isAddMode} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 flex items-center gap-2">
          <PlusOutlined /> Thêm biến thể mới
        </Button>
      </div>

      {/* FORM THÊM MỚI (Hiện khi bấm nút) */}
      {isAddMode && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-inner">
          <h4 className="font-bold text-blue-700 mb-3">Tạo biến thể mới</h4>
          {/* 2. ĐÃ SỬA: Truyền nguyên object product vào cho AddVariantForm */}
          <AddVariantForm 
             product={product}
             onSuccess={() => { setIsAddMode(false); fetchVariants(); }}
             onCancel={() => setIsAddMode(false)}
          />
        </div>
      )}

      {/* DANH SÁCH BIẾN THỂ */}
      <Spin spinning={loading}>
        {variants.length === 0 && !isAddMode && (
          <div className="text-center text-slate-400 py-8">Chưa có biến thể nào. Hãy thêm biến thể đầu tiên!</div>
        )}
        
        <Collapse accordion className="bg-white">
          {variants.map(variant => {
            const variantTitle = `${variant.option1Value || ''} ${variant.option2Value ? '- ' + variant.option2Value : ''}`.trim() || 'Biến thể mặc định';
            
            return (
              <Collapse.Panel 
                key={variant.id} 
                header={<span className="font-bold text-slate-700">{variantTitle} <span className="text-blue-500 font-normal ml-2">(Giá: {variant.price?.toLocaleString()}đ - Tồn: {variant.stockQuantity})</span></span>}
                extra={
                  <Popconfirm title="Xóa biến thể này?" onConfirm={(e) => handleDeleteVariant(e, variant.id)} okText="Xóa" cancelText="Hủy">
                    <AntButton type="text" danger icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} />
                  </Popconfirm>
                }
              >
                {/* TRUYỀN DỮ LIỆU VÀO FORM SỬA VÀ QUẢN LÝ ẢNH */}
                <EditVariantAndImageForm variant={variant} product={product} onRefresh={fetchVariants} />
              </Collapse.Panel>
            );
          })}
        </Collapse>
      </Spin>
    </div>
  );
}