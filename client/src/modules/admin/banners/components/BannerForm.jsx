// File: src/modules/admin/banners/components/BannerModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, DatePicker, Upload, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

const { RangePicker } = DatePicker;

const PLACEMENT_OPTIONS = [
  {
    label: 'Slider Chính Trang Chủ (HOME_MAIN_SLIDER)',
    value: 'HOME_MAIN_SLIDER',
  },
  {
    label: 'Banner Phụ Trang Chủ (HOME_SUB_BANNER)',
    value: 'HOME_SUB_BANNER',
  },
  {
    label: 'Banner Danh Mục Laptop (CATEGORY_LAPTOP)',
    value: 'CATEGORY_LAPTOP',
  },
  {
    label: 'Banner Danh Mục Điện Thoại (CATEGORY_SMARTPHONE)',
    value: 'CATEGORY_SMARTPHONE',
  },
  {
    label: 'Popup Khuyến Mãi (POPUP_PROMO)',
    value: 'POPUP_PROMO',
  },
];

export default function BannerForm({ isOpen, onClose, initialData, onSubmit, isPending, backendError }) {
  const [form] = Form.useForm();
  const isEditing = !!initialData;
  
  const [desktopFileList, setDesktopFileList] = useState([]);
  const [mobileFileList, setMobileFileList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
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

        if (initialData.imageUrl) {
          setDesktopFileList([{
            uid: '-1',
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
        form.resetFields();
        form.setFieldsValue({ sortOrder: 0, isActive: true });
        setDesktopFileList([]);
        setMobileFileList([]);
      }
    }
  }, [isOpen, initialData, form, isEditing]);

  const disabledDate = (current) => {
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

    const getOriginFile = (fileList) => {
        if (fileList && fileList.length > 0 && fileList[0].originFileObj) {
            return fileList[0].originFileObj;
        }
        return null;
    };

    const newDesktopFile = getOriginFile(desktopFileList);
    if (newDesktopFile) {
      formData.append('desktopImage', newDesktopFile);
    } else if (!isEditing && desktopFileList.length === 0) {
      return toast.error('Vui lòng chọn ảnh Desktop!');
    }

    const newMobileFile = getOriginFile(mobileFileList);
    if (newMobileFile) {
      formData.append('mobileImage', newMobileFile);
    }

    onSubmit(formData);
  };

  const uploadButton = (label) => (
    <div className="flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 transition-colors">
      <PlusOutlined className="text-xl mb-1" />
      <div className="text-xs font-semibold">{label}</div>
    </div>
  );

  return (
    <Modal
      title={<div className="text-lg font-bold text-gray-800 uppercase tracking-wide pb-2 border-b border-gray-100">{isEditing ? 'Sửa Banner' : 'Thêm Banner Mới'}</div>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={640}
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4 space-y-3">
        
        <Form.Item name="title" label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Tên chiến dịch</span>} rules={[{ required: true, message: 'Vui lòng nhập tên chiến dịch!' }]}>
          <Input placeholder="VD: Siêu Sale iPhone 17 Pro Max" className="rounded-md h-9 text-sm" />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <Form.Item name="placement" label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Vị trí hiển thị</span>} rules={[{ required: true, message: 'Vui lòng chọn vị trí hiển thị!' }]}>
            <Select options={PLACEMENT_OPTIONS} placeholder="Chọn vị trí..." className="h-9 text-sm rounded-md" />
          </Form.Item>
          
          <Form.Item name="targetUrl" label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Đường dẫn đích (Target URL)</span>} rules={[{ pattern: /^(https?:\/\/.*)?$/, message: 'Đường dẫn phải bắt đầu bằng http:// hoặc https://' }]}>
            <Input placeholder="https://techstore.vn/products/..." className="rounded-md h-9 text-sm" />
          </Form.Item>
        </div>

        <div className="bg-gray-50/60 p-4 rounded-lg border border-gray-200/60">
            <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider m-0">Hình ảnh Banner</h4>
            <div className="flex flex-row gap-6">
                
                <div className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-semibold text-gray-500">
                        Ảnh Desktop <span className="text-red-500">*</span>
                    </span>
                    <Upload
                        listType="picture-card"
                        fileList={desktopFileList}
                        onChange={({ fileList }) => setDesktopFileList(fileList)}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/png, image/jpeg, image/webp"
                        className="[&_.ant-upload]:!w-24 [&_.ant-upload]:!h-24 [&_.ant-upload-list-item-container]:!w-24 [&_.ant-upload-list-item-container]:!h-24 m-0"
                    >
                        {desktopFileList.length >= 1 ? null : uploadButton("Tải ảnh lên")}
                    </Upload>
                    <span className="text-[10px] text-gray-400 font-medium">Khuyên dùng tỷ lệ 21:8</span>
                </div>

                 <div className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-semibold text-gray-500">
                        Ảnh Mobile <Tooltip title="Hiển thị trên màn hình nhỏ. Nếu trống sẽ dùng ảnh Desktop.">(Tùy chọn)</Tooltip>
                    </span>
                    <Upload
                        listType="picture-card"
                        fileList={mobileFileList}
                        onChange={({ fileList }) => setMobileFileList(fileList)}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/png, image/jpeg, image/webp"
                        className="[&_.ant-upload]:!w-24 [&_.ant-upload]:!h-24 [&_.ant-upload-list-item-container]:!w-24 [&_.ant-upload-list-item-container]:!h-24 m-0"
                    >
                        {mobileFileList.length >= 1 ? null : uploadButton("Tải ảnh lên")}
                    </Upload>
                    <span className="text-[10px] text-gray-400 font-medium">Khuyên dùng tỷ lệ 1:1</span>
                </div>

            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name="dateRange" label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Thời gian diễn ra</span>} className="col-span-2">
            <RangePicker 
                showTime 
                className="w-full rounded-md h-9 text-sm" 
                format="DD/MM/YYYY HH:mm" 
                placeholder={['Bắt đầu', 'Kết thúc']} 
                disabledDate={disabledDate}
            />
          </Form.Item>

          <Form.Item name="sortOrder" label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Độ ưu tiên</span>}>
            <InputNumber min={0} className="w-full rounded-md h-9 text-sm" placeholder="0" />
          </Form.Item>
        </div>

        <Form.Item name="isActive" label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Trạng thái hiển thị</span>} valuePropName="checked" className="pt-1">
          <Switch checkedChildren="Bật" unCheckedChildren="Ẩn" className="bg-gray-300" />
        </Form.Item>
        
        <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isPending} type="button" className="h-9 px-5 text-xs font-bold uppercase tracking-wide">
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" loading={isPending} className="h-9 px-6 text-xs font-bold uppercase tracking-wide bg-blue-600 text-white hover:bg-blue-700 rounded-md">
            {isEditing ? 'Lưu thay đổi' : 'Thêm Banner'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}