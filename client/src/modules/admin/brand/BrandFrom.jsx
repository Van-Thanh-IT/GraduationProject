import React, { useState, useEffect} from 'react';
import { message, Tooltip } from 'antd';
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
  
  const [logoFile, setLogoFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);

  // Sync dữ liệu ban đầu
  useEffect(() => {
    if (initialData) {
      setFormData({ 
        name: initialData.name || '', 
        description: initialData.description || '' 
      });
      setPreviewLogo(initialData.logoUrl || initialData.imageUrl);
    }
  }, [initialData]);

  // Clean up URL tránh Memory Leak
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
  };

  const removeLogo = () => {
    setLogoFile(null);
    setPreviewLogo(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return message.error("Tên thương hiệu không được để trống!");

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('description', (formData.description || '').trim());
    
    // Nếu có file mới thì gửi file, nếu xóa trắng thì tùy backend xử lý (gửi rỗng hoặc null)
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
          message.error(err.response?.data?.message || "Thao tác thất bại!");
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-5 py-2">
      {/* Overlay Loading mờ khi đang submit để tránh user bấm linh tinh */}
      {isPending && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
          <div className="bg-white p-4 rounded-full shadow-lg">
             <LoadingOutlined className="text-blue-600 text-2xl animate-spin" />
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-5 transition-opacity duration-300 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        <Input 
          label={<span className="text-slate-700 font-bold">Tên thương hiệu <span className="text-red-500">*</span></span>}
          placeholder="VD: Apple, Samsung, Nike..." 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          className="hover:border-blue-400 focus:border-blue-500 transition-all rounded-lg"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-slate-700">Mô tả</label>
          <textarea 
            rows={3}
            placeholder="Nhập mô tả ngắn về thương hiệu..."
            className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none text-slate-600"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        {/* Upload Logo Zone */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Logo nhận diện</label>
          <div className="flex items-start gap-5 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            {/* Ảnh xem trước */}
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
        </div>
      </div>

      {/* Action Buttons */}
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
          className={`px-8 py-2 rounded-lg font-bold shadow-lg shadow-blue-200 transition-transform active:scale-95 ${
            isEdit ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isEdit ? 'Cập nhật ngay' : 'Tạo thương hiệu'}
        </Button>
      </div>
    </form>
  );
}