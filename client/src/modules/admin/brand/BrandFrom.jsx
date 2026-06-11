// File: src/modules/admin/brands/components/BrandForm.jsx
import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { PictureOutlined, DeleteOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSaveBrand } from '@/hooks/useBrands';
import { toast, ToastContainer } from 'react-toastify';
import { ToastBar, Toaster } from 'react-hot-toast';

export default function BrandForm({ initialData, onSuccess, onCancel }) {
  const isEdit = !!initialData;
  const { mutate: saveBrand, isPending } = useSaveBrand();

  const [formData, setFormData] = useState({ 
    name: '', 
    description: '' 
  });
  
  const [errors, setErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        name: initialData.name || '', 
        description: initialData.description || '' 
      });
      setPreviewLogo(initialData.logoUrl || initialData.imageUrl);
    }
  }, [initialData]);

  useEffect(() => {
    return () => { 
      if (previewLogo?.startsWith('blob:')) URL.revokeObjectURL(previewLogo);
    };
  }, [previewLogo]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Kích thước file ảnh vượt quá giới hạn 2MB!");
    }

    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewLogo(objectUrl);
    if (errors.logo) setErrors({ ...errors, logo: null });
  };

  const removeLogo = () => {
    setLogoFile(null);
    setPreviewLogo(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!formData.name.trim()) {
      setErrors({ name: "Tên thương hiệu không được để trống!" });
      return;
    }

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('description', (formData.description || '').trim());
    
    if (logoFile) {
      data.append('logo', logoFile);
    }

    saveBrand(
      { id: initialData?.id, formData: data }, 
      {
        onSuccess: () => {
          toast.success(`${isEdit ? 'Cập nhật' : 'Khởi tạo'} thương hiệu thành công!`);
          onSuccess();
        },
        onError: (err) => {
          const resData = err.response?.data;
          if (resData?.errors) {
            setErrors(resData.errors);
          } else {
            toast.error(resData?.messages || resData?.message || "Thao tác xử lý dữ liệu thất bại!");
          }
        }
      }
    );
  };

  return (
    <div className="relative font-sans">
      <Spin spinning={isPending} tip="Đang đồng bộ dữ liệu...">
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          
          <div className="flex flex-col gap-0.5">
            <Input 
              label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Tên thương hiệu *</span>}
              placeholder="VD: Apple, Samsung, Xiaomi..." 
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
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Mô tả chi tiết</label>
            <textarea 
              rows={3}
              placeholder="Nhập mô tả tóm tắt về nhãn hàng..."
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
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Logo nhãn diện nhãn hàng</label>
            <div className={`flex items-center gap-4 p-3.5 bg-gray-50/60 border border-dashed rounded-lg ${errors.logo ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="relative group w-16 h-16 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden shrink-0">
                {previewLogo ? (
                  <>
                    <img src={previewLogo} alt="preview" className="max-w-full max-h-full object-contain p-1" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={removeLogo} className="text-white hover:text-red-400 border-none bg-transparent cursor-pointer flex items-center justify-center">
                        <DeleteOutlined className="text-base" />
                      </button>
                    </div>
                  </>
                ) : (
                  <PictureOutlined className="text-xl text-gray-300" />
                )}
              </div>
              
              <div className="flex flex-col gap-1 justify-center">
                <label className="w-max h-7 px-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded text-xs font-bold cursor-pointer transition-colors flex items-center gap-1">
                  <PictureOutlined className="text-gray-400" />
                  {previewLogo ? 'Thay đổi logo' : 'Tải logo lên'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
                <p className="text-[10px] text-gray-400 leading-normal m-0 italic font-medium">
                  Khuyên dùng ảnh nền trắng hoặc trong suốt. Định dạng JPG, PNG (Tối đa 2MB).
                </p>
              </div>
            </div>
            {errors.logo && <span className="text-[11px] text-red-500 font-bold ml-0.5">{errors.logo}</span>}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-5">
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
              {isEdit ? 'Lưu thay đổi' : 'Tạo thương hiệu'}
            </Button>
          </div>
        </form>
      </Spin>
    </div>
  );
}