// File: src/modules/client/auth/components/Register.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuthMutations } from "@/hooks/useAuthMutations";

const Register = () => {
  const { register } = useAuthMutations();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    register.mutate(formData);
  };

  const errorMessage = register.error?.response?.data?.messages;

  return (
    <form onSubmit={onSubmit} className="w-full font-sans">
      
      {/* TIÊU ĐỀ BIỂU MẪU */}
      <div className="text-center mb-5">
        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide m-0">Đăng ký</h2>
        <p className="text-gray-400 text-xs mt-1">Tạo tài khoản thành viên Tech Store</p>
      </div>

      {/* THÔNG BÁO LỖI PHẲNG */}
      {register.isError && (
        <div className="mb-4 p-2.5 bg-red-50 border border-red-100 text-red-500 rounded-md text-xs text-center font-medium">
          {errorMessage || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!"}
        </div>
      )}

      {/* KHU VỰC CÁC Ô NHẬP LIỆU PHẲNG */}
      <div className="space-y-3.5">
        {/* Username */}
        <Input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Họ và tên (Tối thiểu 8 ký tự)"
          required
          minLength={8}
          maxLength={30}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none transition-colors focus:bg-white focus:border-gray-400 text-gray-800 placeholder-gray-400 font-medium"
        />

        {/* Email */}
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Địa chỉ Email"
          required
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none transition-colors focus:bg-white focus:border-gray-400 text-gray-800 placeholder-gray-400 font-medium"
        />

        {/* Phone */}
        <Input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Số điện thoại"
          required
          pattern="^(0[0-9]{9,10})$"
          title="Số điện thoại phải bắt đầu bằng số 0 và có 10-11 số"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none transition-colors focus:bg-white focus:border-gray-400 text-gray-800 placeholder-gray-400 font-medium"
        />

        {/* Password */}
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Mật khẩu (Tối thiểu 8 ký tự)"
          required
          minLength={8}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none transition-colors focus:bg-white focus:border-gray-400 text-gray-800 placeholder-gray-400 font-medium"
        />

        {/* Confirm Password */}
        <Input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Xác nhận mật khẩu"
          required
          minLength={8}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none transition-colors focus:bg-white focus:border-gray-400 text-gray-800 placeholder-gray-400 font-medium"
        />

        {/* NÚT HOÀN TẤT ĐĂNG KÝ (ĐỒNG BỘ MÀU HỒNG CAM PHẲNG CỦA HỘP AUTH) */}
        <Button
          type="submit"
          loading={register.isPending} 
          className="w-full h-10 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-md transition-colors border-none mt-2 uppercase tracking-wider"
        >
          {register.isPending ? "Đang xử lý..." : "Hoàn Tất Đăng Ký"}
        </Button>
      </div>

      {/* ĐIỀU HƯỚNG DƯỚI CÙNG KHÍT KHAO */}
      <div className="mt-5 text-center text-xs font-semibold px-1">
        <span className="text-gray-400">Đã có tài khoản? </span>
        <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors no-underline">
          Đăng nhập ngay
        </Link>
      </div>

    </form>
  );
};

export default Register;