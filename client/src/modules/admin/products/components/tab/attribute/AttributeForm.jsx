import React, { useState, useEffect } from 'react';
import { message, Select, Spin } from 'antd';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ProductService } from '@/services/product.service';
import { AttributeService } from '@/services/attribute.service';
export default function AttributeForm({ productId, initialData, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  
  // State lưu danh sách thuộc tính lấy từ DB
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  const [formData, setFormData] = useState({
    attributeId: null,
    value: ''
  });

  // 1. GỌI API LẤY TẤT CẢ THUỘC TÍNH ĐỂ ĐỔ VÀO DROPDOWN
  const fetchAllAttributes = async () => {
    setLoadingAttributes(true);
    try {
      const res = await AttributeService.getAllAttributes();
      const data = res.data?.data || res.data || [];
      
      // Chuyển đổi dữ liệu thành dạng { value, label } cho thẻ Select của Ant Design
      const options = data.map(attr => ({
        value: attr.id,
        label: `${attr.name} (${attr.code})` // Hiển thị "RAM (RAM)" cho dễ nhìn
      }));
      setAttributeOptions(options);
    } catch (error) {
      message.error("Lỗi lấy danh sách thuộc tính từ hệ thống!");
    } finally {
      setLoadingAttributes(false);
    }
  };

  useEffect(() => {
    fetchAllAttributes();
  }, []);

  // 2. NẠP DỮ LIỆU NẾU ĐANG Ở CHẾ ĐỘ SỬA
  useEffect(() => {
    if (initialData) {
      setFormData({
        // Tương thích với cấu trúc Spring Boot trả về
        attributeId: initialData.attribute?.id || initialData.attributeId || null,
        value: initialData.value || ''
      });
    }
  }, [initialData]);

  // 3. XỬ LÝ LƯU THÔNG SỐ CỦA SẢN PHẨM
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.attributeId || !formData.value) {
      return message.error("Vui lòng chọn thông số và nhập giá trị!");
    }

    setLoading(true);
    try {
      if (initialData) {
        await ProductService.updateProductAttribute(initialData.id, formData);
        message.success("Sửa thông số thành công!");
      } else {
        await ProductService.addAttributeToProduct(productId, formData);
        message.success("Thêm thông số thành công!");
      }
      onSuccess();
    } catch (error) {
       console.log("Lỗi:", error.response?.data);
       const errorMessage = error.response?.data?.messages || error.response?.data?.message || "Thao tác thất bại!";
       message.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Tên thông số</label>
        
        {/* ĐỔ DỮ LIỆU OPTIONS VÀO ĐÂY */}
        <Spin spinning={loadingAttributes} size="small">
          <Select
            showSearch // Cho phép gõ để tìm kiếm thuộc tính cho nhanh
            optionFilterProp="label" // Tìm kiếm dựa trên chữ hiển thị
            value={formData.attributeId}
            onChange={(val) => setFormData({...formData, attributeId: val})}
            placeholder="Chọn thông số (VD: Màn hình, Pin...)"
            options={attributeOptions}
            className="w-full h-[40px]"
            disabled={!!initialData} // Sửa thì không cho đổi tên thông số, chỉ cho đổi giá trị
            notFoundContent={loadingAttributes ? "Đang tải..." : "Không tìm thấy thuộc tính nào"}
          />
        </Spin>
      </div>

      <Input 
        label="Giá trị (Value)" 
        placeholder="VD: 6.7 inch, 5000 mAh..."
        required 
        value={formData.value} 
        onChange={e => setFormData({...formData, value: e.target.value})} 
      />

      <div className="flex justify-end gap-3 mt-4">
        <Button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-6">Hủy</Button>
        <Button type="submit" loading={loading} className="bg-blue-600 text-white px-6">
          {initialData ? 'Lưu thay đổi' : 'Thêm thông số'}
        </Button>
      </div>
    </form>
  );
}