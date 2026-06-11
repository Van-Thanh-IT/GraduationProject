import React, { useState, useEffect } from 'react';
import { Select, Spin, Tooltip } from 'antd';
import { LoadingOutlined, InfoCircleOutlined, TagOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSaveAttribute } from '@/hooks/useAttributes';
import { toast } from 'react-toastify';

const FILTER_GROUPS = [
  { value: 'DISPLAY', label: 'Màn hình & Hiển thị' },
  { value: 'PERFORMANCE', label: 'Cấu hình & Hiệu năng' },
  { value: 'CAMERA', label: 'Camera & Quay phim' },
  { value: 'BATTERY', label: 'Pin & Sạc' },
  { value: 'CONNECTIVITY', label: 'Kết nối & Mạng' },
  { value: 'GENERAL', label: 'Thông tin chung' },
];

export default function AttributeForm({ initialData, onSuccess, onCancel }) {
  const isEdit = !!initialData;
  const { mutate: saveAttribute, isPending } = useSaveAttribute();

  const [formData, setFormData] = useState({
    name: '',
    filterGroup: 'GENERAL',
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        filterGroup: initialData.filterGroup || 'GENERAL',
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: "Tên thông số không được để trống!" });
      return;
    }

    saveAttribute({ id: initialData?.id, formData }, {
      onSuccess: () => {
        toast.success(`${isEdit ? 'Cập nhật' : 'Thêm'} thành công!`);
        onSuccess();
      },
      onError: (err) => {
        const resData = err.response?.data;
        if (resData?.errors) {
          setErrors(resData.errors);
        } else {
          toast.error(resData?.messages || resData?.message || "Thao tác thất bại!");
        }
      }
    });
  };

  return (
    <Spin spinning={isPending} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4 px-2">
        
        <div className={`space-y-5 transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
              Tên thuộc tính hiển thị <span className="text-red-500">*</span>
              <Tooltip title="Tên sẽ hiển thị ở phần thông số kỹ thuật sản phẩm">
                <InfoCircleOutlined className="text-slate-400 text-xs" />
              </Tooltip>
            </label>
            <Input 
              placeholder="VD: Dung lượng RAM, Chip xử lý..." 
              value={formData.name} 
              onChange={e => {
                setFormData({...formData, name: e.target.value});
                if (errors.name) setErrors({...errors, name: null});
              }} 
              className={`h-11 rounded-xl transition-all ${
                errors.name 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                  : 'border-slate-200 focus:ring-2 focus:ring-blue-100'
              }`}
            />
            {errors.name && <span className="text-[13px] text-red-500 font-semibold mt-0.5 ml-1">{errors.name}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">Nhóm bộ lọc (Filter Group)</label>
            <Select
              value={formData.filterGroup}
              onChange={(val) => {
                setFormData({...formData, filterGroup: val});
                if (errors.filterGroup) setErrors({...errors, filterGroup: null});
              }}
              options={FILTER_GROUPS}
              className="h-11 w-full"
              dropdownStyle={{ borderRadius: '12px' }}
              suffixIcon={<TagOutlined className="text-slate-400" />}
              status={errors.filterGroup ? 'error' : ''}
            />
            <p className="text-[11px] text-slate-400 italic">Dùng để nhóm các thuộc tính lại khi hiển thị trên Website.</p>
            {errors.filterGroup && <span className="text-[13px] text-red-500 font-semibold mt-0.5 ml-1">{errors.filterGroup}</span>}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-slate-100">
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
            className={`px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-white ${
              isEdit ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {isEdit ? 'Cập nhật ngay' : 'Thêm thuộc tính'}
          </Button>
        </div>
      </form>
    </Spin>
  );
}