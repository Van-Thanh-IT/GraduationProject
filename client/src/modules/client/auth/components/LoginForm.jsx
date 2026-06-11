// File: src/modules/client/auth/components/LoginForm.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthMutations } from "@/hooks/useAuthMutations";
import { FaFacebookF } from "react-icons/fa";
import SEO from "@/components/SEO";
import { Helmet } from "react-helmet-async";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { login, googleLogin, facebookLogin } = useAuthMutations();

  const onSubmit = (e) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  const errorMessage = login.error?.response?.data?.messages || login.error?.message;
  const isAnyLoading = login.isPending || googleLogin.isPending || facebookLogin.isPending;

  return (

    <>
      <SEO title="Đăng nhập" noIndex/>

      <form onSubmit={onSubmit} className="w-full font-sans">
        
        {/* TIÊU ĐỀ BIỂU MẪU */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide m-0">Đăng nhập</h2>
          <p className="text-gray-400 text-xs mt-1">Truy cập vào tài khoản của bạn</p>
        </div>

        {/* THÔNG BÁO LỖI PHẲNG */}
        {errorMessage && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-100 text-red-500 rounded-md text-xs text-center font-medium">
            {errorMessage}
          </div>
        )}

        {/* KHU VỰC CÁC Ô NHẬP LIỆU */}
        <div className="space-y-3.5">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email hoặc Tên đăng nhập"
            required
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none transition-colors focus:bg-white focus:border-gray-400 text-gray-800 placeholder-gray-400 font-medium"
          />

          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            required
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none transition-colors focus:bg-white focus:border-gray-400 text-gray-800 placeholder-gray-400 font-medium"
          />

          {/* NÚT ĐĂNG NHẬP PHẲNG (ĐỒNG BỘ MÀU HỒNG CAM NHẸ VỚI AUTHLAYOUT) */}
          <Button
            type="submit"
            loading={isAnyLoading} 
            className="w-full h-10 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-md transition-colors border-none mt-2 uppercase tracking-wider"
          >
            {isAnyLoading ? "Đang xử lý..." : "Đăng Nhập"}
          </Button>
        </div>

        {/* ĐƯỜNG NGĂN CÁCH KHÍT KHAO */}
        <div className="mt-6 text-center">
          <div className="relative flex items-center justify-center mb-4">
            <span className="absolute bg-white px-3 text-[11px] font-bold text-gray-400 z-10 uppercase tracking-wider">
              Hoặc tiếp tục với
            </span>
            <div className="w-full border-t border-gray-100 absolute"></div>
          </div>

          {/* ĐĂNG NHẬP MXH THU GỌN KÍCH THƯỚC */}
          <div className="flex flex-col gap-2.5 mb-5 items-center">
            
            <div className="w-full flex justify-center custom-google-btn-wrapper">
              <GoogleLogin
                width={320}
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    googleLogin.mutate(credentialResponse.credential);
                  }
                }}
                onError={() => console.log("Google Login Failed")}
              />
          
            </div>

            <FacebookLogin
              appId={import.meta.env.VITE_FACEBOOK_APP_ID}
              onSuccess={(res) => {
                if (res.accessToken) {
                  facebookLogin.mutate(res.accessToken);
                }
              }}
              scope="public_profile,email"
              
              onFail={(err) => console.log(err)}
              className="w-full h-9 flex items-center justify-center gap-2 rounded-md bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-semibold transition-colors border-none cursor-pointer"
            >
              <FaFacebookF className="text-sm" />
              <span>Đăng nhập bằng Facebook</span>
            </FacebookLogin>

          </div>

          {/* ĐIỀU HƯỚNG DƯỚI CÙNG */}
          <div className="flex justify-between text-xs font-semibold px-1">
            <Link to="/forgot-password" className="text-gray-400 hover:text-rose-500 transition-colors no-underline">
              Quên mật khẩu?
            </Link>
            <Link to="/register" className="text-blue-600 hover:text-blue-700 transition-colors no-underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>
        
      </form>
    </>
  );
};

export default LoginForm;