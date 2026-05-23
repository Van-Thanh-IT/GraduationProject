import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { PictureOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSaveBrand } from '@/hooks/useBrands';

export default function BrandForm({ initialData, onSuccess, onCancel }) {
  const isEdit = !!initialData;
  const { mutate: saveBrand, isPending } = useSaveBrand();

  const [formData, setFormData] = useState({ 
    name: '', 
    description: '' 
  });
  
  // State lưu lỗi từ Backend trả về
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
      return message.error("Ảnh quá lớn! Vui lòng chọn file dưới 2MB.");
    }

    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewLogo(objectUrl);
    
    // Xóa lỗi logo nếu có
    if (errors.logo) setErrors({ ...errors, logo: null });
  };

  const removeLogo = () => {
    setLogoFile(null);
    setPreviewLogo(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({}); // Xóa hết lỗi cũ trước khi submit
    
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
          message.success(`${isEdit ? 'Cập nhật' : 'Thêm'} thành công!`);
          onSuccess();
        },
        onError: (err) => {
          const resData = err.response?.data;
          
          if (resData?.errors) {
            setErrors(resData.errors);
          } else {
            message.error(resData?.messages || resData?.message || "Thao tác thất bại!");
          }
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-5 py-2">
      {isPending && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
          <div className="bg-white p-4 rounded-full shadow-lg">
             <LoadingOutlined className="text-blue-600 text-2xl animate-spin" />
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-5 transition-opacity duration-300 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* INPUT: TÊN THƯƠNG HIỆU */}
        <div className="flex flex-col gap-1">
          <Input 
            label={<span className="text-slate-700 font-bold">Tên thương hiệu <span className="text-red-500">*</span></span>}
            placeholder="VD: Apple, Samsung, Nike..." 
            value={formData.name} 
            onChange={e => {
              setFormData({...formData, name: e.target.value});
              if (errors.name) setErrors({...errors, name: null}); // Đang gõ thì xóa lỗi đi
            }} 
            className={`transition-all rounded-lg ${
              errors.name 
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                : 'hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
            }`}
          />
          {/* HIỆN CHỮ ĐỎ BÁO LỖI Ở ĐÂY */}
          {errors.name && <span className="text-[13px] text-red-500 font-semibold mt-0.5 ml-1">{errors.name}</span>}
        </div>

        {/* INPUT: MÔ TẢ */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-slate-700">Mô tả</label>
          <textarea 
            rows={3}
            placeholder="Nhập mô tả ngắn về thương hiệu..."
            className={`w-full px-4 py-2 border rounded-lg outline-none transition-all resize-none text-slate-600 ${
              errors.description 
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
            }`}
            value={formData.description}
            onChange={e => {
              setFormData({...formData, description: e.target.value});
              if (errors.description) setErrors({...errors, description: null});
            }}
          />
          {errors.description && <span className="text-[13px] text-red-500 font-semibold ml-1">{errors.description}</span>}
        </div>

        {/* UPLOAD LOGO */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Logo nhận diện</label>
          <div className={`flex items-start gap-5 p-4 bg-slate-50 border border-dashed rounded-xl ${errors.logo ? 'border-red-400' : 'border-slate-300'}`}>
            <div className="relative group w-24 h-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {previewLogo ? (
                <>
                  <img src={previewLogo} alt="preview" className="w-full h-full object-contain p-1" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={removeLogo} className="text-white hover:text-red-400">
                      <DeleteOutlined className="text-xl" />
                    </button>
                  </div>
                </>
              ) : (
                <PictureOutlined className="text-3xl text-slate-300" />
              )}
            </div>
            
            <div className="flex-1 flex flex-col gap-2 justify-center h-24">
              <label className="w-max px-4 py-1.5 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded-md cursor-pointer text-sm font-semibold transition-all shadow-sm flex items-center gap-2">
                <PictureOutlined />
                {previewLogo ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                Khuyên dùng: Ảnh vuông, nền trắng hoặc trong suốt.<br/>Định dạng JPG, PNG (Max 2MB).
              </p>
            </div>
          </div>
          {/* HIỆN LỖI LOGO NẾU CÓ */}
          {errors.logo && <span className="text-[13px] text-red-500 font-semibold ml-1">{errors.logo}</span>}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={isPending}
          className="px-6 py-2 text-slate-500 font-medium hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
        >
          Đóng
        </button>
        <Button 
          type="submit" 
          loading={isPending} 
          className={`px-8 py-2 rounded-lg font-bold shadow-lg transition-transform active:scale-95 ${
            isEdit ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
          } text-white`}
        >
          {isEdit ? 'Cập nhật ngay' : 'Tạo thương hiệu'}
        </Button>
      </div>
    </form>
  );
}