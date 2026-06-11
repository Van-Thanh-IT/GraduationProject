// File: src/modules/client/auth/components/PasswordReset.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuthMutations } from "@/hooks/useAuthMutations";
import SEO from "@/components/SEO";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const PasswordReset = () => {
  const { forgotPassword } = useAuthMutations();
  const { 
    step, email, timeLeft, goBack, 
    sendOtp, verifyOtp, resetPassword 
  } = forgotPassword;

  const [inputEmail, setInputEmail] = useState("");
  const [inputOtp, setInputOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isPending = sendOtp.isPending || verifyOtp.isPending || resetPassword.isPending;
  const currentError = sendOtp.error || verifyOtp.error || resetPassword.error;

  const errorMessage = 
    currentError?.response?.data?.messages || 
    currentError?.response?.data?.message || 
    currentError?.message;

  const onSendOtpSubmit = (e) => {
    e.preventDefault();
    sendOtp.mutate(inputEmail);
  };

  const onVerifyOtpSubmit = (e) => {
    e.preventDefault();
    verifyOtp.mutate(inputOtp);
  };

  const onResetPasswordSubmit = (e) => {
    e.preventDefault();
    resetPassword.mutate({ newPassword, confirmPassword });
  };

  return (
    <>
      <SEO title="Quên mật khẩu" noIndex/>

      <div className="w-full font-sans">
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide m-0">Phục hồi mật khẩu</h2>
          <p className="text-gray-400 text-xs mt-1.5 leading-normal">
            {step === 1 && "Nhập email của bạn để nhận mã xác thực"}
            {step === 2 && `Mã xác thực 6 số đã được gửi đến ${email}`}
            {step === 3 && "Vui lòng nhập mật khẩu mới của bạn"}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-100 text-red-500 rounded-md text-xs text-center font-medium">
            {errorMessage}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={onSendOtpSubmit} className="space-y-3.5">
            <Input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="Nhập địa chỉ Email đã đăng ký"
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none transition-colors focus:bg-white focus:border-gray-400 text-gray-800 placeholder-gray-400 font-medium"
            />
            <Button
              type="submit"
              disabled={!inputEmail} 
              loading={isPending} 
              className="w-full h-10 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-md transition-colors border-none mt-2 uppercase tracking-wider"
            >
              {isPending ? "Đang gửi OTP..." : "Gửi mã OTP"}
            </Button>
          </form>
        )}

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
              loading={isPending}
              className="w-full h-10 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-md transition-colors border-none mt-2 uppercase tracking-wider"
            >
              {isPending ? "Đang xác thực..." : "Xác thực OTP"}
            </Button>
            
            <div className="text-center mt-3">
              <button 
                  type="button" 
                  onClick={() => {
                      sendOtp.mutate(email);
                      setInputOtp(""); 
                  }} 
                  disabled={timeLeft > 0 || isPending}
                  className={`text-xs font-semibold border-none bg-transparent cursor-pointer transition-colors ${
                    timeLeft > 0 
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-blue-600 hover:text-blue-700"
                  }`}
              >
                  {timeLeft > 0 ? `Gửi lại mã sau ${formatTime(timeLeft)}` : "Gửi lại mã OTP"}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={onResetPasswordSubmit} className="space-y-3.5">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới (Tối thiểu 8 ký tự)"
              required
              minLength={8}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none transition-colors focus:bg-white focus:border-gray-400 text-gray-800 placeholder-gray-400 font-medium"
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu mới"
              required
              minLength={8}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none transition-colors focus:bg-white focus:border-gray-400 text-gray-800 placeholder-gray-400 font-medium"
            />
            <Button
              type="submit"
              loading={isPending}
              className="w-full h-10 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-md transition-colors border-none mt-2 uppercase tracking-wider"
            >
              {isPending ? "Đang cập nhật..." : "Đổi mật khẩu"}
            </Button>
          </form>
        )}

        <div className="mt-5 text-center text-xs font-semibold px-1 flex justify-center items-center gap-4 border-t border-gray-100 pt-4">
          {step > 1 && (
              <button 
                onClick={goBack} 
                type="button" 
                className="text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer transition-colors flex items-center gap-1"
              >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  Quay lại
              </button>
          )}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors no-underline flex items-center gap-1">
            Trở về Đăng nhập
          </Link>
        </div>

      </div>
    </>
    
  );
};

export default PasswordReset;