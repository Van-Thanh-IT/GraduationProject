// File: src/modules/client/checkout/components/VoucherSelection.jsx
import React, { useState } from 'react';
import { Input, Button, Modal, Spin } from 'antd';
import { TagOutlined, RightOutlined } from '@ant-design/icons';
import { formatCurrency } from '@/utils/format';
import { useGetAvailableVouchers, usePreviewDiscount } from '@/hooks/useVouchers';

export default function VoucherSelection({ subTotal, setVoucherDiscount, currentVoucherCode, setVoucherCode }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Gọi API lấy danh sách
  const { data: availableVouchers = [], isLoading: isLoadingVouchers } = useGetAvailableVouchers();
  
  // Gọi API áp dụng mã
  const { mutate: previewDiscount, isLoading: isApplying } = usePreviewDiscount();

  // Hàm xử lý áp mã
  const handleApply = (code) => {
    if (!code || !code.trim()) {
      setErrorMessage('Vui lòng nhập mã giảm giá!');
      return;
    }

    setErrorMessage('');
    previewDiscount(
      { code: code.trim(), orderTotal: subTotal },
      {
        onSuccess: (res) => {
          if (res.data?.code === 200) {
            setVoucherDiscount(res.data.data.discountAmount);
            setVoucherCode(code.toUpperCase());
            setIsModalVisible(false); // Đóng modal nếu đang mở
          } else {
            setErrorMessage(res.data?.messages || 'Mã giảm giá không hợp lệ');
            setVoucherDiscount(0);
            setVoucherCode('');
          }
        },
        onError: (err) => {
          setErrorMessage(err.response?.data?.messages || 'Không thể áp dụng mã lúc này');
          setVoucherDiscount(0);
          setVoucherCode('');
        }
      }
    );
  };

  // Hàm hủy mã đang dùng
  const handleRemoveVoucher = () => {
    setVoucherDiscount(0);
    setVoucherCode('');
    setErrorMessage('');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5">
          <TagOutlined className="text-indigo-500" /> Mã giảm giá
        </span>
        <button 
          onClick={() => setIsModalVisible(true)}
          className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline"
        >
          Chọn mã <RightOutlined className="text-[9px]" />
        </button>
      </div>

      {/* NẾU ĐÃ ÁP DỤNG THÀNH CÔNG */}
      {currentVoucherCode ? (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
              <TagOutlined className="text-xs" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-emerald-600 font-medium">Đã áp dụng mã</span>
              <span className="text-[13px] font-black text-emerald-700 uppercase tracking-widest">{currentVoucherCode}</span>
            </div>
          </div>
          <button onClick={handleRemoveVoucher} className="text-rose-500 text-xs font-bold hover:underline">Hủy bỏ</button>
        </div>
      ) : (
        /* KHU VỰC NHẬP MÃ (KHI CHƯA CÓ MÃ NÀO) */
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <Input 
              placeholder="Nhập mã voucher..." 
              id="voucherInput"
              className={`rounded-xl h-11 uppercase font-medium ${errorMessage ? 'border-rose-400 focus:border-rose-500 focus:shadow-[0_0_0_2px_rgba(251,113,133,0.1)]' : ''}`}
              onPressEnter={(e) => handleApply(e.target.value)}
              onChange={() => setErrorMessage('')} // Gõ là mất dòng lỗi
            />
            <Button 
              type="primary" 
              loading={isApplying}
              onClick={() => handleApply(document.getElementById('voucherInput').value)}
              className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold px-6"
            >
              Áp dụng
            </Button>
          </div>
          {errorMessage && (
            <span className="text-rose-500 text-[11px] font-medium pl-1 animate-pulse">{errorMessage}</span>
          )}
        </div>
      )}

      {/* MODAL DANH SÁCH VOUCHER */}
      <Modal
        title={<span className="text-lg font-black text-slate-800">Chọn Mã Giảm Giá</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={450}
        centered
        className="custom-voucher-modal"
      >
        <div className="flex flex-col gap-4 mt-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 pb-4">
          
          {isLoadingVouchers ? (
            <div className="flex justify-center py-10"><Spin /></div>
          ) : availableVouchers.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-medium">Bạn chưa có mã giảm giá nào.</div>
          ) : (
            availableVouchers.map((v) => {
              // Thuật toán kiểm tra điều kiện
              const isEligible = subTotal >= v.minOrderValue && v.isValid;
              
              // Tính toán text hiển thị
              const discountText = v.discountType === 'PERCENT' 
                ? `Giảm ${v.discountValue}%` 
                : `Giảm ${formatCurrency(v.discountValue)}`;
              const maxDiscountText = v.discountType === 'PERCENT' ? `Tối đa ${formatCurrency(v.maxDiscountValue)}` : '';

              return (
                <div 
                  key={v.id} 
                  className={`flex bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
                    isEligible ? 'border-indigo-100 hover:border-indigo-400 hover:shadow-md' : 'border-slate-200 opacity-60 bg-slate-50'
                  }`}
                >
                  {/* Cột trái (Màu cam/xanh) */}
                  <div className={`w-[100px] flex flex-col items-center justify-center p-3 border-r border-dashed ${isEligible ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-100 border-slate-300'}`}>
                    <TagOutlined className={`text-2xl ${isEligible ? 'text-indigo-500' : 'text-slate-400'} mb-1`} />
                    <span className="text-[10px] text-center font-bold text-slate-500 line-clamp-2 leading-tight mt-1">
                      {v.name}
                    </span>
                  </div>
                  
                  {/* Cột phải (Thông tin) */}
                  <div className="flex-1 p-3 flex flex-col justify-between relative">
                    <div className="flex flex-col">
                       <span className={`text-[15px] font-black ${isEligible ? 'text-indigo-700' : 'text-slate-500'}`}>{discountText}</span>
                       <span className="text-[11px] text-slate-500 font-medium mt-0.5">Đơn tối thiểu {formatCurrency(v.minOrderValue)}</span>
                       {maxDiscountText && <span className="text-[11px] text-slate-500 font-medium">{maxDiscountText}</span>}
                       
                       {/* ĐÃ BỔ SUNG MÃ CODE Ở ĐÂY */}
                       <div className="mt-1.5">
                         <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-dashed rounded ${isEligible ? 'bg-indigo-50/50 text-indigo-600 border-indigo-300' : 'bg-slate-100 text-slate-500 border-slate-300'}`}>
                           Mã: {v.code}
                         </span>
                       </div>
                    </div>
                    
                    <div className="flex items-end justify-between mt-3">
                       <div className="flex flex-col">
                         <span className="text-[9px] text-rose-500 font-bold uppercase">Sắp hết hạn</span>
                         <span className="text-[10px] text-slate-400 font-medium">Còn {v.usageLimit - v.usedCount} lượt</span>
                       </div>
                       
                       <Button 
                         type={isEligible ? "primary" : "default"}
                         size="small"
                         disabled={!isEligible}
                         loading={isApplying && currentVoucherCode === v.code}
                         onClick={() => handleApply(v.code)}
                         className={`font-bold rounded-lg px-4 ${isEligible ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                       >
                         Dùng
                       </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal>

    </div>
  );
}