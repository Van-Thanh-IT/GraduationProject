import React, { useState } from 'react';
import { message, Button as AntButton, Radio } from 'antd'; // Thay Switch bằng Radio
import { DeleteOutlined, PlusOutlined, BarcodeOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ProductService } from '@/services/product.service';

export default function AddVariantForm({ product, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);

  const hasOpt1 = !!product?.option1Name;
  const hasOpt2 = !!product?.option2Name;
  const hasOpt3 = !!product?.option3Name;

  // Cập nhật tên biến thành isSerial và đặt mặc định là null (Bắt buộc phải chọn)
  const emptyVariant = {
    option1Value: '',
    option2Value: '',
    option3Value: '',
    price: '',
    originalPrice: '',
    weight: '', 
    isDefault: false,
    isSerialRequired: null // null nghĩa là người dùng chưa chọn Có/Không
  };

  const [variants, setVariants] = useState([{ ...emptyVariant }]);

  const handleAddRow = () => {
    setVariants([...variants, { ...emptyVariant }]);
  };

  const handleRemoveRow = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (variants.length === 0) {
      return message.warning("Vui lòng thêm ít nhất 1 biến thể!");
    }

    // VALIDATE: Bắt lỗi nếu người dùng bỏ quên chưa tick chọn ô isSerial
    const hasUnselectedSerial = variants.some(v => v.isSerialRequired === null);
    if (hasUnselectedSerial) {
       return message.error("Vui lòng tích chọn CÓ hoặc KHÔNG cho phần Quản lý Serial ở tất cả các dòng!");
    }

    setLoading(true);
    try {
      await ProductService.createVariant(product.id, variants);
      message.success(`Đã tạo thành công ${variants.length} biến thể!`);
      onSuccess();
    } catch (error) {
       console.log("CHI TIẾT LỖI TỪ BACKEND:", error.response?.data);
       const errorMessage = 
         error.response?.data?.messages || 
         error.response?.data?.message ||  
         error.response?.data?.error ||    
         "Tạo biến thể thất bại do dữ liệu không hợp lệ!"; 
 
       if (Array.isArray(errorMessage)) {
          message.error(`Lỗi: ${errorMessage.join(', ')}`);
       } else {
          message.error(`Lỗi: ${errorMessage}`);
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      
      <div className="flex flex-col gap-3">
        {variants.map((variant, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm relative group">
            
            <div className="flex items-center justify-center w-6 h-8 bg-slate-100 text-slate-500 font-bold rounded-md mt-6">
              {index + 1}
            </div>

            <div className="flex-1 grid grid-cols-2 lg:grid-cols-6 gap-3">
              {hasOpt1 && (
                <Input label={product.option1Name} required placeholder="VD: Đỏ" value={variant.option1Value} onChange={e => handleChange(index, 'option1Value', e.target.value)} />
              )}
              {hasOpt2 && (
                <Input label={product.option2Name} required placeholder="VD: 128GB" value={variant.option2Value} onChange={e => handleChange(index, 'option2Value', e.target.value)} />
              )}
              {hasOpt3 && (
                <Input label={product.option3Name} required value={variant.option3Value} onChange={e => handleChange(index, 'option3Value', e.target.value)} />
              )}
              
              <Input label="Giá bán (VNĐ)" type="number" required placeholder="VD: 22990000" value={variant.price} onChange={e => handleChange(index, 'price', e.target.value)} />
              <Input label="Giá gốc" type="number" placeholder="VD: 25990000" value={variant.originalPrice} onChange={e => handleChange(index, 'originalPrice', e.target.value)} />
              <Input label="Trọng lượng (kg)" type="number" step="0.01" placeholder="VD: 0.22" value={variant.weight} onChange={e => handleChange(index, 'weight', e.target.value)} />
              
              {/* === KHU VỰC CHỌN SERIAL (DÙNG RADIO BUTTONS) === */}
              <div className={`flex flex-col gap-1.5 justify-center mt-1 p-2 rounded-lg border ${variant.isSerialRequired === null ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                 <span className={`text-[11px] font-bold flex items-center gap-1 ${variant.isSerialRequired === null ? 'text-rose-600' : 'text-slate-600'}`}>
                    <BarcodeOutlined />Serial/IMEI {variant.isSerialRequired === null && <span className="text-rose-500">*</span>}
                 </span>
                 <Radio.Group 
                   onChange={e => handleChange(index, 'isSerialRequired', e.target.value)} 
                   value={variant.isSerialRequired}
                   className="flex gap-2"
                 >
                   <Radio value={true} className="text-xs mr-0">CÓ</Radio>
                   <Radio value={false} className="text-xs">KHÔNG</Radio>
                 </Radio.Group>
              </div>
            </div>

            {variants.length > 1 && (
              <AntButton 
                danger type="text" icon={<DeleteOutlined />} 
                onClick={() => handleRemoveRow(index)}
                className="mt-6 hover:bg-red-50"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-2">
        <AntButton 
          type="dashed" icon={<PlusOutlined />} onClick={handleAddRow}
          className="text-blue-600 border-blue-400 hover:bg-blue-50"
        >
          Thêm dòng mới
        </AntButton>

        <div className="flex gap-3">
          <Button type="button" onClick={onCancel} className="bg-gray-400 text-white px-6">Hủy</Button>
          <Button type="submit" loading={loading} className="bg-blue-600 text-white px-6">Lưu {variants.length} biến thể</Button>
        </div>
      </div>

    </form>
  );
}