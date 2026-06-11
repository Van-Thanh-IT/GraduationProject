import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, Upload, Spin } from 'antd';
import { Camera, Mail, Phone, User, KeyRound, CalendarDays, ShieldAlert } from 'lucide-react';
import dayjs from 'dayjs';

import { useGetProfile, useUpdateProfile } from '@/hooks/useProfile';
import { toast } from 'react-toastify';
import SEO from '@/components/SEO';

const { Option } = Select;

export default function AdminSettings() {
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { data: profile, isLoading } = useGetProfile();
  const { mutate: updateProfile, isLoading: isUpdating } = useUpdateProfile();

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        username: profile.username,
        email: profile.email,
        phone: profile.phone,
        gender: profile.gender || 'OTHER',
        dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
      });
      setPreviewImage(profile.avatar);
    }
  }, [profile, form]);

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      toast.error('Chỉ hỗ trợ định dạng hình ảnh!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      toast.error('Hình ảnh phải nhỏ hơn 2MB!');
      return Upload.LIST_IGNORE;
    }
    
    setAvatarFile(file);
    setPreviewImage(URL.createObjectURL(file));
    return false; 
  };

  const onFinish = (values) => {
    const formData = new FormData();
    
    formData.append('username', values.username);
    formData.append('email', values.email || profile.email); 
    formData.append('phone', values.phone);
    formData.append('gender', values.gender);
    formData.append('password', values.password || "");
    formData.append('confirmPassword', values.confirmPassword || "");
    
    if (values.dateOfBirth) {
      formData.append('dateOfBirth', values.dateOfBirth.format('YYYY-MM-DD'));
    }

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    updateProfile(
      { userId: profile.id, formData }, 
      {
        onSuccess: () => {
          toast.success('Cập nhật thông tin quản trị thành công!');
          form.setFieldValue('password', '');
          form.setFieldValue('confirmPassword', '');
        },
        onError: (error) => {
          toast.error(error.response?.data?.messages || 'Có lỗi xảy ra, vui lòng thử lại!');
        }
      }
    );
  };

  if (isLoading) return <div className="min-h-[80vh] flex items-center justify-center"><Spin size="large" /></div>;

  return (
    <>
      <SEO title='Cài đặt' noIndex/>

      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Cài đặt Tài khoản</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin định danh và bảo mật của Quản trị viên.</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <div className="flex flex-col gap-8">
            
            {/* KHỐI 1: ẢNH ĐẠI DIỆN */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
              <div className="relative group cursor-pointer shrink-0">
                <Upload name="avatar" showUploadList={false} beforeUpload={handleBeforeUpload}>
                  <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden relative bg-gray-50">
                    {previewImage ? (
                      <img src={previewImage} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <User size={36} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={20} />
                    </div>
                  </div>
                </Upload>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Ảnh đại diện</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  Ảnh đại diện giúp các thành viên khác trong hệ thống dễ dàng nhận diện bạn. Hỗ trợ định dạng JPG, PNG. Tối đa 2MB.
                </p>
              </div>
            </div>

            {/* KHỐI 2: THÔNG TIN CÁ NHÂN */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-800">Thông tin cơ bản</h3>
              </div>
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <Form.Item
                  name="username"
                  label={<span className="font-semibold text-gray-600 text-sm">Họ và tên</span>}
                  rules={[
                    { required: true, message: 'Không được để trống!' },
                    { min: 8, max: 30, message: 'Từ 8 - 30 ký tự!' },
                    { pattern: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Chỉ chứa chữ cái!' }
                  ]}
                >
                  <Input prefix={<User className="text-gray-400 mr-2" size={16} />} size="large" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={<span className="font-semibold text-gray-600 text-sm">Email (Cố định)</span>}
                >
                  <Input disabled prefix={<Mail className="text-gray-400 mr-2" size={16} />} size="large" className="rounded-lg bg-gray-50 text-gray-500 font-medium" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label={<span className="font-semibold text-gray-600 text-sm">Số điện thoại</span>}
                  rules={[
                    { required: true, message: 'Không được để trống!' },
                    { pattern: /^(0[0-9]{9,10})$/, message: 'SĐT không hợp lệ!' }
                  ]}
                >
                  <Input prefix={<Phone className="text-gray-400 mr-2" size={16} />} size="large" className="rounded-lg" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="dateOfBirth" label={<span className="font-semibold text-gray-600 text-sm">Ngày sinh</span>}>
                    <DatePicker format="DD/MM/YYYY" size="large" className="w-full rounded-lg" suffixIcon={<CalendarDays className="text-gray-400" size={16} />} />
                  </Form.Item>

                  <Form.Item name="gender" label={<span className="font-semibold text-gray-600 text-sm">Giới tính</span>}>
                    <Select size="large" className="rounded-lg">
                      <Option value="MALE">Nam</Option>
                      <Option value="FEMALE">Nữ</Option>
                      <Option value="OTHER">Khác</Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* KHỐI 3: BẢO MẬT */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-500" />
                <h3 className="text-base font-bold text-gray-800">Bảo mật tài khoản</h3>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-sm text-gray-500 mb-6 italic">Bỏ trống các ô bên dưới nếu bạn không muốn thay đổi mật khẩu.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <Form.Item
                    name="password"
                    label={<span className="font-semibold text-gray-600 text-sm">Mật khẩu mới</span>}
                    rules={[{ min: 8, message: 'Ít nhất 8 ký tự!' }]}
                  >
                    <Input.Password prefix={<KeyRound className="text-gray-400 mr-2" size={16} />} size="large" className="rounded-lg" placeholder="Nhập mật khẩu mới" />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label={<span className="font-semibold text-gray-600 text-sm">Xác nhận mật khẩu mới</span>}
                    dependencies={['password']}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const pass = getFieldValue('password');
                          if (pass && !value) return Promise.reject(new Error('Vui lòng xác nhận mật khẩu!'));
                          if (pass && pass !== value) return Promise.reject(new Error('Mật khẩu không khớp!'));
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <Input.Password prefix={<KeyRound className="text-gray-400 mr-2" size={16} />} size="large" className="rounded-lg" placeholder="Xác nhận lại" />
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* NÚT LƯU NẰM DƯỚI CÙNG HOẶC NỔI */}
            <div className="flex justify-end pt-4 pb-10">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 h-11 px-8 rounded-lg font-bold text-sm shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5"
              >
                Lưu cấu hình
              </Button>
            </div>

          </div>
        </Form>
      </div>
    </>
  );
}