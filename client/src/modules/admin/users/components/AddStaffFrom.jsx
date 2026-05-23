// File: src/modules/admin/users/components/AddStaffForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Select, Divider, Upload, Spin, message } from 'antd';
import { UserOutlined, SafetyCertificateOutlined, PlusOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCreateStaff } from '@/hooks/useUsers';

export default function AddStaffForm({ onSuccess, onCancel, backendError }) {
  const [form] = Form.useForm();
  const { mutate: createStaff, isPending } = useCreateStaff();
  const [fileList, setFileList] = useState([]);

  // LẮNG NGHE VÀ MAPPING LỖI TỪ BACKEND XUỐNG CHÂN INPUT VÀ TOAST
  useEffect(() => {
    if (backendError) {
      if (backendError.messages && backendError.messages !== "Validation failed") {
        message.error(backendError.messages);
      } else if (!backendError.errors && backendError.messages === "Validation failed") {
        message.error("Dữ liệu nhập vào không hợp lệ, vui lòng kiểm tra lại!");
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

  const handleAvatarChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleFinish = (values) => {
    if (values.password !== values.confirmPassword) {
      form.setFields([{ name: 'confirmPassword', errors: ['Mật khẩu xác nhận không khớp!'] }]);
      return;
    }

    const payload = {
      ...values,
      avatar: fileList.length > 0 && fileList[0].originFileObj ? fileList[0].originFileObj : null,
    };

    createStaff(payload, {
      onSuccess: () => {
        message.success("Tạo tài khoản nhân viên thành công!");
        onSuccess();
      },
      onError: (error) => {
        const errData = error.response?.data;
        if (errData?.messages && errData.messages !== "Validation failed") {
          message.error(errData.messages);
        }
        if (errData?.errors) {
          const formFieldsError = Object.keys(errData.errors).map((key) => ({
            name: key,
            errors: [errData.errors[key]],
          }));
          form.setFields(formFieldsError);
        }
      }
    });
  };

  return (
    <div className="relative font-sans">
      <Spin spinning={isPending} tip="Đang tạo tài khoản...">
        <Form 
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          initialValues={{ gender: 'MALE' }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2 items-start">
            
            {/* COLUMN BÊN TRÁI: AVATAR & BẢO MẬT */}
            <div className="space-y-3">
              <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                <Upload
                  listType="picture-circle"
                  fileList={fileList}
                  onChange={handleAvatarChange}
                  beforeUpload={() => false}
                  maxCount={1} 
                  accept="image/png, image/jpeg, image/jpg"
                  className="[&_.ant-upload]:!m-0"
                >
                  {fileList.length >= 1 ? null : (
                    <div className="flex flex-col items-center text-gray-400 hover:text-blue-500 transition-colors">
                      <PlusOutlined className="text-xl mb-1" />
                      <div className="text-[11px] font-bold uppercase tracking-wider">Tải ảnh</div>
                    </div>
                  )}
                </Upload>
                <span className="text-[10px] text-gray-400 mt-2 font-medium">Định dạng JPG, PNG (Tối đa 5MB)</span>
              </div>

              <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-200 space-y-3">
                <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5 uppercase tracking-wide m-0">
                  <SafetyCertificateOutlined className="text-blue-500" /> Tài khoản bảo mật
                </h3>
                
                <Form.Item name="email" rules={[{ required: true, message: 'Email không được để trống!' }, { type: 'email', message: 'Email không hợp lệ!' }]} className="m-0">
                  <Input label="Địa chỉ Email *" type="email" placeholder="VD: nguyenvan@gmail.com" className="h-9 text-xs rounded-md" />
                </Form.Item>
                
                <div className="grid grid-cols-2 gap-3">
                  <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]} className="m-0">
                    <Input label="Mật khẩu *" type="password" placeholder="Từ 8 ký tự" className="h-9 text-xs rounded-md" />
                  </Form.Item>
                  <Form.Item name="confirmPassword" rules={[{ required: true, message: 'Nhập lại mật khẩu!' }]} className="m-0">
                    <Input label="Xác nhận MK *" type="password" placeholder="Nhập lại MK" className="h-9 text-xs rounded-md" />
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* COLUMN BÊN PHẢI: THÔNG TIN CÁ NHÂN */}
            <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-200 space-y-3 h-full">
              <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5 uppercase tracking-wide m-0">
                <UserOutlined className="text-blue-500" /> Thông tin cá nhân
              </h3>
              
              <Form.Item name="username" rules={[{ required: true, message: 'Họ tên không được để trống!' }]} className="m-0">
                <Input label="Họ và tên nhân viên *" placeholder="Từ 8 - 30 ký tự, chỉ chứa chữ" className="h-9 text-xs rounded-md" />
              </Form.Item>
              
              <div className="grid grid-cols-2 gap-3">
                <Form.Item name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }, { pattern: /^(0[0-9]{9,10})$/, message: 'SĐT không hợp lệ!' }]} className="m-0">
                  <Input label="Số điện thoại *" placeholder="VD: 0912345678" className="h-9 text-xs rounded-md" />
                </Form.Item>
                <Form.Item name="dateOfBirth" rules={[{ required: true, message: 'Chọn ngày sinh!' }]} className="m-0">
                  <Input label="Ngày sinh *" type="date" className="h-9 text-xs rounded-md" />
                </Form.Item>
              </div>

              <Form.Item name="gender" label={<span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Giới tính</span>} className="m-0">
                <Select
                  className="w-full h-9 text-xs [&_.ant-select-selector]:!rounded-md" 
                  options={[
                    { value: 'MALE', label: 'Nam giới' },
                    { value: 'FEMALE', label: 'Nữ giới' },
                    { value: 'OTHER', label: 'Khác' },
                  ]}
                />
              </Form.Item>
            </div>

          </div>

          <Divider className="my-2 border-gray-100" />

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onCancel} disabled={isPending} type="button" className="h-9 px-5 text-xs font-bold uppercase tracking-wide">
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" loading={isPending} className="h-9 px-6 text-xs font-bold uppercase tracking-wide bg-blue-600 text-white hover:bg-blue-700 rounded-md">
              Tạo nhân viên
            </Button>
          </div>
        </Form>
      </Spin>
    </div>
  );
}