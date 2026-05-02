// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { useLogin } from "../hooks/useLogin";
// import { GoogleLogin } from '@react-oauth/google';
// import FacebookLogin from '@greatsumini/react-facebook-login';
// import Button from "@/components/ui/Button";
// import Input from "@/components/ui/Input";

// const LoginForm = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { handleLogin, handleGoogleLogin, handleFacebookLogin, loading, error } = useLogin();

//   const onSubmit = (e) => {
//     e.preventDefault();
//     handleLogin({ email, password });
//   };

//   return (
//     <form onSubmit={onSubmit} className="w-full">
//       <div className="text-center mb-10">
//         <h2 className="text-3xl font-extrabold text-slate-900">Đăng Nhập</h2>
//         <p className="text-slate-500 text-sm mt-2 font-medium">Truy cập vào tài khoản của bạn</p>
//       </div>

//       {/* Hiển thị lỗi tổng quan */}
//       {error && (
//         <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-sm text-center font-medium shadow-sm">
//           {error}
//         </div>
//       )}

//       <div className="space-y-5">
//         {/* DÙNG COMPONENT INPUT TỰ TẠO */}
//         <Input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="Email hoặc Tên đăng nhập"
//           required
//           // Truyền nguyên bộ style Tech Store vào className
//           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
//         />

//         {/* DÙNG COMPONENT INPUT TỰ TẠO */}
//         <Input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Mật khẩu"
//           required
//           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
//         />

//         {/* DÙNG COMPONENT BUTTON TỰ TẠO */}
//         <Button
//           type="submit"
//           loading={loading} 
//           className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all mt-4 shadow-lg shadow-blue-500/30 border-none"
//         >
//           {loading ? "Đang xử lý..." : "Đăng Nhập"}
//         </Button>
//       </div>

//       {/* Khu vực Social Links giữ nguyên... */}
//       <div className="mt-10 text-center">
//         <div className="relative flex items-center justify-center mb-8">
//           <span className="absolute bg-white px-4 text-xs font-bold text-slate-400 z-10 uppercase tracking-widest">
//             Hoặc tiếp tục với
//           </span>
//           <div className="w-full border-t border-slate-200 absolute"></div>
//         </div>

//         <div className="flex justify-center gap-5 mb-8">
//           <FacebookLogin
//             appId={import.meta.env.VITE_FACEBOOK_APP_ID}
//             onSuccess={(response) => {
//               if (response.accessToken) {
//                 handleFacebookLogin(response.accessToken);
//               }
//             }}
//             onFail={(error) => {
//               console.log('Facebook Login Failed!', error);
//             }}
//             className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:shadow-lg hover:-translate-y-0.5 transition-all border-none cursor-pointer"
//           >
//             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//               <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
//             </svg>
//           </FacebookLogin>

//           <div className="flex items-center justify-center overflow-hidden rounded-full shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all w-11 h-11 border border-slate-100">
//             <GoogleLogin
//               onSuccess={(credentialResponse) => {
//                 if (credentialResponse.credential) {
//                   handleGoogleLogin(credentialResponse.credential);
//                 }
//               }}
//               onError={() => console.log('Google Login Failed')}
//               type="icon"
//               shape="circle"
//             />
//           </div>
//         </div>

//         <div className="flex justify-between text-sm font-semibold px-2">
//           <Link to="/forgot-password" className="text-slate-500 hover:text-blue-600 transition-colors">
//             Quên mật khẩu?
//           </Link>
//           <Link to="/register" className="text-blue-600 hover:text-blue-700 transition-colors">
//             Đăng ký ngay
//           </Link>
//         </div>
//       </div>
//     </form>
//   );
// };

// export default LoginForm;



import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthMutations } from "@/hooks/useAuthMutations";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Lấy các mutations từ Hook
  const { login, googleLogin, facebookLogin } = useAuthMutations();

  const onSubmit = (e) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  // Trích xuất lỗi từ mutation login (dành cho form truyền thống)
  const errorMessage = login.error?.response?.data?.messages || login.error?.message;

  // Trạng thái loading chung cho toàn bộ component (nếu 1 trong 3 cái đang chạy)
  const isAnyLoading = login.isPending || googleLogin.isPending || facebookLogin.isPending;

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900">Đăng Nhập</h2>
        <p className="text-slate-500 text-sm mt-2 font-medium">Truy cập vào tài khoản của bạn</p>
      </div>

      {/* Hiển thị lỗi tổng quan */}
      {errorMessage && (
        <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-sm text-center font-medium shadow-sm">
          {errorMessage}
        </div>
      )}

      <div className="space-y-5">
        {/* DÙNG COMPONENT INPUT TỰ TẠO */}
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email hoặc Tên đăng nhập"
          required
          // Truyền nguyên bộ style Tech Store vào className
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
        />

        {/* DÙNG COMPONENT INPUT TỰ TẠO */}
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          required
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
        />

        {/* DÙNG COMPONENT BUTTON TỰ TẠO */}
        <Button
          type="submit"
          loading={isAnyLoading} 
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all mt-4 shadow-lg shadow-blue-500/30 border-none"
        >
          {isAnyLoading ? "Đang xử lý..." : "Đăng Nhập"}
        </Button>
      </div>

      {/* Khu vực Social Links giữ nguyên... */}
      <div className="mt-10 text-center">
        <div className="relative flex items-center justify-center mb-8">
          <span className="absolute bg-white px-4 text-xs font-bold text-slate-400 z-10 uppercase tracking-widest">
            Hoặc tiếp tục với
          </span>
          <div className="w-full border-t border-slate-200 absolute"></div>
        </div>

        <div className="flex justify-center gap-5 mb-8">
          <FacebookLogin
            appId={import.meta.env.VITE_FACEBOOK_APP_ID}
            onSuccess={(response) => {
              if (response.accessToken) {
                facebookLogin.mutate(response.credential);
              }
            }}
            onFail={(error) => {
              console.log('Facebook Login Failed!', error);
            }}
            className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:shadow-lg hover:-translate-y-0.5 transition-all border-none cursor-pointer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </FacebookLogin>

          <div className="flex items-center justify-center overflow-hidden rounded-full shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all w-11 h-11 border border-slate-100">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  googleLogin.mutate(credentialResponse.credential);
                }
              }}
              onError={() => console.log('Google Login Failed')}
              type="icon"
              shape="circle"
            />
          </div>
        </div>

        <div className="flex justify-between text-sm font-semibold px-2">
          <Link to="/forgot-password" className="text-slate-500 hover:text-blue-600 transition-colors">
            Quên mật khẩu?
          </Link>
          <Link to="/register" className="text-blue-600 hover:text-blue-700 transition-colors">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;