import React, { useState, useEffect } from 'react';
import { message, Spin, Popconfirm, Switch, Radio } from 'antd';
import { DeleteOutlined, StarFilled, UploadOutlined, InfoCircleOutlined, BarcodeOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ProductService } from '@/services/product.service';
import { formatNumber, parseNumber } from '@/utils/format';

export default function EditVariantAndImageForm({ variant, product, onRefresh }) {
  const hasOpt1 = !!product?.option1Name;
  const hasOpt2 = !!product?.option2Name;
  const hasOpt3 = !!product?.option3Name;

  const [loadingInfo, setLoadingInfo] = useState(false);
  const [formData, setFormData] = useState({
    price: variant.price || '',
    originalPrice: variant.originalPrice || '', 
    weight: variant.weight || '',               
    option1Value: variant.option1Value || '',
    option2Value: variant.option2Value || '',
    option3Value: variant.option3Value || '',
    isDefault: variant.isDefault || false,
    isSerialRequired: variant.isSerialRequired !== undefined ? variant.isSerialRequired : null 
  });

  const [loadingImg, setLoadingImg] = useState(false);
  const images = variant.images || []; 

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      isDefault: variant.isDefault || false,
      isSerialRequired: variant.isSerialRequired !== undefined ? variant.isSerialRequired : null
    }));
  }, [variant]);


  const handleUpdateInfo = async (e) => {
    e.preventDefault();

    // Bắt lỗi: Nếu người dùng cố tình xóa trạng thái hoặc chưa chọn
    if (formData.isSerialRequired === null) {
      message.error("Vui lòng tích chọn CÓ hoặc KHÔNG cho phần Quản lý Serial!");
      return;
    }

    setLoadingInfo(true);
    try {
       const payload = { ...formData, stockQuantity: variant.stockQuantity };
       await ProductService.updateVariant(variant.id, payload);
       message.success("Cập nhật thông tin biến thể thành công!");
       onRefresh();
    } catch (error) {
      console.log("CHI TIẾT LỖI TỪ BACKEND:", error.response?.data);
      const errorMessage = error.response?.data?.messages || error.response?.data?.message || "Cập nhật thất bại do dữ liệu không hợp lệ!"; 
      message.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleToggleDefault = async (checked) => {
    setFormData({ ...formData, isDefault: checked });
    setLoadingInfo(true);
    try {
       const payload = { ...formData, stockQuantity: variant.stockQuantity, isDefault: checked };
       await ProductService.updateVariant(variant.id, payload);
       message.success("Đã cập nhật biến thể mặc định!");
       onRefresh();
    } catch (error) {
       message.error("Lỗi cập nhật! Vui lòng thử lại.");
       setFormData({ ...formData, isDefault: !checked }); 
    } finally {
       setLoadingInfo(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setLoadingImg(true);
    try {
      await ProductService.uploadVariantImages(variant.id, files);
      message.success("Tải ảnh lên thành công!");
      onRefresh();
    } catch (error) {
      message.error("Tải ảnh thất bại!");
    } finally {
      setLoadingImg(false);
      e.target.value = null; 
    }
  };

  const handleDeleteImg = async (imageId) => {
    try {
      await ProductService.deleteVariantImage(imageId);
      message.success("Xóa ảnh thành công!");
      onRefresh();
    } catch (error) {
      message.error("Xóa ảnh thất bại!");
    }
  };

  const handleSetThumbnail = async (imageId) => {
    try {
      await ProductService.setThumbnail(imageId);
      message.success("Đã đặt làm ảnh đại diện!");
      onRefresh();
    } catch (error) {
      message.error("Đặt ảnh đại diện thất bại!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
      
      {/* ================= CỘT TRÁI ================= */}
      <div className="flex flex-col gap-4 border-r border-slate-100 pr-6">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">Thông tin biến thể</h4>
        
        <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700">Biến thể mặc định</span>
              <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <InfoCircleOutlined /> Hiển thị làm ảnh bìa ngoài trang chủ
              </span>
            </div>
            <Switch 
              checked={formData.isDefault} 
              loading={loadingInfo} 
              onChange={handleToggleDefault} 
              className={formData.isDefault ? "bg-blue-600" : "bg-slate-300"}
            />
        </div>

        <form onSubmit={handleUpdateInfo} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 mt-1">
            {hasOpt1 && (<Input label={product.option1Name} required value={formData.option1Value} onChange={e => setFormData({...formData, option1Value: e.target.value})} />)}
            {hasOpt2 && (<Input label={product.option2Name} required value={formData.option2Value} onChange={e => setFormData({...formData, option2Value: e.target.value})} />)}
            {hasOpt3 && (<Input label={product.option3Name} required value={formData.option3Value} onChange={e => setFormData({...formData, option3Value: e.target.value})} />)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Giá bán (VNĐ)"
              type="text"
              required
              value={formatNumber(formData.price)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseNumber(e.target.value),
                })
              }
            />

            <Input
              label="Giá gốc (VNĐ)"
              type="text"
              value={formatNumber(formData.originalPrice)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  originalPrice: parseNumber(e.target.value),
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Trọng lượng (kg)" type="number" step="0.01" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
            
            {/* === Ô CHỌN SERIAL BẰNG RADIO CÓ/KHÔNG === */}
            <div className={`p-2 rounded-lg border flex flex-col justify-center ${formData.isSerialRequired === null ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex flex-col mb-1.5">
                  <span className={`text-xs font-bold flex items-center gap-1 ${formData.isSerialRequired === null ? 'text-rose-600' : 'text-slate-700'}`}>
                     <BarcodeOutlined />Serial/IMEI {formData.isSerialRequired === null && <span className="text-rose-500">*</span>}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Bắt buộc</span>
                </div>
                
                <Radio.Group 
                   onChange={e => setFormData({...formData, isSerialRequired: e.target.value})} 
                   value={formData.isSerialRequired}
                   className="flex gap-4 ml-1"
                >
                   <Radio value={true} className="text-sm">CÓ</Radio>
                   <Radio value={false} className="text-sm">KHÔNG</Radio>
                </Radio.Group>
            </div>
          </div>

          <div className="mt-1 flex justify-end">
             <Button type="submit" loading={loadingInfo} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-xl shadow-md">
               Lưu thay đổi
             </Button>
          </div>
        </form>
      </div>

      {/* ================= CỘT PHẢI (Giữ nguyên phần Quản lý hình ảnh) ================= */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-slate-700">Quản lý Hình ảnh ({images.length})</h4>
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg cursor-pointer text-sm font-medium transition flex items-center gap-1">
            <UploadOutlined /> Thêm ảnh
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <Spin spinning={loadingImg}>
          {images.length === 0 ? (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex items-center justify-center text-slate-400 text-sm">
              Chưa có hình ảnh nào.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {images.map(img => (
                <div key={img.id} className={`relative group rounded-xl border-2 overflow-hidden ${img.isThumbnail ? 'border-yellow-400 shadow-md' : 'border-slate-200'}`}>
                  <img src={img.imageUrl} alt="variant" className="w-full h-24 object-cover" />
                  {img.isThumbnail && (
                    <div className="absolute top-1 left-1 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded shadow">Ảnh chính</div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isThumbnail && (
                       <button title="Đặt làm ảnh chính" type="button" onClick={() => handleSetThumbnail(img.id)} className="w-8 h-8 rounded-full bg-white text-yellow-500 hover:scale-110 transition flex items-center justify-center">
                         <StarFilled />
                       </button>
                    )}
                    <Popconfirm title="Xóa ảnh này?" onConfirm={() => handleDeleteImg(img.id)} okText="Xóa">
                      <button title="Xóa ảnh" type="button" className="w-8 h-8 rounded-full bg-red-500 text-white hover:scale-110 transition flex items-center justify-center">
                        <DeleteOutlined />
                      </button>
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Spin>
      </div>

    </div>
  );
}