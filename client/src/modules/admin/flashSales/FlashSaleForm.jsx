import React, { useState, useEffect, useRef } from 'react';
import { Select, Spin, message } from 'antd';
import { X, Save, Zap, AlertCircle } from 'lucide-react';
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ProductService } from '@/services/product.service';
import { useSaveFlashSale } from '@/hooks/useFlashSales';
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
  const [variants, setVariants] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [minDateTime, setMinDateTime] = useState('');
  
  const searchTimeout = useRef(null);
  const isEdit = !!initialData;

  useEffect(() => {
    if (!isOpen) return;

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setMinDateTime(now.toISOString().slice(0, 16));

    if (initialData) {
      setFormData({
        productVariantId: initialData.variantId,
        // Ép kiểu về số thuần trong trường hợp backend gửi chuỗi có dấu
        flashSalePrice: initialData.flashSalePrice ? parseNumber(initialData.flashSalePrice) : '',
        saleStockQuantity: initialData.saleStockQuantity,
        maxQuantityPerUser: 1,
        startTime: initialData.startTime?.substring(0, 16) || '',
        endTime: initialData.endTime?.substring(0, 16) || '',
      });
      setVariants([{
        id: initialData.variantId,
        productName: initialData.productName,
        options: initialData.variantOptions,
        price: initialData.originalPrice,
        sku: initialData.sku || 'SKU'
      }]);
    } else {
      setFormData({ productVariantId: '', flashSalePrice: '', startTime: '', endTime: '', saleStockQuantity: '', maxQuantityPerUser: 1 });
      fetchVariants(''); 
    }
    setErrors({});
  }, [initialData, isOpen]);

  const fetchVariants = async (keyword = '') => {
    setFetching(true);
    try {
      const res = await ProductService.searchSimpleVariant(keyword);
      setVariants(res.data.data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách sản phẩm", error);
    } finally {
      setFetching(false);
    }
  };

  const handleSearchVariant = (value) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchVariants(value), 500);
  };

  const validateForm = () => {
    const newErrors = {};
    const now = new Date();
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (!formData.productVariantId) newErrors.productVariantId = "Vui lòng chọn sản phẩm";
    if (!formData.flashSalePrice || formData.flashSalePrice <= 0) newErrors.flashSalePrice = "Giá sale không hợp lệ";
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
        if (errData?.messages) return message.error(errData.messages);
        const finalMsg = errData?.message || errData?.error || "Lỗi lưu dữ liệu!";
        message.error(finalMsg);
      }
    });
  };

  // ✅ Đã cập nhật hàm xử lý nhập tiền
  const handlePriceChange = (e) => {
    const rawValue = parseNumber(e.target.value); 
    setFormData({ ...formData, flashSalePrice: rawValue });
    if (errors.flashSalePrice) setErrors(prev => ({ ...prev, flashSalePrice: null }));
  };

  // Xử lý chung cho các input khác để xóa text báo lỗi khi gõ
  const handleGenericChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  if (!isOpen) return null;

  const selectedVariant = variants.find(v => v.id === Number(formData.productVariantId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b bg-orange-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-200">
              <Zap size={22} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{isEdit ? 'Chỉnh Sửa Deal' : 'Tạo Flash Sale Mới'}</h2>
              <p className="text-xs text-slate-400 font-medium">Thiết lập khung giờ vàng giảm giá cực sốc</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24} /></button>
        </div>
        
        {/* Form Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative">
          
          {/* Lớp phủ Loading mờ đi khi API đang chạy */}
          {isPending && (
            <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] flex items-center justify-center rounded-lg">
              <Spin tip="Đang đồng bộ dữ liệu..." size="large" />
            </div>
          )}

          <form id="flashsale-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700">Sản phẩm áp dụng <span className="text-red-500">*</span></label>
                <Select
                  showSearch
                  placeholder="Tìm SKU hoặc tên sản phẩm..."
                  disabled={isEdit || isPending}
                  filterOption={false}
                  onSearch={handleSearchVariant}
                  loading={fetching}
                  value={formData.productVariantId || undefined}
                  onChange={(val) => {
                    setFormData({...formData, productVariantId: val});
                    if (errors.productVariantId) setErrors(prev => ({...prev, productVariantId: null}));
                  }}
                  className={`w-full h-11 custom-select-premium ${errors.productVariantId ? 'border-red-500' : ''}`}
                  options={variants.map(v => ({
                    value: v.id,
                    label: `[${v.sku || 'N/A'}] ${v.productName} (${v.options})`
                  }))}
                />
                {errors.productVariantId && <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.productVariantId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Input 
                    label="Giá Flash Sale (VND)" 
                    type="text" // ✅ Ép về Type Text để hiển thị Format
                    disabled={isPending}
                    value={formatNumber(formData.flashSalePrice)} // ✅ Gọi Format
                    onChange={handlePriceChange} // ✅ Gọi Hàm Handle Format
                    className="h-11 rounded-xl"
                  />
                  {selectedVariant?.price && (
                    <p className="text-[10px] font-bold text-slate-400 px-1">
                      Giá gốc: {formatNumber(selectedVariant.price)}đ {/* ✅ Dùng format ở đây luôn */}
                    </p>
                  )}
                  {errors.flashSalePrice && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.flashSalePrice}</p>}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <Input 
                    label="Tổng suất bán" 
                    type="number" 
                    name="saleStockQuantity"
                    disabled={isPending}
                    value={formData.saleStockQuantity} 
                    onChange={handleGenericChange} 
                    className="h-11 rounded-xl"
                  />
                  {errors.saleStockQuantity && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.saleStockQuantity}</p>}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Input 
                  label="Thời gian bắt đầu" 
                  type="datetime-local" 
                  name="startTime"
                  disabled={isPending}
                  value={formData.startTime} 
                  min={!isEdit ? minDateTime : undefined}
                  onChange={handleGenericChange}
                  className="h-11 rounded-xl"
                />
                {errors.startTime && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.startTime}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input 
                  label="Thời gian kết thúc" 
                  type="datetime-local" 
                  name="endTime"
                  disabled={isPending}
                  value={formData.endTime} 
                  min={formData.startTime || minDateTime}
                  onChange={handleGenericChange}
                  className="h-11 rounded-xl"
                />
                {errors.endTime && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.endTime}</p>}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border"><InfoCircle size={20}/></div>
               <div className="flex-1">
                  <p className="text-[11px] text-slate-500 font-medium italic">Giới hạn mua: Hệ thống đã mặc định mỗi khách hàng chỉ được mua 1 sản phẩm trong 1 lần Flash Sale để tránh đầu cơ.</p>
               </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t bg-slate-50/50 flex justify-end gap-3 relative z-20">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isPending}
            className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <Button 
            type="submit" 
            form="flashsale-form" 
            loading={isPending}
            disabled={isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white border-none shadow-lg shadow-orange-200 px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            <Save size={18} /> {isEdit ? 'Lưu thay đổi' : 'Kích hoạt ngay'}
          </Button>
        </div>

      </div>
    </div>
  );
};

// Helper icon
const InfoCircle = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
);