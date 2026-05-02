// File: src/modules/client/order/components/ReviewModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Rate, Input, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCreateReview } from '@/hooks/useReviews';

const { TextArea } = Input;

export default function ReviewModal({ isOpen, onClose, reviewItem }) {
  const [rating, setRating] = useState(5); // Mặc định 5 sao
  const [comment, setComment] = useState('');
  const [fileList, setFileList] = useState([]);
  
  const { mutate: createReview, isPending } = useCreateReview();

  // Reset form mỗi khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setComment('');
      setFileList([]);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (rating === 0) {
      return message.warning("Vui lòng chọn số sao đánh giá!");
    }

    // Vì có đính kèm file nên bắt buộc dùng FormData
    const formData = new FormData();
    formData.append('orderItemId', reviewItem.orderItemId);
    formData.append('rating', rating);
    
    if (comment.trim()) {
      formData.append('comment', comment.trim());
    }

    // Append từng file trong danh sách ảnh
    fileList.forEach(file => {
      formData.append('images', file.originFileObj);
    });

    createReview(formData, {
      onSuccess: () => {
        onClose(); // Đóng Modal nếu API thành công
      }
    });
  };

  // Hàm quản lý Upload ảnh (Tối đa 5 ảnh, chuẩn hóa file format)
  const handleChangeImage = ({ fileList: newFileList }) => {
    // Chỉ giữ lại những file thỏa mãn định dạng (AntD chặn upload ảo)
    const filteredList = newFileList.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        message.error(`File ${file.name} quá lớn (Tối đa 5MB)`);
        return false;
      }
      return true;
    });
    setFileList(filteredList);
  };

  return (
    <Modal
      title={<div className="text-lg font-black text-gray-800 tracking-tight">Đánh Giá Sản Phẩm</div>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={550}
      centered
      destroyOnClose
      className="custom-review-modal"
    >
      {/* 1. HIỂN THỊ SẢN PHẨM ĐANG ĐÁNH GIÁ */}
      {reviewItem && (
        <div className="flex gap-3 items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 mb-6 mt-4">
          <img 
            src={reviewItem.thumbnail} 
            alt={reviewItem.productName} 
            className="w-14 h-14 object-cover rounded-lg border border-gray-200 bg-white" 
          />
          <div className="flex flex-col flex-1">
            <h4 className="font-bold text-gray-800 text-[13px] line-clamp-1">{reviewItem.productName}</h4>
            <p className="text-[12px] text-gray-500 font-medium">Phân loại: {reviewItem.variantSpecs}</p>
          </div>
        </div>
      )}

      {/* 2. CHỌN SỐ SAO (RATE) */}
      <div className="flex flex-col items-center justify-center gap-2 mb-6">
        <Rate 
          className="text-[32px] text-amber-500 hover:scale-105 transition-transform" 
          value={rating} 
          onChange={setRating} 
        />
        <span className="text-sm font-bold text-amber-500">
          {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Không hài lòng' : rating === 1 ? 'Tệ hại' : 'Vui lòng đánh giá'}
        </span>
      </div>

      {/* 3. NHẬP NỘI DUNG (COMMENT) */}
      <div className="flex flex-col gap-1.5 mb-5">
        <label className="text-sm font-bold text-gray-700">Mô tả chất lượng</label>
        <TextArea
          rows={4}
          placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này nhé..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="rounded-xl border-gray-200 focus:border-rose-400 focus:ring-rose-100 resize-none px-4 py-3 bg-gray-50 hover:bg-white"
          maxLength={500}
          showCount
        />
      </div>

      {/* 4. UPLOAD HÌNH ẢNH */}
      <div className="flex flex-col gap-1.5 mb-6">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          Thêm hình ảnh 
          <span className="text-[11px] font-medium text-gray-400 font-normal">(Tối đa 5 ảnh)</span>
        </label>
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={handleChangeImage}
          beforeUpload={() => false} // Không upload ngay lập tức, chỉ lưu vào state
          maxCount={5}
          multiple
          accept="image/png, image/jpeg, image/jpg"
        >
          {fileList.length >= 5 ? null : (
            <div className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors">
              <PlusOutlined className="text-xl mb-1" />
              <div className="text-[11px] font-bold mt-1">Tải ảnh</div>
            </div>
          )}
        </Upload>
      </div>

      {/* 5. NÚT SUBMIT */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          onClick={onClose} 
          disabled={isPending}
          className="px-6 py-2 rounded-xl text-[14px] font-bold text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          Trở lại
        </button>
        <button 
          onClick={handleSubmit}
          disabled={isPending}
          className="px-8 py-2 rounded-xl text-[14px] font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center min-w-[120px]"
        >
          {isPending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Hoàn thành"}
        </button>
      </div>
    </Modal>
  );
}