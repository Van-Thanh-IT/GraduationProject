import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/auth.service";
import axios from "axios";

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return false;
    }
    
    setLoading(true);
    setError(null);

    try {
      const res = await AuthService.register(data);
      if (res.code === 200) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login");
        return true;
      }
    } catch (err) {
      if(axios.isAxiosError(err)){
        const backendError = err.response?.data?.messages || err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!";
        setError(backendError);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error };
};