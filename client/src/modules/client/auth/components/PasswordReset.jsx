// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { useForgotPassword } from "../hooks/useForgotPassword";
// import Button from "@/components/ui/Button";
// import Input from "@/components/ui/Input";

// // HÀM HỖ TRỢ: Chuyển đổi giây (300) thành chuỗi phút:giây (05:00)
// const formatTime = (seconds) => {
//   const minutes = Math.floor(seconds / 60);
//   const remainingSeconds = seconds % 60;
//   return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
// };

// const PasswordReset = () => {
//   const { 
//     step, email, loading, error, timeLeft, 
//     handleSendOtp, handleVerifyOtp, handleResetPassword, goBack 
//   } = useForgotPassword();

//   const [inputEmail, setInputEmail] = useState("");
//   const [inputOtp, setInputOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const onSendOtpSubmit = (e) => {
//     e.preventDefault();
//     handleSendOtp(inputEmail);
//   };

//   const onVerifyOtpSubmit = (e) => {
//     e.preventDefault();
//     handleVerifyOtp(inputOtp);
//   };

//   const onResetPasswordSubmit = (e) => {
//     e.preventDefault();
//     handleResetPassword(newPassword, confirmPassword);
//   };

//   return (
//     <div className="w-full">
//       <div className="text-center mb-8">
//         <h2 className="text-3xl font-extrabold text-slate-900">Phục hồi mật khẩu</h2>
//         <p className="text-slate-500 text-sm mt-2 font-medium">
//           {step === 1 && "Nhập email của bạn để nhận mã xác thực"}
//           {step === 2 && `Mã xác thực 6 số đã được gửi đến ${email}`}
//           {step === 3 && "Vui lòng nhập mật khẩu mới của bạn"}
//         </p>
//       </div>

//       {error && (
//         <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-sm text-center font-medium shadow-sm">
//           {error}
//         </div>
//       )}

//       {/* BƯỚC 1: NHẬP EMAIL */}
//       {step === 1 && (
//         <form onSubmit={onSendOtpSubmit} className="space-y-5">
//           <Input
//             type="email"
//             value={inputEmail}
//             onChange={(e) => setInputEmail(e.target.value)}
//             placeholder="Nhập địa chỉ Email đã đăng ký"
//             required
//             className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
//           />
//           <Button
//             type="submit"
//             disabled={!inputEmail} 
//             loading={loading} 
//             className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 border-none"
//           >
//             {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
//           </Button>
//         </form>
//       )}

//       {/* BƯỚC 2: NHẬP OTP */}
//       {step === 2 && (
//         <form onSubmit={onVerifyOtpSubmit} className="space-y-5">
//           <Input
//             type="text"
//             value={inputOtp}
//             onChange={(e) => setInputOtp(e.target.value)}
//             placeholder="Nhập mã OTP 6 số"
//             required
//             maxLength={6}
//             className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-center tracking-[0.5em] font-bold text-lg text-slate-800 placeholder-slate-400"
//           />
//           <Button
//             type="submit"
//             disabled={inputOtp.length < 6} 
//             loading={loading}
//             className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 border-none"
//           >
//             {loading ? "Đang xác thực..." : "Xác thực OTP"}
//           </Button>
          
//           <div className="text-center mt-5">
//              <button 
//                 type="button" 
//                 onClick={() => {
//                     handleSendOtp(email);
//                     setInputOtp(""); 
//                 }} 
//                 disabled={timeLeft > 0 || loading}
//                 className={`text-sm font-semibold transition-colors ${
//                   timeLeft > 0 
//                     ? "text-slate-400 cursor-not-allowed" 
//                     : "text-blue-600 hover:text-blue-700 hover:underline"
//                 }`}
//              >
//                  {timeLeft > 0 ? `Gửi lại mã sau ${formatTime(timeLeft)}` : "Gửi lại mã OTP"}
//              </button>
//           </div>
//         </form>
//       )}

//       {/* BƯỚC 3: ĐẶT MẬT KHẨU MỚI */}
//       {step === 3 && (
//         <form onSubmit={onResetPasswordSubmit} className="space-y-5">
//           <Input
//             type="password"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             placeholder="Mật khẩu mới (Tối thiểu 8 ký tự)"
//             required
//             minLength={8}
//             className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
//           />
//           <Input
//             type="password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             placeholder="Xác nhận mật khẩu mới"
//             required
//             minLength={8}
//             className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
//           />
//           <Button
//             type="submit"
//             loading={loading}
//             className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 mt-2 border-none"
//           >
//             {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
//           </Button>
//         </form>
//       )}

