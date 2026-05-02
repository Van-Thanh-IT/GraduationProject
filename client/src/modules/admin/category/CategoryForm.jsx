import React, { useState, useEffect } from 'react';
import { message, Select, Spin, Tooltip} from 'antd';

import { 
  PictureOutlined, 
  LoadingOutlined, 
  DeleteOutlined, 
  InfoCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
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
      if (file.size > 2 * 1024 * 1024) return message.error("Ảnh tối đa 2MB!");
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file)); 
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return message.error("Vui lòng nhập tên danh mục!");

    const data = new FormData();
    data.append('name', formData.name.trim());
    if (formData.description) data.append('description', formData.description.trim());
    if (formData.parentId) data.append('parentId', formData.parentId);
    if (imageFile) data.append('image', imageFile);

    saveCategory({ id: initialData?.id, formData: data }, {
      onSuccess: () => {
        toast.success(`${isEdit ? 'Cập nhật' : 'Thêm'} thành công!`, {
          autoClose:1000
        });
        
     

        onSuccess();
      },
      onError: (err) => message.error(err.response?.data?.message || "Thao tác thất bại!")
    });
  };

  const parentOptions = categories
    .filter(cat => cat.id !== initialData?.id) 
    .map(cat => ({ value: cat.id, label: cat.name }));

  return (
    <Spin 
      spinning={isPending} 
      indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
      tip={<span className="text-blue-600 font-medium mt-2 block">Đang xử lý dữ liệu...</span>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4 px-2">
        
        {/* Section: Thông tin cơ bản */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <Input 
                placeholder="VD: Điện thoại, Phụ kiện..." 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full h-10 border-slate-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                Danh mục cha
                <Tooltip title="Chọn danh mục gốc nếu đây là danh mục chính">
                  <InfoCircleOutlined className="text-slate-400 text-xs" />
                </Tooltip>
              </label>
              <Select
                allowClear
                placeholder="Chọn cấp cha"
                options={parentOptions}
                value={formData.parentId}
                onChange={(val) => setFormData({...formData, parentId: val})}
                className="w-full h-10 custom-select-ui"
                dropdownStyle={{ borderRadius: '8px' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">Mô tả ngắn</label>
            <textarea 
              rows={2}
              placeholder="Nhập vài dòng giới thiệu về danh mục này..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none text-slate-600 italic text-sm"
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>
        </div>

        {/* Section: Media (Ảnh đại diện) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Hình ảnh đại diện</label>
          <div className="flex items-center gap-6 p-5 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-all group">
            
            {/* Image Preview Card */}
            <div className="relative w-24 h-24 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
              {previewImage ? (
                <>
                  <img src={previewImage} alt="preview" className="w-full h-full object-contain p-1.5" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={removeImage}
                      className="w-8 h-8 bg-white/20 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all flex items-center justify-center"
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </>
              ) : (
                <PictureOutlined className="text-3xl text-slate-300" />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 w-fit px-5 py-2 bg-white hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded-xl cursor-pointer text-sm font-bold transition-all shadow-sm active:scale-95">
                <PlusOutlined />
                {previewImage ? "Thay đổi ảnh" : "Tải ảnh lên"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Dung lượng tối đa 2MB. Khuyên dùng tỉ lệ 1:1 (JPG, PNG, WebP)
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-4 mt-4 pt-6 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isPending} 
            className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          
          <Button 
            type="submit" 
            loading={isPending} 
            className={`
              px-8 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95
              ${isEdit 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-200' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200'
              }
            `}
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo danh mục ngay'}
          </Button>
        </div>
      </form>
    </Spin>
  );
}