// src/modules/client/auth/hooks/useAuthMutations.js
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";

export const useAuthMutations = () => {
  const { loginContext } = useAuth();
  const navigate = useNavigate();

  // ==========================================
  // STATE: FORGOT PASSWORD
  // ==========================================
  const [step, setStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  // ==========================================
  // STATE: REGISTER (MỚI BỔ SUNG)
  // ==========================================
  const [registerStep, setRegisterStep] = useState(1);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerTimeLeft, setRegisterTimeLeft] = useState(0);

  // ==========================================
  // XỬ LÝ ĐĂNG NHẬP THÀNH CÔNG
  // ==========================================
  const handleAuthSuccess = async (userData) => {
    if (userData.status !== "ACTIVE") {
      throw new Error("Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt!");
    }
    
    await loginContext(userData.token);

    const roles = userData.roles || [];
    if (roles.includes("ADMIN") || roles.includes("STAFF")) {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  const loginMutation = useMutation({
    mutationFn: (credentials) => AuthService.login(credentials),
    onSuccess: (res) => { return handleAuthSuccess(res.data) },
  });

  const googleLoginMutation = useMutation({
    mutationFn: (idToken) => AuthService.googleLogin({ idToken }),
    onSuccess: (res) => { return handleAuthSuccess(res.data) },
  });

  const facebookLoginMutation = useMutation({
    mutationFn: (accessToken) => AuthService.facebookLogin({ accessToken }),
    onSuccess: (res) => { return handleAuthSuccess(res.data) },
  });

  // ==========================================
  // LUỒNG ĐĂNG KÝ (CẬP NHẬT)
  // ==========================================
  const registerMutation = useMutation({
    mutationFn: async (data) => {
      if (data.password !== data.confirmPassword) {
        throw new Error("Mật khẩu xác nhận không khớp!");
      }
      const res = await AuthService.register(data);
      return { res, email: data.email }; // Trả về email để lưu vào state
    },
    onSuccess: ({ res, email }) => {
      if (res.code === 200) {
        setRegisterEmail(email); // Lưu lại email đang đăng ký
        setRegisterStep(2);      // Chuyển sang bước 2: Nhập OTP
        setRegisterTimeLeft(300); // Đếm ngược 5 phút
      }
    },
  });

  const verifyRegisterOtpMutation = useMutation({
    mutationFn: async (inputOtp) => await AuthService.verifyRegisterOtp(registerEmail, inputOtp),
    onSuccess: () => {
      alert("Xác thực tài khoản thành công! Vui lòng đăng nhập.");
      setRegisterStep(1);
      navigate("/login");
    },
  });

  const resendRegisterOtpMutation = useMutation({
    mutationFn: async () => await AuthService.resendRegisterOtp(registerEmail),
    onSuccess: () => {
      setRegisterTimeLeft(300); // Reset lại bộ đếm thời gian
      alert("Đã gửi lại mã OTP đến email của bạn!");
    },
  });

  // ==========================================
  // LUỒNG QUÊN MẬT KHẨU (GIỮ NGUYÊN)
  // ==========================================
  const sendOtpMutation = useMutation({
    mutationFn: async (inputEmail) => {
      await AuthService.sendOtp(inputEmail);
      return inputEmail;
    },
    onSuccess: (inputEmail) => {
      setResetEmail(inputEmail);
      setStep(2);
      setTimeLeft(300);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (inputOtp) => {
      await AuthService.verifyOtp(resetEmail, inputOtp);
      return inputOtp; 
    },
    onSuccess: (inputOtp) => {
      setResetOtp(inputOtp);
      setStep(3);
      setTimeLeft(0);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ newPassword, confirmPassword }) => {
      if (newPassword !== confirmPassword) {
        throw new Error("Mật khẩu xác nhận không khớp!");
      }
      await AuthService.resetPassword({ email: resetEmail, otp: resetOtp, newPassword, confirmPassword });
    },
    onSuccess: () => {
      alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.");
      navigate("/login");
    },
  });

  const goBackStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      if (step === 2) setTimeLeft(0);
      
      sendOtpMutation.reset();
      verifyOtpMutation.reset();
      resetPasswordMutation.reset();
    }
  };

  
  // Timer cho Quên mật khẩu
  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Timer cho Đăng ký
  useEffect(() => {
    if (registerStep !== 2 || registerTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setRegisterTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [registerStep, registerTimeLeft]);


  return {
    login: loginMutation,
    googleLogin: googleLoginMutation,
    facebookLogin: facebookLoginMutation,
    
    register: {
      step: registerStep,
      email: registerEmail,
      timeLeft: registerTimeLeft,
      submitForm: registerMutation,
      verifyOtp: verifyRegisterOtpMutation,
      resendOtp: resendRegisterOtpMutation,
      goBack: () => {
        setRegisterStep(1);
        registerMutation.reset();
        verifyRegisterOtpMutation.reset();
      }
    },

    forgotPassword: {
      step,
      email: resetEmail,
      timeLeft,
      goBack: goBackStep,
      sendOtp: sendOtpMutation,
      verifyOtp: verifyOtpMutation,
      resetPassword: resetPasswordMutation,
    }
  };
};