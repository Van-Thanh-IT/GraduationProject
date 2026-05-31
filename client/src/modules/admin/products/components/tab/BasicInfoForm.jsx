// File: src/modules/admin/products/components/tab/BasicInfoForm.jsx
import React, { useEffect, useRef } from 'react';
import { Select, Spin, Form } from 'antd';
import { TagOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ReactQuill from "react-quill";
import { ProductService } from '@/services/product.service';
import { useGetBrands } from "@/hooks/useBrands";
import { useGetCategories } from "@/hooks/useCategories";

import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';

const OPTION_SUGGESTIONS = [
  { value: "Mặc Định", label: "Mặc Định" },
  { value: "Màu sắc", label: "Màu sắc" },
  { value: "Lựa chọn phiên bản", label: "Phiên bản" },
  { value: "Dung lượng", label: "Dung lượng lưu trữ (ROM)" },
  { value: "Kết nối mạng", label: "Kết nối (Chỉ Wifi / Wifi + 5G)" },
  { value: "RAM", label: "Dung lượng RAM" }, 
  { value: "CPU", label: "Vi xử lý (CPU)" },
  { value: "Card đồ họa", label: "Card đồ họa (VGA)" }, 
  { value: "Kích thước mặt", label: "Kích thước mặt (40mm, 44mm, 49mm)" }, 
  { value: "Loại dây", label: "Chất liệu dây (Silicon, Thép, Da)" },
];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link', 'image', 'clean'],
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet', 'align', 'link', 'image'
];

const formatCategoryOptions = (categoriesArray, level = 0) => {
  let options = [];
  categoriesArray.forEach((cat) => {
    const prefix = level > 0 ? '— '.repeat(level) : '';
    options.push({
      value: cat.id,
      label: `${prefix}${cat.name}`,
      searchText: cat.name 
    });
    if (cat.children && cat.children.length > 0) {
      options = options.concat(formatCategoryOptions(cat.children, level + 1));
    }
  });
  return options;
};

