// File: src/modules/client/auth/components/Register.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuthMutations } from "@/hooks/useAuthMutations";
import { toast } from "react-toastify";
import SEO from "@/components/SEO";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const Register = () => {
  const { register } = useAuthMutations();
  const { 
    step, email, timeLeft, goBack, 
    submitForm, verifyOtp, resendOtp 
  } = register;

  // ============================
  // STATE
  // ============================
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [inputOtp, setInputOtp] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const isPending = submitForm.isPending || verifyOtp.isPending || resendOtp.isPending;
  const currentError = submitForm.error || verifyOtp.error || resendOtp.error;
  
  const errorData = currentError?.response?.data;
  const generalMessage = errorData?.messages || currentError?.messages;


  useEffect(() => {
    if (submitForm.isError) {
      const submitErrorData = submitForm.error?.response?.data;
      if (submitErrorData && submitErrorData.errors) {
        setFieldErrors(submitErrorData.errors);
      } else if (submitErrorData?.messages) {
        toast.error(submitErrorData.messages);
      }
    }
  }, [submitForm.isError, submitForm.error]);

  // ============================
  // HANDLERS
  // ============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const onRegisterSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Mật khẩu xác nhận không khớp!" });
      return;
    }
    setFieldErrors({});
    submitForm.mutate(formData);
  };

  const onVerifyOtpSubmit = (e) => {
    e.preventDefault();
    verifyOtp.mutate(inputOtp);
  };

  return (
    <>
      <SEO title="Đăng ký" noIndex />

      <div className="w-full font-sans">
        
        {/* TIÊU ĐỀ BIỂU MẪU */}
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide m-0">Đăng ký</h2>
          <p className="text-gray-400 text-xs mt-1.5 leading-normal">
            {step === 1 && "Tạo tài khoản thành viên Tech Store"}
            {step === 2 && `Mã xác thực đã được gửi đến ${email}`}
          </p>
        </div>

        {/* THÔNG BÁO LỖI CHUNG */}
        {currentError && generalMessage && generalMessage !== "Validation failed" && !errorData?.errors && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-100 text-red-500 rounded-md text-xs text-center font-medium">
            {generalMessage}
          </div>
        )}

        {/* ========================================================= */}
        {/* BƯỚC 1: FORM ĐĂNG KÝ */}
        {/* ========================================================= */}
        {step === 1 && (
          <form onSubmit={onRegisterSubmit} className="space-y-3.5">
            {/* Username */}
            <div>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Họ và tên"
                className={`w-full px-3 py-2 bg-gray-50 border rounded-md text-sm outline-none transition-colors text-gray-800 placeholder-gray-400 font-medium ${
                  fieldErrors.username ? "border-red-400 focus:border-red-500 focus:bg-white" : "border-gray-200 focus:bg-white focus:border-gray-400"
                }`}
              />
              {fieldErrors.username && <p className="text-red-500 text-[11px] mt-1 text-left font-medium">{fieldErrors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Địa chỉ Email"
                className={`w-full px-3 py-2 bg-gray-50 border rounded-md text-sm outline-none transition-colors text-gray-800 placeholder-gray-400 font-medium ${
                  fieldErrors.email ? "border-red-400 focus:border-red-500 focus:bg-white" : "border-gray-200 focus:bg-white focus:border-gray-400"
                }`}
              />
              {fieldErrors.email && <p className="text-red-500 text-[11px] mt-1 text-left font-medium">{fieldErrors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <Input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Số điện thoại"
                className={`w-full px-3 py-2 bg-gray-50 border rounded-md text-sm outline-none transition-colors text-gray-800 placeholder-gray-400 font-medium ${
                  fieldErrors.phone ? "border-red-400 focus:border-red-500 focus:bg-white" : "border-gray-200 focus:bg-white focus:border-gray-400"
                }`}
              />
              {fieldErrors.phone && <p className="text-red-500 text-[11px] mt-1 text-left font-medium">{fieldErrors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mật khẩu (Tối thiểu 8 ký tự)"
                className={`w-full px-3 py-2 bg-gray-50 border rounded-md text-sm outline-none transition-colors text-gray-800 placeholder-gray-400 font-medium ${
                  fieldErrors.password ? "border-red-400 focus:border-red-500 focus:bg-white" : "border-gray-200 focus:bg-white focus:border-gray-400"
                }`}
              />
              {fieldErrors.password && <p className="text-red-500 text-[11px] mt-1 text-left font-medium">{fieldErrors.password}</p>}
            </div>

            <div>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Xác nhận mật khẩu"
                className={`w-full px-3 py-2 bg-gray-50 border rounded-md text-sm outline-none transition-colors text-gray-800 placeholder-gray-400 font-medium ${
                  fieldErrors.confirmPassword ? "border-red-400 focus:border-red-500 focus:bg-white" : "border-gray-200 focus:bg-white focus:border-gray-400"
                }`}
              />
              {fieldErrors.confirmPassword && <p className="text-red-500 text-[11px] mt-1 text-left font-medium">{fieldErrors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              loading={submitForm.isPending} 
              className="w-full h-10 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-md transition-colors border-none mt-2 uppercase tracking-wider"
            >
              {submitForm.isPending ? "Đang xử lý..." : "Hoàn Tất Đăng Ký"}
            </Button>
          </form>
        )}

        {/* ========================================================= */}
        {/* BƯỚC 2: XÁC THỰC OTP */}
        {/* ========================================================= */}
        {step === 2 && (
          <form onSubmit={onVerifyOtpSubmit} className="space-y-3.5">
            <Input
              type="text"
              value={inputOtp}
              onChange={(e) => setInputOtp(e.target.value)}
              placeholder="Mã OTP"
              required
              maxLength={6}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-base outline-none transition-colors focus:bg-white focus:border-gray-400 text-center tracking-[0.4em] font-bold text-gray-800 placeholder-gray-400"
            />
            <Button
              type="submit"
              disabled={inputOtp.length < 6} 
              loading={verifyOtp.isPending}
              className="w-full h-10 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-md transition-colors border-none mt-2 uppercase tracking-wider"
            >
              {verifyOtp.isPending ? "Đang xác thực..." : "Kích hoạt tài khoản"}
            </Button>
            
            <div className="text-center mt-3">
              <button 
                  type="button" 
                  onClick={() => {
                      resendOtp.mutate();
                      setInputOtp(""); 
                  }} 
                  disabled={timeLeft > 0 || isPending}
                  className={`text-xs font-semibold border-none bg-transparent transition-colors ${
                    timeLeft > 0 
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-blue-600 hover:text-blue-700 cursor-pointer"
                  }`}
              >
                  {timeLeft > 0 ? `Gửi lại mã sau ${formatTime(timeLeft)}` : "Gửi lại mã OTP"}
              </button>
            </div>
          </form>
        )}

        {/* ĐIỀU HƯỚNG DƯỚI CÙNG KHÍT KHAO */}
        <div className="mt-5 text-center text-xs font-semibold px-1 flex justify-center items-center gap-4 border-t border-gray-100 pt-4">
          {step === 2 && (
            <button 
              onClick={goBack} 
              type="button" 
              className="text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Sửa thông tin
            </button>
          )}
          
          <div className="flex items-center gap-1">
            {step === 1 && <span className="text-gray-400">Đã có tài khoản? </span>}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors no-underline">
              {step === 2 ? "Trở về Đăng nhập" : "Đăng nhập ngay"}
            </Link>
          </div>
        </div>

      </div>
    </>
  );
};

export default Register;