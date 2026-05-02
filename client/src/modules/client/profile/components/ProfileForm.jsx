import React from 'react';
import { Form, Input, Button, Select, DatePicker } from 'antd';
import { Mail, Phone, User, KeyRound, CalendarDays } from 'lucide-react';

const { Option } = Select;

export default function ProfileForm({ form, onFinish, isUpdating }) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="custom-profile-form"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Thông tin cơ bản</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Form.Item
            name="username"
            label={<span className="font-semibold text-gray-600">Họ và tên</span>}
            rules={[
              { required: true, message: 'Họ và tên không được để trống!' },
              { min: 8, max: 30, message: 'Họ tên phải từ 8 - 30 ký tự!' },
              { pattern: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Họ tên chỉ được chứa chữ cái và khoảng trắng!' }
            ]}
          >
            <Input prefix={<User className="text-gray-400 mr-1" size={16} />} size="large" className="rounded-xl" placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="phone"
            label={<span className="font-semibold text-gray-600">Số điện thoại</span>}
            rules={[
              { required: true, message: 'Số điện thoại không được để trống!' },
              { pattern: /^(0[0-9]{9,10})$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input prefix={<Phone className="text-gray-400 mr-1" size={16} />} size="large" className="rounded-xl" placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="font-semibold text-gray-600">Địa chỉ Email</span>}
          >
            <Input 
              disabled 
              prefix={<Mail className="text-gray-400 mr-1" size={16} />} 
              size="large" 
              className="rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" 
            />
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            label={<span className="font-semibold text-gray-600">Ngày sinh</span>}
          >
            <DatePicker 
              format="DD/MM/YYYY" 
              size="large" 
              className="w-full rounded-xl" 
              placeholder="Chọn ngày sinh"
              suffixIcon={<CalendarDays className="text-gray-400" size={16} />}
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label={<span className="font-semibold text-gray-600">Giới tính</span>}
          >
            <Select size="large" className="rounded-xl">
              <Option value="MALE">Nam</Option>
              <Option value="FEMALE">Nữ</Option>
              <Option value="OTHER">Khác</Option>
            </Select>
          </Form.Item>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-6 mt-4 border-b border-gray-100 pb-3">
          Đổi mật khẩu <span className="text-sm font-normal text-gray-500">(Bỏ trống nếu không muốn đổi)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Form.Item
            name="password"
            label={<span className="font-semibold text-gray-600">Mật khẩu mới</span>}
            rules={[
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
            ]}
          >
            <Input.Password prefix={<KeyRound className="text-gray-400 mr-1" size={16} />} size="large" className="rounded-xl" placeholder="Nhập mật khẩu mới (Tùy chọn)" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<span className="font-semibold text-gray-600">Xác nhận mật khẩu mới</span>}
            dependencies={['password']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const pass = getFieldValue('password');
                  // Nếu có nhập pass mới mà bỏ trống xác nhận
                  if (pass && !value) {
                    return Promise.reject(new Error('Vui lòng xác nhận lại mật khẩu mới!'));
                  }
                  // Nếu có nhập cả 2 nhưng không khớp
                  if (pass && pass !== value) {
                    return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password prefix={<KeyRound className="text-gray-400 mr-1" size={16} />} size="large" className="rounded-xl" placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>
        </div>

        <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isUpdating}
            className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl font-bold text-[15px] shadow-md shadow-indigo-200"
          >
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </div>
  );
}