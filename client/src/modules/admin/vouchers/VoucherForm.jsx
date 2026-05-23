import React, { useState, useEffect } from 'react';
import { Spin, Select} from 'antd';
import { X, Save, Tag, Settings2, CalendarClock } from 'lucide-react';
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useSaveVoucher } from '@/hooks/useVouchers';
import { formatNumber, parseNumber } from '@/utils/format';
import { toast } from 'react-toastify';

export const VoucherForm = ({ isOpen, onClose, onSuccess, initialData }) => {
  const { mutate: saveVoucher, isPending } = useSaveVoucher();
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discountType: 'FIXED',
    discountValue: '',
    maxDiscountValue: '',
    minOrderValue: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
  });

  const [errors, setErrors] = useState({});
  const [minDateTime, setMinDateTime] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setMinDateTime(now.toISOString().slice(0, 16));

    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        discountType: initialData.discountType || 'FIXED',
        discountValue: initialData.discountValue ? parseNumber(initialData.discountValue) : '',
        maxDiscountValue: initialData.maxDiscountValue ? parseNumber(initialData.maxDiscountValue) : '',
        minOrderValue: initialData.minOrderValue ? parseNumber(initialData.minOrderValue) : '',
        startDate: initialData.startDate ? initialData.startDate.substring(0, 16) : '',
        endDate: initialData.endDate ? initialData.endDate.substring(0, 16) : '',
        usageLimit: initialData.usageLimit || '',
      });
    } else {
      setFormData({
        name: '', code: '', discountType: 'FIXED', discountValue: '',
        maxDiscountValue: '', minOrderValue: '', startDate: '', endDate: '', usageLimit: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleGenericChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'code') {
        value = value.toUpperCase().replace(/\s/g, '');
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseNumber(value) }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Khớp 100% logic với DTO Backend
  const validateForm = () => {
    const newErrors = {};
    const now = new Date();
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    // Validate Name
    if (!formData.name.trim()) {
        newErrors.name = "Tên chương trình không được để trống";
    } else if (formData.name.length > 150) {
        newErrors.name = "Tên không được vượt quá 150 ký tự";
    } else if (!/^[\p{L}0-9\s\-]+$/u.test(formData.name)) {
        newErrors.name = "Tên chỉ chứa chữ, số, khoảng trắng và dấu -";
    }

    // Validate Code
    if (formData.code) {
        if (formData.code.length > 50) newErrors.code = "Mã CODE không vượt quá 50 ký tự";
        else if (!/^[A-Z0-9-]*$/.test(formData.code)) newErrors.code = "Mã CODE chỉ chứa chữ cái in hoa và số";
    }

    // Validate Discount Value
    const dValue = Number(formData.discountValue);
    if (!formData.discountValue || dValue < 1) {
      newErrors.discountValue = "Mức giảm phải lớn hơn 0";
    } else if (formData.discountType === 'PERCENT' && dValue > 100) {
      newErrors.discountValue = "Mức giảm phần trăm không vượt quá 100%";
    }

    if(!formData.usageLimit){
        newErrors.usageLimit ="Giới hạn số lượng sử dụng không được để trống";
    }
    

    // Validate Dates
    if (!formData.startDate) {
        newErrors.startDate = "Ngày bắt đầu không được để trống";
    }
    if (!formData.endDate) {
        newErrors.endDate = "Ngày kết thúc không được để trống";
    } else if (formData.startDate && end <= start) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    } else if (!isEdit && end <= now) {
        newErrors.endDate = "Ngày kết thúc phải ở tương lai";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      discountValue: Number(formData.discountValue) || 0,
      maxDiscountValue: Number(formData.maxDiscountValue) || 0,
      minOrderValue: Number(formData.minOrderValue) || 0,
      usageLimit: Number(formData.usageLimit) || 0,
      startDate: formData.startDate.length === 16 ? `${formData.startDate}:00` : formData.startDate,
      endDate: formData.endDate.length === 16 ? `${formData.endDate}:00` : formData.endDate,
    };

    saveVoucher({ id: initialData?.id, data: payload }, {
      onSuccess: () => {
        toast.success(isEdit ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        onSuccess();
      },
      onError: (error) => {
        const errData = error.response?.data;
        if (errData?.errors) {
            setErrors(errData.errors);
        } else {
            toast.error(errData?.messages || errData?.message || "Thao tác thất bại!");
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[95vh] flex flex-col shadow-lg relative">
        
        {isPending && (
          <div className="absolute inset-0 z-20 bg-white/60 flex items-center justify-center rounded-xl">
            <Spin tip="Đang xử lý..." size="large" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Tag size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {isEdit ? 'Chỉnh sửa Voucher' : 'Tạo mã giảm giá'}
            </h2>
          </div>
          <button onClick={onClose} disabled={isPending} className="text-gray-400 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="voucher-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* THÔNG TIN CƠ BẢN */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-bold text-blue-600 flex items-center gap-2 mb-4 uppercase">
                <Settings2 size={18} /> Cấu hình mã giảm
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                   <Input 
                      label="Tên chương trình ưu đãi" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleGenericChange} 
                      placeholder="VD: Mừng Lễ Lớn - Giảm 50K"
                      disabled={isPending}
                      className={`h-10 rounded-md ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="col-span-1 md:col-span-2">
                   <Input 
                      label="Mã CODE (Bỏ trống hệ thống sẽ tự sinh)" 
                      name="code" 
                      value={formData.code} 
                      onChange={handleGenericChange} 
                      placeholder="VD: SUMMER2026"
                      disabled={isPending}
                      className={`h-10 rounded-md uppercase ${errors.code ? 'border-red-500' : ''}`}
                    />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                </div>
                
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Hình thức giảm</label>
                  <Select
                    value={formData.discountType}
                    onChange={(val) => setFormData({...formData, discountType: val, discountValue: '', maxDiscountValue: ''})}
                    disabled={isPending}
                    className="w-full h-10"
                    options={[
                      { value: 'FIXED', label: 'Giảm theo Số tiền (VND)' },
                      { value: 'PERCENT', label: 'Giảm theo Phần trăm (%)' },
                    ]}
                  />
                </div>
                
                <div>
                    <Input 
                      label={formData.discountType === 'PERCENT' ? 'Mức giảm (%)' : 'Mức giảm (VND)'} 
                      name="discountValue" 
                      type={formData.discountType === 'PERCENT' ? 'number' : 'text'} 
                      value={formData.discountType === 'PERCENT' ? formData.discountValue : formatNumber(formData.discountValue)} 
                      onChange={formData.discountType === 'PERCENT' ? handleGenericChange : handlePriceChange} 
                      placeholder="Nhập giá trị giảm"
                      disabled={isPending}
                      className={`h-10 rounded-md ${errors.discountValue ? 'border-red-500' : ''}`}
                    />
                    {errors.discountValue && <p className="text-red-500 text-xs mt-1">{errors.discountValue}</p>}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Input 
                    label="Giảm tối đa (VND)" 
                    name="maxDiscountValue" 
                    type="text" 
                    value={formatNumber(formData.maxDiscountValue)} 
                    onChange={handlePriceChange} 
                    placeholder={formData.discountType === 'FIXED' ? "Không áp dụng cho giảm tiền mặt" : "VD: Tối đa 50.000đ"}
                    disabled={formData.discountType === 'FIXED' || isPending} 
                    className={`h-10 rounded-md ${formData.discountType === 'FIXED' ? "bg-gray-100 text-gray-400" : ""}`}
                  />
                </div>
              </div>
            </div>

            {/* ĐIỀU KIỆN SỬ DỤNG */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-bold text-blue-600 flex items-center gap-2 mb-4 uppercase">
                <CalendarClock size={18} /> Điều kiện & Thời gian
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input 
                    label="Đơn hàng tối thiểu (VND)" 
                    name="minOrderValue" 
                    type="text" 
                    value={formatNumber(formData.minOrderValue)} 
                    onChange={handlePriceChange} 
                    disabled={isPending}
                    placeholder="VD: 200.000"
                    className="h-10 rounded-md"
                  />
                  
                </div>
                
                <div>
                  <Input 
                    label="Tổng số lượt sử dụng" 
                    name="usageLimit" 
                    type="number" 
                    value={formData.usageLimit} 
                    onChange={handleGenericChange} 
                    disabled={isPending}
                    placeholder="VD: 100"
                    className="h-10 rounded-md"
                  />
                  {errors.usageLimit && <p className="text-red-500 text-xs mt-1">{errors.usageLimit}</p>}
                </div>

                <div>
                    <Input 
                      label="Bắt đầu từ" 
                      name="startDate" 
                      type="datetime-local" 
                      value={formData.startDate} 
                      min={!isEdit ? minDateTime : undefined} 
                      onChange={handleGenericChange} 
                      disabled={isPending}
                      className={`h-10 rounded-md ${errors.startDate ? 'border-red-500' : ''}`}
                    />
                    {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>
                
                <div>
                    <Input 
                      label="Kết thúc lúc" 
                      name="endDate" 
                      type="datetime-local" 
                      value={formData.endDate} 
                      min={formData.startDate || (!isEdit ? minDateTime : undefined)} 
                      onChange={handleGenericChange} 
                      disabled={isPending}
                      className={`h-10 rounded-md ${errors.endDate ? 'border-red-500' : ''}`}
                    />
                    {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <Button 
            variant="outline"
            onClick={onClose} 
            disabled={isPending}
            className="px-6 py-2 rounded-md font-semibold text-gray-600 bg-white border-gray-300 hover:bg-gray-100"
          >
            Hủy bỏ
          </Button>
          <Button 
            type="submit"
            form="voucher-form"
            loading={isPending}
            disabled={isPending}
            className="px-6 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={18} />
            {isEdit ? 'Lưu thay đổi' : 'Phát hành Voucher'}
          </Button>
        </div>

      </div>
    </div>
  );
};