export default function BasicInfoForm({ initialData, onSuccess, backendError }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  
  const { data: brands = [], isLoading: isBrandsLoading } = useGetBrands();
  const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategories();

  const select1Ref = useRef(null);
  const select2Ref = useRef(null);
  const select3Ref = useRef(null);

useEffect(() => {
  if (initialData) {
    form.setFieldsValue({
      name: initialData.name || '', 
      brandId: initialData.brandId || null,
      categoryId: initialData.categoryId || null, 
      warrantyPeriod: initialData.warrantyPeriod || '',
      
      description: initialData.description || '', 
      
      option1Name: initialData.option1Name ? [initialData.option1Name] : [],
      option2Name: initialData.option2Name ? [initialData.option2Name] : [], 
      option3Name: initialData.option3Name ? [initialData.option3Name] : []
    });
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
    
    const payload = {
      ...values,
      option1Name: values.option1Name?.[0] || "",
      option2Name: values.option2Name?.[0] || "",
      option3Name: values.option3Name?.[0] || "",
    };

    try {
      await ProductService.updateProduct(initialData.id, payload);
      toast.success("Cập nhật thông tin cơ bản thành công!");
      if(onSuccess) onSuccess();
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

  const handleOptionChange = (value, ref) => {
    if (value && value.length > 0 && ref?.current) {
      ref.current.blur();
    }
  };

  return (
    <div className="relative font-sans max-w-3xl mx-auto">
      <Spin spinning={loading} tip="Đang lưu thông tin...">
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleFinish}
          requiredMark={false}
          className="space-y-4"
        >
          <style dangerouslySetInnerHTML={{__html: `
            .ql-container.ql-snow { border-bottom-left-radius: 6px !important; border-bottom-right-radius: 6px !important; border-color: #e5e7eb !important; font-family: inherit !important; font-size: 13px !important; min-height: 200px; }
            .ql-toolbar.ql-snow { border-top-left-radius: 6px !important; border-top-right-radius: 6px !important; border-color: #e5e7eb !important; background-color: #f9fafb !important; }
            .ant-form-item-has-error .ql-toolbar.ql-snow, .ant-form-item-has-error .ql-container.ql-snow { border-color: #ff4d4f !important; }
          `}} />

          
          <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-200/80 space-y-3.5">
            <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wide m-0 pb-1.5 border-b border-gray-200/60">
              <TagOutlined className="text-blue-500" /> Thông tin cơ bản
            </h3>

            <Form.Item name="name" rules={[{ required: true, message: 'Tên sản phẩm không được để trống!' }]} className="m-0">
              <Input label="Tên sản phẩm gốc *" placeholder="VD: iPhone 15 Pro Max" className="h-9 text-xs rounded-md" />
            </Form.Item>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item name="brandId" label={<span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Thương hiệu *</span>} rules={[{ required: true, message: 'Chọn hãng!' }]} className="m-0">
                <Select 
                  loading={isBrandsLoading}
                  placeholder="Chọn thương hiệu"
                  showSearch
                  optionFilterProp="label"
                  className="w-full h-9 text-xs [&_.ant-select-selector]:!rounded-md" 
                  options={brands.map(b => ({ value: b.id, label: b.name }))}
                />
              </Form.Item>
              
              <Form.Item name="categoryId" label={<span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Danh mục *</span>} rules={[{ required: true, message: 'Chọn mục!' }]} className="m-0">
                <Select 
                  loading={isCategoriesLoading}
                  placeholder="Chọn danh mục"
                  showSearch
                  className="w-full h-9 text-xs [&_.ant-select-selector]:!rounded-md" 
                  options={formatCategoryOptions(categories)}
                  filterOption={(input, option) => (option?.searchText ?? '').toLowerCase().includes(input.toLowerCase())}
                />
              </Form.Item>
            </div>

            <Form.Item name="warrantyPeriod" rules={[{ required: true, message: 'Vui lòng nhập thời gian bảo hành!' }]} className="m-0">
              <Input label="Thời gian bảo hành *" placeholder="VD: 12 tháng chính hãng" className="h-9 text-xs rounded-md" />
            </Form.Item>
          </div>

        
          <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-200/80 space-y-3">
            <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wide m-0 pb-1.5 border-b border-gray-200/60">
              <SettingOutlined className="text-blue-500" /> Thuộc tính nhóm biến thể sản phẩm
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Form.Item name="option1Name" label={<span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Phân loại 1</span>} className="m-0">
                <Select ref={select1Ref} mode="tags" maxCount={1} allowClear placeholder="Màu sắc" options={OPTION_SUGGESTIONS} onChange={(val) => handleOptionChange(val, select1Ref)} className="w-full h-9 text-xs [&_.ant-select-selector]:!rounded-md" />
              </Form.Item>
              <Form.Item name="option2Name" label={<span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Phân loại 2</span>} className="m-0">
                <Select ref={select2Ref} mode="tags" maxCount={1} allowClear placeholder="Dung lượng" options={OPTION_SUGGESTIONS} onChange={(val) => handleOptionChange(val, select2Ref)} className="w-full h-9 text-xs [&_.ant-select-selector]:!rounded-md" />
              </Form.Item>
              <Form.Item name="option3Name" label={<span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Phân loại 3</span>} className="m-0">
                <Select ref={select3Ref} mode="tags" maxCount={1} allowClear placeholder="Phiên bản" options={OPTION_SUGGESTIONS} onChange={(val) => handleOptionChange(val, select3Ref)} className="w-full h-9 text-xs [&_.ant-select-selector]:!rounded-md" />
              </Form.Item>
            </div>
          </div>

          <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-200/80 space-y-2.5">
            <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wide m-0 pb-1 border-b border-gray-200/60">
              <FileTextOutlined className="text-blue-500" /> Bài viết mô tả sản phẩm
            </h3>
            <Form.Item 
              name="description" 
              trigger="onChange" 
              validateTrigger="onBlur" 
              className="m-0"
              // BỔ SUNG 2 DÒNG NÀY ĐỂ FIX TRIỆT ĐỂ LỖI KHÔNG HIỂN THỊ HTML KHI SỬA
              valuePropName="value"
              getValueProps={(val) => ({ value: val || '' })}
            >
              <ReactQuill
                theme="snow"
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder="Nhập thông tin mô tả chi tiết thông số, tính năng sản phẩm tại đây..."
              />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <Button 
              type="submit" 
              className="h-9 px-6 text-xs font-bold uppercase tracking-wide bg-blue-600 text-white hover:bg-blue-700 rounded-md border-none"
            >
              Lưu Thông Tin Cơ Bản
            </Button>
          </div>
        </Form>
      </Spin>
    </div>
  );
}