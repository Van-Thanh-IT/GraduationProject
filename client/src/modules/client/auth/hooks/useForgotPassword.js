import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/auth.service";
import axios from "axios";

export const useForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState(0); 
  const navigate = useNavigate();

  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleSendOtp = async (inputEmail) => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.sendOtp(inputEmail);
      setEmail(inputEmail);
      setStep(2); 
      setTimeLeft(300);
    } catch (err) {
        if(axios.isAxiosError(err)){
            setError(err.response?.data?.messages || "Không thể gửi OTP. Vui lòng kiểm tra lại email!");
        }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (inputOtp) => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.verifyOtp(email, inputOtp);
      setOtp(inputOtp);
      setStep(3); 
      setTimeLeft(0); 
    } catch (err) {
        if(axios.isAxiosError(err)){
            setError(err.response?.data?.messages || "Mã OTP không chính xác hoặc đã hết hạn!");
        }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await AuthService.resetPassword({ email, otp, newPassword, confirmPassword });
      alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.");
      navigate("/login");
    } catch (err) {
        if(axios.isAxiosError(err)){
            setError(err.response?.data?.messages || "Đặt lại mật khẩu thất bại!");
        }
      
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
        setStep((prev) => prev - 1);
        setError(null);
        if (step === 2) setTimeLeft(0); 
    }
  };

  return { 
    step, email, loading, error, timeLeft, 
    handleSendOtp, handleVerifyOtp, handleResetPassword, goBack 
  };
};