import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, DatePicker, Upload, message, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Button from '@/components/ui/Button'; // Custom Button

const { RangePicker } = DatePicker;

const PLACEMENT_OPTIONS = [
  { label: 'Slider Chính Trang Chủ (HOME_MAIN_SLIDER)', value: 'HOME_MAIN_SLIDER' },
  { label: 'Banner Giữa Trang (HOME_MIDDLE)', value: 'HOME_MIDDLE' },
];

export default function BannerModal({ isOpen, onClose, initialData, onSubmit, isPending }) {
  const [form] = Form.useForm();
  const isEditing = !!initialData;
  
  // State quản lý danh sách file hiển thị trên UI
  const [desktopFileList, setDesktopFileList] = useState([]);
  const [mobileFileList, setMobileFileList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        // Cài đặt dữ liệu text và date
        form.setFieldsValue({
          title: initialData.title,
          placement: initialData.placement,
          targetUrl: initialData.targetUrl,
          sortOrder: initialData.sortOrder,
          isActive: initialData.isActive,
          dateRange: initialData.startDate && initialData.endDate 
            ? [dayjs(initialData.startDate), dayjs(initialData.endDate)] 
            : null,
        });

        // Xử lý hiển thị Preview Ảnh Cũ
        if (initialData.imageUrl) {
          setDesktopFileList([{
            uid: '-1', // ID ảo
            name: 'desktop-image.png',
            status: 'done',
            url: initialData.imageUrl, 
          }]);
        } else {
            setDesktopFileList([]);
        }

        if (initialData.mobileImageUrl) {
          setMobileFileList([{
            uid: '-2',
            name: 'mobile-image.png',
            status: 'done',
            url: initialData.mobileImageUrl,
          }]);
        } else {
             setMobileFileList([]);
        }

      } else {
        // Reset form khi Thêm Mới
        form.resetFields();
        form.setFieldsValue({ sortOrder: 0, isActive: true });
        setDesktopFileList([]);
        setMobileFileList([]);
      }
    }
  }, [isOpen, initialData, form, isEditing]);

  // Hàm chặn chọn ngày quá khứ
  const disabledDate = (current) => {
    // Không thể chọn các ngày trước ngày hôm nay
    return current && current < dayjs().startOf('day');
  };

  const handleFinish = (values) => {
    const formData = new FormData();
    
    formData.append('title', values.title);
    formData.append('placement', values.placement);
    formData.append('sortOrder', values.sortOrder || 0);
    formData.append('isActive', values.isActive);
    if (values.targetUrl) formData.append('targetUrl', values.targetUrl);

    if (values.dateRange && values.dateRange.length === 2) {
      formData.append('startDate', values.dateRange[0].format('YYYY-MM-DDTHH:mm:ss'));
      formData.append('endDate', values.dateRange[1].format('YYYY-MM-DDTHH:mm:ss'));
    }

    // Xử lý lấy file gốc để gửi đi (chỉ lấy file mới được up lên)
    const getOriginFile = (fileList) => {
        if (fileList && fileList.length > 0) {
            // Nếu file có thuộc tính originFileObj, nghĩa là nó là file mới user vừa chọn
            if (fileList[0].originFileObj) {
                return fileList[0].originFileObj;
            }
        }
        return null;
    };

    const newDesktopFile = getOriginFile(desktopFileList);
    if (newDesktopFile) {
      formData.append('desktopImage', newDesktopFile);
    } else if (!isEditing && desktopFileList.length === 0) {
      return message.error('Vui lòng chọn ảnh Desktop!');
    }

    const newMobileFile = getOriginFile(mobileFileList);
    if (newMobileFile) {
      formData.append('mobileImage', newMobileFile);
    }

    onSubmit(formData);
  };

  // Nút Upload hiện đại (Chỉ dùng cho listType="picture-card")
  const uploadButton = (label) => (
    <div className="flex flex-col items-center justify-center text-gray-500 hover:text-indigo-500 transition-colors">
      <PlusOutlined className="text-2xl mb-2" />
      <div className="text-sm font-medium">{label}</div>
    </div>
  );

  return (
    <Modal
      title={<div className="text-2xl font-black text-slate-800 tracking-tight pb-2 border-b border-gray-100">{isEditing ? 'Sửa Banner' : 'Thêm Banner Mới'}</div>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
      centered
      className="custom-banner-modal" // Thêm class nếu bạn muốn custom css thêm
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-6">
        
        <Form.Item name="title" label={<span className="font-semibold text-gray-700">Tên chiến dịch</span>} rules={[{ required: true, message: 'Vui lòng nhập tên chiến dịch!' }]}>
          <Input placeholder="VD: Siêu Sale iPhone 15" size="large" className="rounded-lg" />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
          <Form.Item name="placement" label={<span className="font-semibold text-gray-700">Vị trí hiển thị</span>} rules={[{ required: true, message: 'Chọn vị trí!' }]}>
            <Select options={PLACEMENT_OPTIONS} placeholder="Chọn vị trí..." size="large" className="rounded-lg" />
          </Form.Item>
          
          <Form.Item name="targetUrl" label={<span className="font-semibold text-gray-700">Đường dẫn đích (Target URL)</span>} rules={[{ pattern: /^(https?:\/\/.*)?$/, message: 'Link bắt đầu bằng http:// hoặc https://' }]}>
            <Input placeholder="https://facebook.com/..." size="large" className="rounded-lg" />
          </Form.Item>
        </div>

        {/* Khu vực Upload Ảnh (Giao diện dạng Card) */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6">
            <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Hình ảnh Banner</h4>
            <div className="flex flex-wrap gap-8">
                
                {/* Upload Desktop */}
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-600">
                        Ảnh Desktop <span className="text-red-500">*</span>
                    </span>
                    <Upload
                        listType="picture-card"
                        fileList={desktopFileList}
                        onChange={({ fileList }) => setDesktopFileList(fileList)}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/png, image/jpeg, image/webp"
                        className="custom-upload-card"
                    >
                        {desktopFileList.length >= 1 ? null : uploadButton("Tải ảnh lên")}
                    </Upload>
                    <span className="text-xs text-gray-400">Tỷ lệ khuyên dùng: 16:9</span>
                </div>

                 {/* Upload Mobile */}
                 <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-600">
                        Ảnh Mobile <Tooltip title="Dùng để hiển thị trên màn hình nhỏ. Bỏ trống sẽ dùng ảnh Desktop.">(Tùy chọn)</Tooltip>
                    </span>
                    <Upload
                        listType="picture-card"
                        fileList={mobileFileList}
                        onChange={({ fileList }) => setMobileFileList(fileList)}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/png, image/jpeg, image/webp"
                        className="custom-upload-card"
                    >
                        {mobileFileList.length >= 1 ? null : uploadButton("Tải ảnh lên")}
                    </Upload>
                    <span className="text-xs text-gray-400">Tỷ lệ khuyên dùng: 1:1 hoặc dọc</span>
                </div>

            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-2">
          {/* Áp dụng disabledDate vào RangePicker */}
          <Form.Item name="dateRange" label={<span className="font-semibold text-gray-700">Thời gian diễn ra</span>} className="col-span-2">
            <RangePicker 
                showTime 
                size="large" 
                className="w-full rounded-lg" 
                format="DD/MM/YYYY HH:mm" 
                placeholder={['Bắt đầu', 'Kết thúc']} 
                disabledDate={disabledDate} // <-- CHẶN NGÀY QUÁ KHỨ Ở ĐÂY
            />
          </Form.Item>

          <Form.Item name="sortOrder" label={<span className="font-semibold text-gray-700">Độ ưu tiên</span>}>
            <InputNumber min={0} className="w-full rounded-lg" size="large" placeholder="0" />
          </Form.Item>
        </div>

        <Form.Item name="isActive" label={<span className="font-semibold text-gray-700">Trạng thái</span>} valuePropName="checked">
          <Switch checkedChildren="Hiển thị" unCheckedChildren="Đang ẩn" className="bg-gray-300" />
        </Form.Item>
        
        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} disabled={isPending} type="button" className="px-6">
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" loading={isPending} className="px-8 shadow-md">
            {isEditing ? 'Lưu thay đổi' : 'Thêm Banner'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}