// File: src/pages/Profile/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { Form, Upload, Spin } from 'antd';
import dayjs from 'dayjs';

import { useGetProfile, useUpdateProfile } from '@/hooks/useProfile';
import ProfileSidebar from './components/ProfileSidebar';
import ProfileForm from './components/ProfileForm';
import { toast } from 'react-toastify';

export default function UserProfile() {
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch Data
  const { data: profile, isLoading } = useGetProfile();
  const { mutate: updateProfile, isLoading: isUpdating } = useUpdateProfile();

  // Đổ dữ liệu vào Form
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

  // Xử lý trước khi upload
  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      toast.error('Bạn chỉ có thể tải lên file hình ảnh!');
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

  // Submit Form
  const onFinish = (values) => {
    const formData = new FormData();
    
    formData.append('username', values.username);
    formData.append('email', values.email || profile.email); 
    formData.append('phone', values.phone);
    formData.append('gender', values.gender);
    
    // Gửi password: nếu không nhập thì gửi chuỗi rỗng để thỏa mãn Backend
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
          toast.success('Cập nhật thông tin cá nhân thành công!');
          form.setFieldValue('password', '');
          form.setFieldValue('confirmPassword', '');
        },
        onError: (error) => {
          toast.error(error.response?.data?.messages || 'Có lỗi xảy ra, vui lòng thử lại!');
        }
      }
    );
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-gray-500 font-medium mt-1">Quản lý thông tin bảo mật và định danh của bạn</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* CỘT TRÁI */}
        <div className="w-full lg:w-1/3">
          <ProfileSidebar 
            profile={profile} 
            previewImage={previewImage} 
            handleBeforeUpload={handleBeforeUpload} 
          />
        </div>

        {/* CỘT PHẢI */}
        <div className="w-full lg:w-2/3">
          <ProfileForm 
            form={form} 
            onFinish={onFinish} 
            isUpdating={isUpdating} 
          />
        </div>
      </div>
    </div>
  );
}