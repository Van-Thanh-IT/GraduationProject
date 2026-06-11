// File: src/modules/admin/products/components/tab/attribute/AttributeForm.jsx
import React, { useState, useEffect } from 'react';
import {Select, Spin, Form } from 'antd';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ProductService } from '@/services/product.service';
import { AttributeService } from '@/services/attribute.service';
import { toast } from 'react-toastify';

export default function AttributeForm({ productId, initialData, onSuccess, onCancel, backendError }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  const fetchAllAttributes = async () => {
    setLoadingAttributes(true);
    try {
      const res = await AttributeService.getAllAttributes();
      const data = res.data?.data || res.data || [];
      const options = data.map(attr => ({
        value: attr.id,
        label: `${attr.name} (${attr.code})`
      }));
      setAttributeOptions(options);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi lấy danh sách thông số từ hệ thống!");
    } finally {
      setLoadingAttributes(false);
    }
  };

  useEffect(() => {
    fetchAllAttributes();
  }, []);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        attributeId: initialData.attribute?.id || initialData.attributeId || null,
        value: initialData.value || ''
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  useEffect(() => {
    if (backendError) {
      if (backendError.messages && backendError.messages !== "Validation failed") {
        toast.error(backendError.messages);
      }
      if (backendError.errors) {
        const formFieldsError = Object.keys(backendError.errors).map((key) => ({
          name: key,
          errors: [backendError.errors[key]],
        }));
        form.setFields(formFieldsError);
      }
    }
  }, [backendError, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      if (initialData) {
        await ProductService.updateProductAttribute(initialData.id, values);
        toast.success("Sửa thông số thành công!");
      } else {
        await ProductService.addAttributeToProduct(productId, values);
        toast.success("Thêm thông số thành công!");
      }
      onSuccess();
    } catch (error) {
      const errData = error.response?.data;
      if (errData?.messages && errData.messages !== "Validation failed") {
        toast.error(errData.messages);
      }
      if (errData?.errors) {
        const formFieldsError = Object.keys(errData.errors).map((key) => ({
          name: key,
          errors: [errData.errors[key]],
        }));
        form.setFields(formFieldsError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative font-sans">
      <Spin spinning={loading} tip="Đang lưu thông số...">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          className="space-y-3.5 mt-2"
        >
          <Form.Item 
            name="attributeId" 
            label={<span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Tên thông số *</span>}
            rules={[{ required: true, message: 'Vui lòng chọn thông số!' }]}
            className="m-0"
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Chọn thông số (VD: Màn hình, Pin...)"
              options={attributeOptions}
              disabled={!!initialData}
              loading={loadingAttributes}
              className="w-full h-9 text-xs [&_.ant-select-selector]:!rounded-md"
              notFoundContent={loadingAttributes ? <Spin size="small" className="p-2 w-full flex justify-center" /> : "Không tìm thấy thông số nào"}
            />
          </Form.Item>

          <Form.Item 
            name="value" 
            rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}
            className="m-0"
          >
            <Input 
              label="Giá trị thực tế *" 
              placeholder="VD: 6.7 inch, 5000 mAh..." 
              className="h-9 text-xs rounded-md"
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={loading}
              className="h-9 px-5 text-xs font-bold uppercase tracking-wide"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              loading={loading} 
              className="h-9 px-6 text-xs font-bold uppercase tracking-wide bg-blue-600 text-white hover:bg-blue-700 rounded-md"
            >
              {initialData ? 'Lưu thay đổi' : 'Thêm thông số'}
            </Button>
          </div>
        </Form>
      </Spin>
    </div>
  );
}