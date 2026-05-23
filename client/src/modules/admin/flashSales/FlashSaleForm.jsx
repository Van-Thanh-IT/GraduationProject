// File: src/modules/admin/flash-sale/components/FlashSaleForm.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Select, Spin, message } from 'antd';
import { X, Save, Zap, AlertCircle } from 'lucide-react';
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useSaveFlashSale } from '@/hooks/useFlashSales';
import { useSearchSimpleVariants } from '@/hooks/useProducts';
import { formatNumber, parseNumber } from '@/utils/format';

export const FlashSaleForm = ({ isOpen, onClose, onSuccess, initialData }) => {
  const { mutate: saveSale, isPending } = useSaveFlashSale();

  const [formData, setFormData] = useState({
    productVariantId: '',
    flashSalePrice: '',
    startTime: '',
    endTime: '',
    saleStockQuantity: '',
    maxQuantityPerUser: 1,
  });

  const [errors, setErrors] = useState({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [minDateTime, setMinDateTime] = useState('');
  
  const searchTimeout = useRef(null);
  const isEdit = !!initialData;

  const { data: variantOptions = [], isFetching: fetching, refetch } = useSearchSimpleVariants(searchKeyword, 20);

  useEffect(() => {
    if (!isOpen) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setMinDateTime(now.toISOString().slice(0, 16));

    if (initialData) {
      setFormData({
        productVariantId: initialData.variantId,
        flashSalePrice: initialData.flashSalePrice ? parseNumber(initialData.flashSalePrice) : '',
        saleStockQuantity: initialData.saleStockQuantity,
        maxQuantityPerUser: 1,
        startTime: initialData.startTime?.substring(0, 16) || '',
        endTime: initialData.endTime?.substring(0, 16) || '',
      });
      setSearchKeyword('');
    } else {
      setFormData({ productVariantId: '', flashSalePrice: '', startTime: '', endTime: '', saleStockQuantity: '', maxQuantityPerUser: 1 });
      setSearchKeyword('');
      setTimeout(() => refetch(), 0);
    }
    setErrors({});
  }, [initialData, isOpen, refetch]);

  const handleSearchVariant = (value) => {
    setSearchKeyword(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      refetch();
    }, 500);
  };

  const selectedVariant = variantOptions.find(v => v.id === Number(formData.productVariantId)) || (isEdit ? {
    price: initialData?.originalPrice,
    sku: initialData?.sku,
    productName: initialData?.productName,
    options: initialData?.variantOptions
  } : null);

  const originalPrice = selectedVariant?.price || 0;

  const currentDiscountPercent = (originalPrice > 0 && formData.flashSalePrice > 0)
    ? Math.round(100 - (Number(formData.flashSalePrice) * 100 / originalPrice))
    : 0;

  const handleQuickPercentSelect = (percent) => {
    if (!originalPrice) return message.warning("Vui lòng chọn sản phẩm trước!");
    const calculatedPrice = Math.round(originalPrice * (100 - percent) / 100);
    setFormData(prev => ({ ...prev, flashSalePrice: calculatedPrice }));
    if (errors.flashSalePrice) setErrors(prev => ({ ...prev, flashSalePrice: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const now = new Date();
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (!formData.productVariantId) newErrors.productVariantId = "Vui lòng chọn sản phẩm";
    
    if (!formData.flashSalePrice || formData.flashSalePrice <= 0) {
        newErrors.flashSalePrice = "Vui lòng nhập giá";
    } else if (originalPrice > 0) {
        if (formData.flashSalePrice >= originalPrice) {
            newErrors.flashSalePrice = "Giá sale phải nhỏ hơn giá gốc";
        } else if (currentDiscountPercent > 50) {
            newErrors.flashSalePrice = `Giảm tối đa 50% (Tối thiểu: ${formatNumber(originalPrice * 0.5)}đ)`;
        }
    }

    if (!formData.saleStockQuantity || formData.saleStockQuantity <= 0) newErrors.saleStockQuantity = "Số lượng không hợp lệ";
    if (!formData.startTime) newErrors.startTime = "Thiếu ngày bắt đầu";
    else if (!isEdit && start < now) newErrors.startTime = "Không được chọn quá khứ";
    if (!formData.endTime) newErrors.endTime = "Thiếu ngày kết thúc";
    else if (end <= start) newErrors.endTime = "Ngày kết thúc phải sau ngày bắt đầu";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      productVariantId: Number(formData.productVariantId),
      flashSalePrice: Number(formData.flashSalePrice),
      saleStockQuantity: Number(formData.saleStockQuantity),
      maxQuantityPerUser: 1,
      startTime: `${formData.startTime}:00`,
      endTime: `${formData.endTime}:00`,
    };

    saveSale({ id: initialData?.id, data: payload }, {
      onSuccess: () => {
        message.success(isEdit ? 'Cập nhật thành công!' : 'Tạo Flash Sale thành công!');
        onSuccess();
      },
      onError: (error) => {
        const errData = error.response?.data;
        if (errData?.errors && Array.isArray(errData.errors)) {
          errData.errors.forEach(err => message.error(`Lỗi: ${err.defaultMessage || err.message}`));
          return;
        }
        message.error(errData?.messages || errData?.message || "Lỗi lưu dữ liệu!");
      }
    });
  };

  const handlePriceChange = (e) => {
    const rawValue = parseNumber(e.target.value); 
    setFormData(prev => ({ ...prev, flashSalePrice: rawValue }));
    if (errors.flashSalePrice) setErrors(prev => ({ ...prev, flashSalePrice: null }));
  };

  const handleGenericChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-xl flex flex-col shadow-xl overflow-hidden font-sans">
        
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center">
              <Zap size={16} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide m-0">{isEdit ? 'Chỉnh Sửa Hàng Giờ Vàng' : 'Tạo Flash Sale Mới'}</h2>
              <p className="text-[11px] text-gray-400 m-0 mt-0.5 font-medium">Thiết lập khung giờ vàng giảm giá mặt hàng</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full border-none bg-transparent cursor-pointer text-gray-400 flex items-center justify-center"><X size={18} /></button>
        </div>
        
        <div className="p-5 overflow-y-auto max-h-[75vh] flex-1 relative">
          {isPending && (
            <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
              <Spin tip="Đang đồng bộ..." />
            </div>
          )}

          <form id="flashsale-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Sản phẩm áp dụng <span className="text-red-500">*</span></label>
              <Select
                showSearch
                placeholder="Gõ tìm kiếm SKU hoặc tên sản phẩm..."
                disabled={isEdit || isPending}
                filterOption={false}
                onSearch={handleSearchVariant}
                loading={fetching}
                value={formData.productVariantId || undefined}
                popupClassName="!w-[420px]"
                onChange={(val) => {
                  setFormData({...formData, productVariantId: val});
                  if (errors.productVariantId) setErrors(prev => ({...prev, productVariantId: null}));
                }}
                className="w-full h-9 text-xs"
                options={isEdit && selectedVariant ? [{
                  value: initialData.variantId,
                  label: `[${selectedVariant.sku || 'N/A'}] ${selectedVariant.productName} (${selectedVariant.options})`
                }] : variantOptions.map(v => ({
                  value: v.id,
                  label: `[${v.sku || 'N/A'}] ${v.productName} (${v.options})`
                }))}
              />
              {errors.productVariantId && <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 m-0 mt-0.5"><AlertCircle size={12}/>{errors.productVariantId}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 bg-gray-50/60 p-3 rounded-lg border border-gray-200/60">
                <div className="flex justify-between items-center mb-0.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Giá Flash Sale (VND)</label>
                  {currentDiscountPercent > 0 && currentDiscountPercent <= 100 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${currentDiscountPercent > 50 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                      -{currentDiscountPercent}%
                    </span>
                  )}
                </div>
                
                <Input 
                  type="text" 
                  disabled={isPending}
                  value={formatNumber(formData.flashSalePrice)} 
                  onChange={handlePriceChange} 
                  className="h-9 text-xs bg-white rounded-md"
                  placeholder="VD: 2,500,000"
                />
                
                {originalPrice > 0 && (
                  <div className="mt-1">
                     <p className="text-[10px] font-bold text-gray-400 m-0">
                       Giá gốc: <span className="line-through font-mono">{formatNumber(originalPrice)}đ</span>
                     </p>
                  </div>
                )}

                {originalPrice > 0 && !isPending && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                     {[10, 20, 30, 50].map(percent => (
                       <button
                         key={percent}
                         type="button"
                         onClick={() => handleQuickPercentSelect(percent)}
                         className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer
                           ${currentDiscountPercent === percent 
                             ? 'bg-orange-500 text-white border-orange-500' 
                             : 'bg-white text-gray-500 border-gray-200 hover:bg-orange-50 hover:text-orange-600'}`}
                       >
                         -{percent}%
                       </button>
                     ))}
                  </div>
                )}
                
                {errors.flashSalePrice && <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 m-0 mt-1"><AlertCircle size={12}/>{errors.flashSalePrice}</p>}
              </div>
              
              <div className="flex flex-col gap-1 justify-start">
                <Input 
                  label="Tổng số suất mở bán *" 
                  type="number" 
                  name="saleStockQuantity"
                  disabled={isPending}
                  value={formData.saleStockQuantity} 
                  onChange={handleGenericChange} 
                  className="h-9 text-xs rounded-md"
                  placeholder="VD: 50"
                />
                {errors.saleStockQuantity && <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 m-0 mt-0.5"><AlertCircle size={12}/>{errors.saleStockQuantity}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Input 
                  label="Thời gian kích hoạt *" 
                  type="datetime-local" 
                  name="startTime"
                  disabled={isPending}
                  value={formData.startTime} 
                  min={!isEdit ? minDateTime : undefined}
                  onChange={handleGenericChange}
                  className="h-9 text-xs rounded-md"
                />
                {errors.startTime && <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 m-0 mt-0.5"><AlertCircle size={12}/>{errors.startTime}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Input 
                  label="Thời gian kết thúc *" 
                  type="datetime-local" 
                  name="endTime"
                  disabled={isPending}
                  value={formData.endTime} 
                  min={formData.startTime || minDateTime}
                  onChange={handleGenericChange}
                  className="h-9 text-xs rounded-md"
                />
                {errors.endTime && <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 m-0 mt-0.5"><AlertCircle size={12}/>{errors.endTime}</p>}
              </div>
            </div>

            <div className="p-3 bg-gray-50/60 rounded-lg border border-gray-200/60 flex items-start gap-2">
               <div className="w-7 h-7 bg-white rounded border flex items-center justify-center text-gray-400 shrink-0">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
               </div>
               <p className="text-[10px] text-gray-400 font-medium italic m-0 leading-normal">
                 Mỗi tài khoản khách hàng được cấu hình mặc định chỉ mua giới hạn 01 sản phẩm trong suốt thời gian diễn ra chiến dịch nhằm ngăn chặn hành vi đầu cơ tích trữ.
               </p>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end gap-2">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isPending}
            className="h-9 px-4 text-xs font-bold uppercase tracking-wide text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors border-none rounded-md cursor-pointer"
          >
            Hủy bỏ
          </button>
          <Button 
            type="submit" 
            form="flashsale-form" 
            loading={isPending}
            disabled={isPending}
            className="h-9 px-5 text-xs font-bold uppercase tracking-wide bg-orange-600 text-white hover:bg-orange-700 rounded-md flex items-center gap-1.5 border-none"
          >
            <Save size={14} /> {isEdit ? 'Lưu thay đổi' : 'Kích hoạt ngay'}
          </Button>
        </div>

      </div>
    </div>
  );
};