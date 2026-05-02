import { useState } from "react";
import { AuthService } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loginContext } = useAuth();

  const processAuthRequest = async (apiCall, defaultErrorMsg) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall();
      const userData = res.data; 

      if (userData) {
        if (userData.status !== "ACTIVE") {
          setError("Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt!");
          return; 
        }
        await loginContext(userData.token, userData.refreshToken);

        const roles = userData.roles || [];
        if (roles.includes("ADMIN") || roles.includes("STAFF")) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.messages || defaultErrorMsg);
      } else {
        setError(defaultErrorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (data) => 
    processAuthRequest(() => AuthService.login(data), "Đăng nhập thất bại!");

  const handleGoogleLogin = (idToken) => 
    processAuthRequest(() => AuthService.googleLogin({ idToken }), "Xác thực Google thất bại!");

  const handleFacebookLogin = (accessToken) => 
    processAuthRequest(() => AuthService.facebookLogin({ accessToken }), "Xác thực Facebook thất bại!");

  return { handleLogin, handleGoogleLogin, handleFacebookLogin, loading, error };
};