//       {/* Điều hướng chung ở dưới cùng */}
//       <div className="mt-10 text-center text-sm font-semibold px-2 flex justify-center items-center gap-6 border-t border-slate-100 pt-6">
//         {step > 1 && (
//             <button onClick={goBack} type="button" className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
//                 Quay lại
//             </button>
//         )}
//         <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
//           Trở về Đăng nhập
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default PasswordReset;

import React, { useState } from "react";
import { Link } from "react-router-dom";
// IMPORT HOOK MỚI VÀ HÀM LẤY LỖI

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthMutations } from "@/hooks/useAuthMutations";

// HÀM HỖ TRỢ: Chuyển đổi giây (300) thành chuỗi phút:giây (05:00)
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const PasswordReset = () => {
  // 1. Lấy toàn bộ logic Quên mật khẩu từ useAuthMutations
  const { forgotPassword } = useAuthMutations();
  const { 
    step, email, timeLeft, goBack, 
    sendOtp, verifyOtp, resetPassword 
  } = forgotPassword;

  const [inputEmail, setInputEmail] = useState("");
  const [inputOtp, setInputOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 1. Gom trạng thái Loading
  const isPending = sendOtp.isPending || verifyOtp.isPending || resetPassword.isPending;

  // 2. Lấy ra cái lỗi đang xuất hiện (nếu có 1 trong 3 cái bị lỗi)
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
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900">Phục hồi mật khẩu</h2>
        <p className="text-slate-500 text-sm mt-2 font-medium">
          {step === 1 && "Nhập email của bạn để nhận mã xác thực"}
          {step === 2 && `Mã xác thực 6 số đã được gửi đến ${email}`}
          {step === 3 && "Vui lòng nhập mật khẩu mới của bạn"}
        </p>
      </div>

      {/* HIỂN THỊ LỖI CHUNG */}
      {errorMessage && (
        <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-sm text-center font-medium shadow-sm">
          {errorMessage}
        </div>
      )}

      {/* BƯỚC 1: NHẬP EMAIL */}
      {step === 1 && (
        <form onSubmit={onSendOtpSubmit} className="space-y-5">
          <Input
            type="email"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            placeholder="Nhập địa chỉ Email đã đăng ký"
            required
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
          />
          <Button
            type="submit"
            disabled={!inputEmail} 
            loading={isPending} 
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 border-none"
          >
            {isPending ? "Đang gửi OTP..." : "Gửi mã OTP"}
          </Button>
        </form>
      )}

      {/* BƯỚC 2: NHẬP OTP */}
      {step === 2 && (
        <form onSubmit={onVerifyOtpSubmit} className="space-y-5">
          <Input
            type="text"
            value={inputOtp}
            onChange={(e) => setInputOtp(e.target.value)}
            placeholder="Nhập mã OTP 6 số"
            required
            maxLength={6}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-center tracking-[0.5em] font-bold text-lg text-slate-800 placeholder-slate-400"
          />
          <Button
            type="submit"
            disabled={inputOtp.length < 6} 
            loading={isPending}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 border-none"
          >
            {isPending ? "Đang xác thực..." : "Xác thực OTP"}
          </Button>
          
          <div className="text-center mt-5">
             <button 
                type="button" 
                onClick={() => {
                    sendOtp.mutate(email); // Dùng email đã lưu ở step 1
                    setInputOtp(""); 
                }} 
                disabled={timeLeft > 0 || isPending}
                className={`text-sm font-semibold transition-colors ${
                  timeLeft > 0 
                    ? "text-slate-400 cursor-not-allowed" 
                    : "text-blue-600 hover:text-blue-700 hover:underline"
                }`}
             >
                 {timeLeft > 0 ? `Gửi lại mã sau ${formatTime(timeLeft)}` : "Gửi lại mã OTP"}
             </button>
          </div>
        </form>
      )}

      {/* BƯỚC 3: ĐẶT MẬT KHẨU MỚI */}
      {step === 3 && (
        <form onSubmit={onResetPasswordSubmit} className="space-y-5">
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mật khẩu mới (Tối thiểu 8 ký tự)"
            required
            minLength={8}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu mới"
            required
            minLength={8}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
          />
          <Button
            type="submit"
            loading={isPending}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 mt-2 border-none"
          >
            {isPending ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </Button>
        </form>
      )}

      {/* Điều hướng chung ở dưới cùng */}
      <div className="mt-10 text-center text-sm font-semibold px-2 flex justify-center items-center gap-6 border-t border-slate-100 pt-6">
        {step > 1 && (
            <button onClick={goBack} type="button" className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Quay lại
            </button>
        )}
        <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
          Trở về Đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default PasswordReset;