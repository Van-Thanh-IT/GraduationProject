// File: src/modules/admin/articles/components/ArticleModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Upload, message, Spin } from 'antd';
import { PlusOutlined, PictureOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';

const STATUS_OPTIONS = [
  { label: 'Xuất bản (PUBLISHED)', value: 'PUBLISHED' },
  { label: 'Bản nháp (DRAFT)', value: 'DRAFT' },
  { label: 'Đã ẩn (HIDDEN)', value: 'HIDDEN' },
];

export default function ArticleModal({ isOpen, onClose, initialData, onSubmit, isPending, backendError }) {
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
        form.setFieldsValue({ status: 'PUBLISHED' });
        setFileList([]);
      }
    }
  }, [isOpen, initialData, form, isEditing]);

  useEffect(() => {
    if (backendError) {
      if (backendError.messages && backendError.messages !== "Validation failed") {
        message.error(backendError.messages);
      }
      if (backendError.errors) {
        const formFieldsError = Object.keys(backendError.errors).map((key) => ({
          name: key,
          errors: [backendError.errors[key]],
        }));
        form.setFields(formFieldsError);
      }
    }
  }, [backendError, form]);

  const handleFinish = (values) => {
    const formData = new FormData();
    
    formData.append('title', values.title);
    formData.append('content', values.content);
    formData.append('status', values.status);
    if (values.shortDescription) formData.append('shortDescription', values.shortDescription);
    if (values.authorName) formData.append('authorName', values.authorName);

    const newFile = fileList.length > 0 && fileList[0].originFileObj ? fileList[0].originFileObj : null;
    if (newFile) {
      formData.append('thumbnail', newFile);
    } else if (!isEditing && fileList.length === 0) {
      return message.error('Vui lòng chọn ảnh bìa cho bài viết!');
    }

    onSubmit(formData);
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-colors w-full h-full py-4">
      <PlusOutlined className="text-xl mb-1" />
      <div className="text-xs font-semibold">Tải ảnh lên</div>
    </div>
  );

  return (
    <Modal
      title={
        <div className="text-base font-bold text-gray-800 uppercase tracking-wide pb-2 border-b border-gray-100">
          {isEditing ? 'Sửa Bài Viết' : 'Thêm Bài Viết Mới'}
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={960}
      destroyOnClose
      centered
    >
      <Spin spinning={isPending} tip="Đang xử lý dữ liệu...">
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleFinish} 
          className="mt-4"
          requiredMark={false}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            
            <div className="lg:col-span-2 space-y-3.5">
              <Form.Item 
                name="title" 
                label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Tiêu đề bài viết <span className="text-red-500">*</span></span>} 
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
              >
                <Input placeholder="Nhập tiêu đề..." className="h-9 rounded-md text-sm font-medium" />
              </Form.Item>

              <Form.Item 
                name="shortDescription" 
                label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Mô tả ngắn (Sapo)</span>}
              >
                <Input.TextArea 
                  placeholder="Đoạn văn ngắn tóm tắt nội dung..." 
                  rows={2} 
                  className="rounded-md text-sm resize-none" 
                  maxLength={500} 
                  showCount 
                />
              </Form.Item>

              <Form.Item 
                name="content" 
                label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Nội dung chi tiết <span className="text-red-500">*</span></span>} 
                rules={[{ required: true, message: 'Nội dung không được để trống!' }]}
              >
                <Input.TextArea 
                  placeholder="Nhập nội dung bài viết..." 
                  rows={10} 
                  className="rounded-md font-sans text-sm bg-gray-50/50 resize-none" 
                />
              </Form.Item>
            </div>

            <div className="lg:col-span-1 space-y-4">
              
              <div className="bg-gray-50/60 p-3.5 rounded-lg border border-gray-200/60">
                <h4 className="text-xs font-bold text-gray-600 mb-2.5 flex items-center gap-1.5 uppercase tracking-wide m-0">
                  <PictureOutlined className="text-gray-400" /> Ảnh bìa bài viết <span className="text-red-500">*</span>
                </h4>
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                  className="w-full [&_.ant-upload]:!w-full [&_.ant-upload]:!h-32 [&_.ant-upload-list-item-container]:!w-full [&_.ant-upload-list-item-container]:!h-32 m-0"
                >
                  {fileList.length >= 1 ? null : uploadButton}
                </Upload>
                <span className="text-[10px] text-gray-400 mt-1.5 block italic font-medium">Khuyên dùng ảnh tỷ lệ chữ nhật 16:9</span>
              </div>

              <div className="bg-gray-50/60 p-3.5 rounded-lg border border-gray-200/60 space-y-3">
                <Form.Item 
                  name="status" 
                  label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Trạng thái hiển thị</span>} 
                  rules={[{ required: true }]}
                  className="m-0"
                >
                  <Select options={STATUS_OPTIONS} className="h-9 text-sm" />
                </Form.Item>

                <Form.Item 
                  name="authorName" 
                  label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Tên tác giả</span>}
                  className="m-0"
                >
                  <Input placeholder="VD: Ban Biên Tập" className="h-9 rounded-md text-sm" />
                </Form.Item>
              </div>

            </div>
          </div>
          
          <div className="flex justify-end items-center gap-2 mt-5 pt-3 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isPending} 
              className="h-9 px-5 rounded-md font-bold text-xs uppercase tracking-wide text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors border-none cursor-pointer"
            >
              Hủy bỏ
            </button>
            
            <Button 
              type="submit" 
              loading={isPending} 
              className="h-9 px-6 rounded-md font-bold text-xs uppercase tracking-wide text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Lưu thay đổi' : 'Đăng bài viết'}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
}