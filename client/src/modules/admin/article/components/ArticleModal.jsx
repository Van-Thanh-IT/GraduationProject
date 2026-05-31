// File: src/modules/admin/articles/components/ArticleModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Upload, Spin } from 'antd';
import { PlusOutlined, PictureOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css'; // Import giao diện thanh công cụ chuẩn
import { toast } from 'react-toastify';

const STATUS_OPTIONS = [
  { label: 'Xuất bản (PUBLISHED)', value: 'PUBLISHED' },
  { label: 'Bản nháp (DRAFT)', value: 'DRAFT' },
  { label: 'Đã ẩn (HIDDEN)', value: 'HIDDEN' },
];

// Cấu hình các nút bấm trên thanh công cụ soạn thảo (Chuẩn tòa soạn báo)
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link', 'image', 'clean'],
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet', 'align', 'link', 'image'
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
        form.setFieldsValue({ status: 'PUBLISHED', content: '' });
        setFileList([]);
      }
    }
  }, [isOpen, initialData, form, isEditing]);

  useEffect(() => {
    if (backendError) {
      if (backendError.messages && backendError.messages !== "Validation failed") {
        toast.error(backendError.messages);
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
    // Chặn trường hợp người dùng chỉ gõ vài dấu cách hoặc thẻ HTML rỗng trong trình soạn thảo
    const cleanContent = values.content ? values.content.replace(/<(.|\n)*?>/g, '').trim() : '';
    if (!cleanContent) {
      return toast.error('Nội dung chi tiết bài viết không được để trống!');
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('content', values.content); // Chuỗi HTML đã định dạng sẽ được gửi thẳng lên Java lưu vào DB
    formData.append('status', values.status);
    if (values.shortDescription) formData.append('shortDescription', values.shortDescription);
    if (values.authorName) formData.append('authorName', values.authorName);

    const newFile = fileList.length > 0 && fileList[0].originFileObj ? fileList[0].originFileObj : null;
    if (newFile) {
      formData.append('thumbnail', newFile);
    } else if (!isEditing && fileList.length === 0) {
      return toast.error('Vui lòng chọn ảnh bìa cho bài viết!');
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
        <div className="text-sm font-bold text-gray-800 uppercase tracking-wide pb-2 border-b border-gray-100">
          {isEditing ? 'Cập nhật bài viết' : 'Khởi tạo bài viết mới'}
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose
      centered
    >
      <Spin spinning={isPending} tip="Đang xử lý dữ liệu...">
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleFinish} 
          className="mt-3 font-sans"
          requiredMark={false}
        >
          {/* TIÊM ÉP CSS PHẲNG ĐỂ BIẾN KHUNG SOẠN THẢO QUICK-QUILL HOÀN HẢO VỚI ANT DESIGN */}
          <style dangerouslySetInnerHTML={{__html: `
            .ql-container.ql-snow { border-bottom-left-radius: 6px !important; border-bottom-right-radius: 6px !important; border-color: #e5e7eb !important; font-family: inherit !important; font-size: 13px !important; min-height: 260px !important; max-height: 400px !important; overflow-y: auto !important; }
            .ql-toolbar.ql-snow { border-top-left-radius: 6px !important; border-top-right-radius: 6px !important; border-color: #e5e7eb !important; background-color: #f9fafb !important; }
            .ant-form-item-has-error .ql-toolbar.ql-snow, .ant-form-item-has-error .ql-container.ql-snow { border-color: #ff4d4f !important; }
          `}} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            
            <div className="lg:col-span-2 space-y-3.5">
              <Form.Item 
                name="title" 
                label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tiêu đề bài viết *</span>} 
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                className="m-0"
              >
                <Input placeholder="Nhập tiêu đề hiển thị..." className="h-9 rounded-md text-xs font-medium" />
              </Form.Item>

              <Form.Item 
                name="shortDescription" 
                label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mô tả ngắn (Sapo)</span>}
                className="m-0"
              >
                <Input.TextArea 
                  placeholder="Đoạn văn ngắn tóm tắt nội dung thu hút người đọc..." 
                  rows={2} 
                  className="rounded-md text-xs resize-none" 
                  maxLength={300} 
                  showCount 
                />
              </Form.Item>

              {/* Ô SOẠN THẢO WORD/HTML CAO CẤP */}
              <Form.Item 
                name="content" 
                label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nội dung chi tiết bài viết *</span>} 
                trigger="onChange"
                validateTrigger="onBlur"
                className="m-0"
              >
                <ReactQuill
                  theme="snow"
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder="Bắt đầu viết nội dung chi tiết bài viết tại đây (Hỗ trợ chèn link, ảnh, định dạng chữ)..."
                />
              </Form.Item>
            </div>

            <div className="lg:col-span-1 space-y-3.5">
              
              <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-200/80">
                <h4 className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5 uppercase tracking-wide m-0">
                  <PictureOutlined className="text-blue-500" /> Ảnh bìa bài viết *
                </h4>
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                  className="w-full [&_.ant-upload]:!w-full [&_.ant-upload]:!h-28 [&_.ant-upload-list-item-container]:!w-full [&_.ant-upload-list-item-container]:!h-28 m-0"
                >
                  {fileList.length >= 1 ? null : uploadButton}
                </Upload>
                <span className="text-[10px] text-gray-400 mt-2 block italic font-medium">Định dạng hình chữ nhật tỷ lệ chuẩn 16:9 (Max 2MB)</span>
              </div>

              <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-200/80 space-y-3">
                <Form.Item 
                  name="status" 
                  label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Trạng thái hiển thị</span>} 
                  rules={[{ required: true }]}
                  className="m-0"
                >
                  <Select options={STATUS_OPTIONS} className="h-9 text-xs [&_.ant-select-selector]:!rounded-md" />
                </Form.Item>

                <Form.Item 
                  name="authorName" 
                  label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tên tác giả / Nguồn</span>}
                  className="m-0"
                >
                  <Input placeholder="VD: Ban Biên Tập" className="h-9 rounded-md text-xs" />
                </Form.Item>
              </div>

            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-4">
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
              className="h-9 px-6 rounded-md font-bold text-xs uppercase tracking-wide text-white bg-blue-600 hover:bg-blue-700 border-none"
            >
              {isEditing ? 'Lưu thay đổi' : 'Đăng bài viết'}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
}