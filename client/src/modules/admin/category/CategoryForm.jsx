// File: src/modules/admin/categories/components/CategoryForm.jsx
import React, { useState, useEffect } from 'react';
import { Select, Spin, Tooltip } from 'antd';
import { PictureOutlined, LoadingOutlined, DeleteOutlined, InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSaveCategory } from '@/hooks/useCategories';
import { toast } from 'react-toastify';

export default function CategoryForm({ initialData, categories, onSuccess, onCancel }) {
  const isEdit = !!initialData;
  const { mutate: saveCategory, isPending } = useSaveCategory();

  const [formData, setFormData] = useState({ name: '', description: '', parentId: null });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        parentId: initialData.parentId || null,
      });
      setPreviewImage(initialData.imageUrl);
    }
  }, [initialData]);

  useEffect(() => {
    return () => { if (previewImage?.startsWith('blob:')) URL.revokeObjectURL(previewImage); };
  }, [previewImage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error("Kích thước file ảnh tối đa 2MB!");
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file)); 
      if (errors.image) setErrors({ ...errors, image: null });
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: "Tên danh mục không được để trống!" });
      return;
    }

    const data = new FormData();
    data.append('name', formData.name.trim());
    if (formData.description) data.append('description', formData.description.trim());
    if (formData.parentId) data.append('parentId', formData.parentId);
    if (imageFile) data.append('image', imageFile);

    saveCategory({ id: initialData?.id, formData: data }, {
      onSuccess: () => {
        toast.success(`${isEdit ? 'Cập nhật' : 'Khởi tạo'} danh mục thành công!`, { autoClose: 1000 });
        onSuccess();
      },
      onError: (err) => {
        const resData = err.response?.data;
        if (resData?.errors) {
          setErrors(resData.errors);
        } else {
          toast.error(resData?.messages || resData?.message || "Thao tác xử lý thất bại!");
        }
      }
    });
  };

  const parentOptions = categories
    .filter(cat => cat.id !== initialData?.id) 
    .map(cat => ({ value: cat.id, label: cat.name }));

  return (
    <Spin 
      spinning={isPending} 
      indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />}
      tip={<span className="text-xs text-blue-600 font-medium mt-1 block">Đang đồng bộ dữ liệu...</span>}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 font-sans mt-2">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-0.5">
            <Input 
              label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Tên danh mục *</span>}
              placeholder="VD: Điện thoại, Máy tính bảng..." 
              value={formData.name} 
              onChange={e => {
                setFormData({...formData, name: e.target.value});
                if (errors.name) setErrors({...errors, name: null});
              }} 
              className={`h-9 text-xs rounded-md transition-colors ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
            />
            {errors.name && <span className="text-[11px] text-red-500 font-bold mt-1 ml-0.5">{errors.name}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
              Danh mục cha
              <Tooltip title="Để trống nếu đây là danh mục gốc cấp cao nhất">
                <InfoCircleOutlined className="text-gray-400 text-[11px]" />
              </Tooltip>
            </label>
            <Select
              allowClear
              placeholder="Chọn cấp cha..."
              options={parentOptions}
              value={formData.parentId}
              onChange={(val) => {
                setFormData({...formData, parentId: val});
                if (errors.parentId) setErrors({...errors, parentId: null});
              }}
              className="w-full h-9 text-xs [&_.ant-select-selector]:!rounded-md"
              status={errors.parentId ? 'error' : ''}
            />
            {errors.parentId && <span className="text-[11px] text-red-500 font-bold mt-1 ml-0.5">{errors.parentId}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Mô tả tóm tắt</label>
          <textarea 
            rows={2}
            placeholder="Nhập giới thiệu ngắn gọn về danh mục mặt hàng này..."
            className={`w-full px-3 py-1.5 border rounded-md outline-none text-xs resize-none text-gray-600 transition-colors ${
              errors.description ? 'border-red-500' : 'border-gray-200 focus:border-gray-400'
            }`}
            value={formData.description} 
            onChange={e => {
              setFormData({...formData, description: e.target.value});
              if (errors.description) setErrors({...errors, description: null});
            }} 
          />
          {errors.description && <span className="text-[11px] text-red-500 font-bold ml-0.5">{errors.description}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Hình ảnh minh họa</label>
          <div className={`flex items-center gap-4 p-3.5 bg-gray-50/60 border border-dashed rounded-lg ${errors.image ? 'border-red-300 bg-red-50/10' : 'border-gray-200'}`}>
            
            <div className="relative group w-16 h-16 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {previewImage ? (
                <>
                  <img src={previewImage} alt="preview" className="max-w-full max-h-full object-contain p-1" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={removeImage}
                      className="w-7 h-7 bg-white/20 hover:bg-red-500 text-white rounded-full border-none cursor-pointer backdrop-blur-sm transition-all flex items-center justify-center"
                    >
                      <DeleteOutlined className="text-sm" />
                    </button>
                  </div>
                </>
              ) : (
                <PictureOutlined className="text-xl text-gray-300" />
              )}
            </div>

            <div className="flex flex-col gap-1 justify-center">
              <label className="w-max h-7 px-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-sm">
                <PlusOutlined className="text-gray-400" />
                {previewImage ? "Thay đổi hình ảnh" : "Tải hình ảnh lên"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <span className="text-[10px] text-gray-400 font-medium leading-none">
                Định dạng JPG, PNG, WebP (Tối đa 2MB). Khuyên dùng tỷ lệ vuông 1:1.
              </span>
            </div>
          </div>
          {errors.image && <span className="text-[11px] text-red-500 font-bold ml-0.5">{errors.image}</span>}
        </div>

        <div className="flex justify-end items-center gap-2 mt-5 pt-3 border-t border-gray-100">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isPending} 
            className="h-9 px-5 rounded-md font-bold text-xs uppercase tracking-wide text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors border-none cursor-pointer"
          >
            Hủy bỏ
          </button>
          
          <Button 
            type="submit" 
            loading={isPending} 
            className={`h-9 px-6 rounded-md font-bold text-xs uppercase tracking-wide border-none text-white ${
              isEdit ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo danh mục'}
          </Button>
        </div>
      </form>
    </Spin>
  );
}