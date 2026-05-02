import React, { useState } from 'react';
import { message, Select, Divider, Upload, Spin } from 'antd';
import { UserOutlined, SafetyCertificateOutlined, PlusOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCreateStaff } from '@/hooks/useUsers';

export default function AddStaffForm({ onSuccess, onCancel }) {
  // 1. Sử dụng Hook React Query
  const { mutate: createStaff, isPending } = useCreateStaff();
  
  // 2. State
  const [formData, setFormData] = useState({
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: '', 
    gender: 'MALE', 
    dateOfBirth: '',
    avatar: null 
  });
  const [fileList, setFileList] = useState([]);

  // 3. Handlers
  const handleAvatarChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      setFormData({ ...formData, avatar: newFileList[0].originFileObj });
    } else {
      setFormData({ ...formData, avatar: null });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 4. Submit & Validation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate Frontend
    if (formData.password !== formData.confirmPassword) {
      return message.error("Mật khẩu xác nhận không khớp!");
    }
    if (formData.phone && !/^(0[0-9]{9,10})$/.test(formData.phone)) {
      return message.error("Số điện thoại không hợp lệ!");
    }

    // Submit Backend qua React Query
    createStaff(formData, {
      onSuccess: () => {
        message.success("Tạo nhân viên thành công!");
        onSuccess(); // Đóng Modal và refresh list được xử lý ở component cha
      },
      onError: (error) => {
        const errData = error.response?.data;
        
        // Bắt lỗi Validation (mảng lỗi)
        if (errData?.errors && Array.isArray(errData.errors)) {
          errData.errors.forEach(err => message.error(`Lỗi: ${err.defaultMessage || err.message}`));
          return;
        }
        
        // Lỗi message chung
        const finalMsg = errData?.messages || errData?.message || errData?.error || "Tạo nhân viên thất bại!";
        message.error(finalMsg);
      }
    });
  };

  return (
    <div className="relative mt-2">
      {/* Lớp phủ Loading khi đang call API */}
      {isPending && (
        <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
          <Spin tip="Đang tạo tài khoản..." size="large" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* ================= CỘT TRÁI ================= */}
          <div className="flex flex-col gap-5">
            
            {/* Block Upload Avatar */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center transition-all hover:border-blue-200">
              <Upload
                listType="picture-circle"
                fileList={fileList}
                onChange={handleAvatarChange}
                beforeUpload={() => false} // Chặn auto upload của Antd
                maxCount={1} 
                accept="image/png, image/jpeg, image/jpg"
                disabled={isPending}
                className="avatar-uploader-premium"
              >
                {fileList.length >= 1 ? null : (
                  <div className="flex flex-col items-center text-slate-400 hover:text-blue-500 transition-colors">
                    <PlusOutlined className="text-2xl mb-2" />
                    <div className="text-xs font-semibold uppercase tracking-wider">Tải ảnh lên</div>
                  </div>
                )}
              </Upload>
              <p className="text-[11px] text-slate-400 mt-3 font-medium">Định dạng JPG, PNG (Max: 5MB)</p>
            </div>

            {/* Block Tài Khoản */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm flex-1">
              <h3 className="text-sm font-black text-blue-600 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <div className="p-1.5 bg-blue-100 rounded-lg"><SafetyCertificateOutlined className="text-lg" /></div>
                Tài khoản bảo mật
              </h3>
              
              <div className="space-y-4">
                <Input 
                  label="Địa chỉ Email" 
                  type="email" 
                  name="email"
                  placeholder="VD: nguyenvan@gmail.com"
                  required 
                  disabled={isPending}
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className="h-11 rounded-xl focus:ring-2 focus:ring-blue-100"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Mật khẩu" 
                    type="password" 
                    name="password"
                    placeholder="Từ 8 ký tự"
                    required 
                    disabled={isPending}
                    value={formData.password} 
                    onChange={handleInputChange} 
                    className="h-11 rounded-xl focus:ring-2 focus:ring-blue-100"
                  />
                  <Input 
                    label="Xác nhận MK" 
                    type="password" 
                    name="confirmPassword"
                    placeholder="Nhập lại MK"
                    required 
                    disabled={isPending}
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
                    className="h-11 rounded-xl focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ================= CỘT PHẢI ================= */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm h-full">
            <h3 className="text-sm font-black text-blue-600 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <div className="p-1.5 bg-blue-100 rounded-lg"><UserOutlined className="text-lg" /></div> 
              Thông tin cá nhân
            </h3>
            
            <div className="space-y-4">
              <Input 
                label="Họ và tên nhân viên" 
                name="username"
                placeholder="Từ 8 - 30 ký tự, chỉ chứa chữ cái"
                required 
                disabled={isPending}
                value={formData.username} 
                onChange={handleInputChange} 
                className="h-11 rounded-xl focus:ring-2 focus:ring-blue-100"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Số điện thoại" 
                  name="phone"
                  placeholder="VD: 0912345678"
                  required 
                  disabled={isPending}
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  className="h-11 rounded-xl focus:ring-2 focus:ring-blue-100"
                />
                <Input 
                  label="Ngày sinh" 
                  type="date" 
                  name="dateOfBirth"
                  required 
                  disabled={isPending}
                  value={formData.dateOfBirth} 
                  onChange={handleInputChange} 
                  className="h-11 rounded-xl focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700">Giới tính</label>
                <Select
                  value={formData.gender}
                  disabled={isPending}
                  onChange={(value) => setFormData({...formData, gender: value})}
                  className="w-full h-11 custom-select-ui" 
                  options={[
                    { value: 'MALE', label: 'Nam giới' },
                    { value: 'FEMALE', label: 'Nữ giới' },
                    { value: 'OTHER', label: 'Khác' },
                  ]}
                />
              </div>
            </div>
          </div>

        </div>

        <Divider className="my-2 border-slate-200" />

        <div className="flex justify-end gap-3 pb-1">
          <Button 
            type="button"
            onClick={onCancel} 
            disabled={isPending}
            className="bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-600 px-6 py-2.5 font-bold transition-all disabled:opacity-50"
          >
            Hủy bỏ
          </Button>
          <Button 
            type="submit" 
            loading={isPending}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl shadow-lg shadow-blue-200 font-bold transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            Tạo nhân viên
          </Button>
        </div>

      </form>
    </div>
  );
}