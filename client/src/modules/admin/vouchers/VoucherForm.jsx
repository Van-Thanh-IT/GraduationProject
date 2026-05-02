import React, { useState, useEffect } from 'react';
import { Spin, Select, message } from 'antd';
import { X, Save, Tag, AlertCircle, CalendarClock, Settings2 } from 'lucide-react';
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useSaveVoucher } from '@/hooks/useVouchers';
import { formatNumber, parseNumber } from '@/utils/format';

export const VoucherForm = ({ isOpen, onClose, onSuccess, initialData }) => {
  // 1. React Query
  const { mutate: saveVoucher, isPending } = useSaveVoucher();
  const isEdit = !!initialData;

  // 2. State
  const [formData, setFormData] = useState({
    name: '',
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

  // 3. Khởi tạo
  useEffect(() => {
    if (!isOpen) return;

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setMinDateTime(now.toISOString().slice(0, 16));

    if (initialData) {
      setFormData({
        name: initialData.name || '',
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
        name: '', discountType: 'FIXED', discountValue: '',
        maxDiscountValue: '', minOrderValue: '', startDate: '', endDate: '', usageLimit: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // 4. Handlers
  const handleGenericChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseNumber(value) }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // 5. Validation
  const validateForm = () => {
    const newErrors = {};
    const now = new Date();
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (!formData.name.trim()) newErrors.name = "Tên chương trình không được để trống";
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      newErrors.discountValue = "Mức giảm phải lớn hơn 0";
    }
    if (formData.discountType === 'PERCENT' && Number(formData.discountValue) > 100) {
      newErrors.discountValue = "Mức giảm phần trăm không được vượt quá 100%";
    }

    if (!formData.startDate) {
        newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    } else if (!isEdit && start < now) {
        newErrors.startDate = "Ngày bắt đầu không được nằm trong quá khứ";
    }

    if (!formData.endDate) {
        newErrors.endDate = "Vui lòng chọn ngày kết thúc";
    } else if (formData.startDate && end <= start) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 6. Submit
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
        message.success(isEdit ? 'Cập nhật Voucher thành công!' : 'Đã tạo Voucher mới!');
        onSuccess();
      },
      onError: (error) => {
        const errData = error.response?.data;
        if (errData?.errors && Array.isArray(errData.errors)) {
          errData.errors.forEach(err => message.error(`Lỗi: ${err.defaultMessage || err.message}`));
          return;
        }
        message.error(errData?.messages || errData?.error || errData?.message || "Lỗi lưu dữ liệu!");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
        {/* Loading Overlay */}
        {isPending && (
          <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[2px] flex items-center justify-center rounded-3xl">
            <Spin tip="Đang lưu Voucher..." size="large" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-indigo-100 bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
              <Tag size={22} fill="currentColor" className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isEdit ? 'Chỉnh Sửa Voucher' : 'Tạo Mã Giảm Giá'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Thiết lập các chương trình khuyến mãi cho khách hàng</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isPending} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Form Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <form id="voucher-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* THÔNG TIN CƠ BẢN */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <h3 className="text-sm font-black text-indigo-600 flex items-center gap-2 uppercase tracking-wider">
                <Settings2 size={18} /> Cấu hình mã giảm
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                   <Input 
                      label="Tên chương trình ưu đãi" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleGenericChange} 
                      placeholder="VD: Mừng Lễ Lớn - Giảm 50K"
                      disabled={isPending}
                      className={`h-11 rounded-xl ${errors.name ? 'border-red-500 focus:ring-red-100' : 'focus:ring-indigo-100'}`}
                    />
                    {errors.name && <p className="text-red-500 text-[11px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.name}</p>}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Hình thức giảm</label>
                  <Select
                    value={formData.discountType}
                    onChange={(val) => setFormData({...formData, discountType: val, discountValue: '', maxDiscountValue: ''})}
                    disabled={isPending}
                    className="h-11 custom-select-ui"
                    options={[
                      { value: 'FIXED', label: 'Giảm theo Số tiền (VND)' },
                      { value: 'PERCENT', label: 'Giảm theo Phần trăm (%)' },
                    ]}
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Input 
                      label={formData.discountType === 'PERCENT' ? 'Mức giảm (%)' : 'Mức giảm (VND)'} 
                      name="discountValue" 
                      type={formData.discountType === 'PERCENT' ? 'number' : 'text'} 
                      value={formData.discountType === 'PERCENT' ? formData.discountValue : formatNumber(formData.discountValue)} 
                      onChange={formData.discountType === 'PERCENT' ? handleGenericChange : handlePriceChange} 
                      placeholder="Nhập giá trị giảm"
                      disabled={isPending}
                      className="h-11 rounded-xl"
                    />
                    {errors.discountValue && <p className="text-red-500 text-[11px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.discountValue}</p>}
                </div>

                <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                  <Input 
                    label="Giảm tối đa (VND) - Bỏ trống nếu không giới hạn" 
                    name="maxDiscountValue" 
                    type="text" 
                    value={formatNumber(formData.maxDiscountValue)} 
                    onChange={handlePriceChange} 
                    placeholder={formData.discountType === 'FIXED' ? "Không áp dụng cho giảm tiền mặt" : "VD: Tối đa 50.000đ"}
                    disabled={formData.discountType === 'FIXED' || isPending} 
                    className={`h-11 rounded-xl ${formData.discountType === 'FIXED' ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""}`}
                  />
                </div>
              </div>
            </div>

            {/* ĐIỀU KIỆN SỬ DỤNG */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <h3 className="text-sm font-black text-indigo-600 flex items-center gap-2 uppercase tracking-wider">
                <CalendarClock size={18} /> Điều kiện & Thời gian
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <Input 
                    label="Đơn hàng tối thiểu (VND)" 
                    name="minOrderValue" 
                    type="text" 
                    value={formatNumber(formData.minOrderValue)} 
                    onChange={handlePriceChange} 
                    disabled={isPending}
                    placeholder="VD: 200.000"
                    className="h-11 rounded-xl"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <Input 
                    label="Tổng số lượt sử dụng" 
                    name="usageLimit" 
                    type="number" 
                    value={formData.usageLimit} 
                    onChange={handleGenericChange} 
                    disabled={isPending}
                    placeholder="VD: 100 (Để trống = Vô hạn)"
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Input 
                      label="Bắt đầu từ" 
                      name="startDate" 
                      type="datetime-local" 
                      value={formData.startDate} 
                      min={!isEdit ? minDateTime : undefined} 
                      onChange={handleGenericChange} 
                      disabled={isPending}
                      className="h-11 rounded-xl"
                    />
                    {errors.startDate && <p className="text-red-500 text-[11px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.startDate}</p>}
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Input 
                      label="Kết thúc lúc" 
                      name="endDate" 
                      type="datetime-local" 
                      value={formData.endDate} 
                      min={formData.startDate || (!isEdit ? minDateTime : undefined)} 
                      onChange={handleGenericChange} 
                      disabled={isPending}
                      className="h-11 rounded-xl"
                    />
                    {errors.endDate && <p className="text-red-500 text-[11px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.endDate}</p>}
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 relative z-30">
          <Button 
            variant="outline"
            onClick={onClose} 
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 border-transparent transition-all"
          >
            Hủy bỏ
          </Button>
          <Button 
            type="submit"
            form="voucher-form"
            loading={isPending}
            disabled={isPending}
            className="px-8 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            <Save size={18} />
            {isEdit ? 'Lưu thay đổi' : 'Phát hành Voucher'}
          </Button>
        </div>

      </div>
    </div>
  );
};