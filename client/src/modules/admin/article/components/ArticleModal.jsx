import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button'; // Custom Button của bạn

const STATUS_OPTIONS = [
  { label: 'Xuất bản (PUBLISHED)', value: 'PUBLISHED' },
  { label: 'Bản nháp (DRAFT)', value: 'DRAFT' },
  { label: 'Đã ẩn (HIDDEN)', value: 'HIDDEN' },
];

export default function ArticleModal({ isOpen, onClose, initialData, onSubmit, isPending }) {
  const [form] = Form.useForm();
  const isEditing = !!initialData;
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        form.setFieldsValue({
          title: initialData.title,
          shortDescription: initialData.shortDescription,
          authorName: initialData.authorName,
          content: initialData.content,
          status: initialData.status,
        });

        // Hiển thị ảnh cũ nếu có
        if (initialData.thumbnailUrl) {
          setFileList([{
            uid: '-1',
            name: 'thumbnail.png',
            status: 'done',
            url: initialData.thumbnailUrl,
          }]);
        } else {
          setFileList([]);
        }
      } else {
        form.resetFields();
        form.setFieldsValue({ status: 'PUBLISHED' }); // Mặc định là Published
        setFileList([]);
      }
    }
  }, [isOpen, initialData, form, isEditing]);

  const handleFinish = (values) => {
    const formData = new FormData();
    
    // Nạp dữ liệu Text
    formData.append('title', values.title);
    formData.append('content', values.content);
    formData.append('status', values.status);
    if (values.shortDescription) formData.append('shortDescription', values.shortDescription);
    if (values.authorName) formData.append('authorName', values.authorName);

    // Xử lý File ảnh bìa
    const newFile = fileList.length > 0 && fileList[0].originFileObj ? fileList[0].originFileObj : null;
    if (newFile) {
      formData.append('thumbnail', newFile);
    } else if (!isEditing && fileList.length === 0) {
      return message.error('Vui lòng chọn ảnh bìa cho bài viết!');
    }

    onSubmit(formData);
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center text-gray-500 hover:text-indigo-500 transition-colors">
      <PlusOutlined className="text-2xl mb-2" />
      <div className="text-sm font-medium">Tải ảnh lên</div>
    </div>
  );

  return (
    <Modal
      title={<div className="text-2xl font-black text-slate-800 tracking-tight pb-2 border-b border-gray-100">{isEditing ? 'Sửa Bài Viết' : 'Thêm Bài Viết Mới'}</div>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={900} // Form bài viết thường cần rộng hơn
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột trái: Ảnh và Trạng thái */}
          <div className="md:col-span-1 flex flex-col gap-5">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Ảnh bìa <span className="text-red-500">*</span></h4>
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                maxCount={1}
                accept="image/png, image/jpeg, image/webp"
                className="w-full"
              >
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
              <span className="text-xs text-gray-400 mt-2 block">Tỷ lệ khuyên dùng: 16:9</span>
            </div>

            <Form.Item name="status" label={<span className="font-semibold text-gray-700">Trạng thái</span>} rules={[{ required: true }]}>
              <Select options={STATUS_OPTIONS} size="large" className="rounded-lg" />
            </Form.Item>

            <Form.Item name="authorName" label={<span className="font-semibold text-gray-700">Tên Tác giả</span>}>
              <Input placeholder="VD: Admin, Nhóm Nội Dung..." size="large" className="rounded-lg" />
            </Form.Item>
          </div>

          {/* Cột phải: Nội dung bài viết */}
          <div className="md:col-span-2 flex flex-col gap-1">
            <Form.Item name="title" label={<span className="font-semibold text-gray-700">Tiêu đề bài viết</span>} rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
              <Input placeholder="Nhập tiêu đề hấp dẫn..." size="large" className="rounded-lg font-medium" />
            </Form.Item>

            <Form.Item name="shortDescription" label={<span className="font-semibold text-gray-700">Mô tả ngắn (Sapo)</span>}>
              <Input.TextArea placeholder="Đoạn văn ngắn xuất hiện ở trang danh sách..." rows={3} className="rounded-lg" maxLength={500} showCount />
            </Form.Item>

            <Form.Item name="content" label={<span className="font-semibold text-gray-700">Nội dung chi tiết (HTML)</span>} rules={[{ required: true, message: 'Nội dung không được để trống!' }]}>
              {/* LƯU Ý: Ở dự án thực tế, hãy thay Input.TextArea bằng thư viện Rich Text Editor (ví dụ: react-quill) */}
              <Input.TextArea placeholder="Nhập nội dung bài viết ở đây..." rows={12} className="rounded-lg font-mono text-sm bg-slate-50" />
            </Form.Item>
          </div>
        </div>
        
        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} disabled={isPending} type="button" className="px-6">Hủy bỏ</Button>
          <Button type="submit" variant="primary" loading={isPending} className="px-8 shadow-md">
            {isEditing ? 'Lưu thay đổi' : 'Đăng bài viết'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}