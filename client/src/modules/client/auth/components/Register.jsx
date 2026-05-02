// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { useRegister } from "../hooks/useRegister";
// import Input from "@/components/ui/Input";
// import Button from "@/components/ui/Button";
// const Register = () => {
//   const { handleRegister, loading, error } = useRegister();
  
//   // Quản lý state của form
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     await handleRegister(formData);
//   };

//   return (
//     <form onSubmit={onSubmit} className="w-full">
//       <div className="text-center mb-8">
//         <h2 className="text-3xl font-extrabold text-slate-900">Đăng Ký</h2>
//         <p className="text-slate-500 text-sm mt-2 font-medium">Tạo tài khoản thành viên Tech Store</p>
//       </div>

//       {/* Hiển thị lỗi */}
//       {error && (
//         <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-sm text-center font-medium shadow-sm">
//           {error}
//         </div>
//       )}

//       <div className="space-y-4">
//         {/* Username */}
//         <Input
//           type="text"
//           name="username"
//           value={formData.username}
//           onChange={handleChange}
//           placeholder="Họ và tên (Tối thiểu 8 ký tự)"
//           required
//           minLength={8}
//           maxLength={30}
//           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
//         />

//         {/* Email */}
//         <Input
//           type="email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//           placeholder="Địa chỉ Email"
//           required
//           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
//         />

//         {/* Phone */}
//         <Input
//           type="text"
//           name="phone"
//           value={formData.phone}
//           onChange={handleChange}
//           placeholder="Số điện thoại"
//           required
//           pattern="^(0[0-9]{9,10})$"
//           title="Số điện thoại phải bắt đầu bằng số 0 và có 10-11 số"
//           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
//         />

//         {/* Password */}
//         <Input
//           type="password"
//           name="password"
//           value={formData.password}
//           onChange={handleChange}
//           placeholder="Mật khẩu (Tối thiểu 8 ký tự)"
//           required
//           minLength={8}
//           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
//         />

//         {/* Confirm Password */}
//         <Input
//           type="password"
//           name="confirmPassword"
//           value={formData.confirmPassword}
//           onChange={handleChange}
//           placeholder="Xác nhận mật khẩu"
//           required
//           minLength={8}
//           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
//         />

//         {/* Dùng component Button với thuộc tính loading */}
//         <Button
//           type="submit"
//           loading={loading} // Tự động disable và hiện spinner khi gọi API
//           className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all mt-6 shadow-lg shadow-blue-500/30 border-none"
//         >
//           {loading ? "Đang xử lý..." : "Hoàn Tất Đăng Ký"}
//         </Button>
//       </div>

//       <div className="mt-8 text-center text-sm font-semibold px-2">
//         <span className="text-slate-500">Đã có tài khoản? </span>
//         <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors">
//           Đăng nhập ngay
//         </Link>
//       </div>
//     </form>
//   );
// };

// export default Register;



import React, { useState } from "react";
import { Link } from "react-router-dom";
// IMPORT HOOK MỚI VÀ HÀM BẮT LỖI

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuthMutations } from "@/hooks/useAuthMutations";

const Register = () => {
  // 1. Lấy mutation đăng ký ra từ hook tổng
  const { register } = useAuthMutations();
  
  // Quản lý state của form
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
    // 2. Dùng .mutate() thay vì hàm handleRegister cũ
    register.mutate(formData);
  };

  // 3. Lấy thông báo lỗi an toàn (nếu có)
  const errorMessage = register.error?.response?.data?.messages

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900">Đăng Ký</h2>
        <p className="text-slate-500 text-sm mt-2 font-medium">Tạo tài khoản thành viên Tech Store</p>
      </div>

      {/* 4. Hiển thị lỗi từ React Query */}
      {register.isError && (
        <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-sm text-center font-medium shadow-sm">
          {errorMessage || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!"}
        </div>
      )}

      <div className="space-y-4">
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
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
        />

        {/* Email */}
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Địa chỉ Email"
          required
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
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
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
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
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
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
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
        />

        {/* 5. Dùng component Button với thuộc tính loading lấy từ React Query */}
        <Button
          type="submit"
          loading={register.isPending} 
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all mt-6 shadow-lg shadow-blue-500/30 border-none"
        >
          {register.isPending ? "Đang xử lý..." : "Hoàn Tất Đăng Ký"}
        </Button>
      </div>

      <div className="mt-8 text-center text-sm font-semibold px-2">
        <span className="text-slate-500">Đã có tài khoản? </span>
        <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors">
          Đăng nhập ngay
        </Link>
      </div>
    </form>
  );
};

export default Register;