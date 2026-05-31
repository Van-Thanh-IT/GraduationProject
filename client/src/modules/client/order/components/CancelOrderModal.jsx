// File: src/modules/client/order/components/CancelOrderModal.jsx
import React, { useState } from 'react';
import { Modal, Radio, Input} from 'antd';
import { AlertCircle } from 'lucide-react';
import { useCancelOrderByUser } from '@/hooks/useOrders';
import { toast } from 'react-toastify';

const CANCEL_REASONS = [
  'Tôi muốn thay đổi địa chỉ nhận hàng',
  'Tôi muốn thay đổi sản phẩm/phân loại',
  'Tìm thấy giá rẻ hơn ở nơi khác',
  'Đổi ý, không muốn mua nữa',
  'Khác'
];

export default function CancelOrderModal({ isOpen, onClose, orderCode }) {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [otherReason, setOtherReason] = useState('');
  
  const { mutate: cancelOrder, isLoading } = useCancelOrderByUser();

  const handleConfirm = () => {
    const finalReason = selectedReason === 'Khác' ? otherReason : selectedReason;
    
    if (selectedReason === 'Khác' && !otherReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn!');
      return;
    }

    cancelOrder(
      { code: orderCode, reason: finalReason },
      {
        onSuccess: () => {
          toast.success('Hủy đơn hàng thành công!');
          onClose();
        },
        onError: (error) => {
          toast.error(error.response?.data?.messages || 'Có lỗi xảy ra khi hủy đơn!');
        }
      }
    );
  };

  return (
    <Modal
      title={<div className="flex items-center gap-2 text-rose-600"><AlertCircle size={20} /> Xác nhận hủy đơn hàng</div>}
      open={isOpen}
      onCancel={onClose}
      onOk={handleConfirm}
      confirmLoading={isLoading}
      okText="Đồng ý hủy"
      cancelText="Không"
      okButtonProps={{ danger: true, className: 'bg-rose-600 font-bold rounded-lg' }}
      cancelButtonProps={{ className: 'font-bold rounded-lg border-gray-300' }}
      centered
    >
      <div className="py-4">
        <p className="text-gray-600 mb-4 text-[15px]">
          Bạn có chắc chắn muốn hủy đơn hàng <strong>{orderCode}</strong> không? Vui lòng chọn lý do hủy:
        </p>
        <Radio.Group 
          onChange={(e) => setSelectedReason(e.target.value)} 
          value={selectedReason}
          className="flex flex-col gap-3 w-full"
        >
          {CANCEL_REASONS.map((reason, idx) => (
            <Radio key={idx} value={reason} className="text-[15px] font-medium text-gray-700">
              {reason}
            </Radio>
          ))}
        </Radio.Group>

        {selectedReason === 'Khác' && (
          <Input.TextArea
            rows={3}
            className="mt-4 rounded-xl"
            placeholder="Nhập lý do của bạn..."
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
          />
        )}
      </div>
    </Modal>
  );
}