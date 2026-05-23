import React, { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";
import { setAccessToken, getAccessToken, handleLogout } from "@/api/API";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const res = await AuthService.getMe();
      return res.data;
    },
    // Bỏ thuộc tính "enabled" đi để app luôn thử kiểm tra trạng thái đăng nhập
    retry: false, 
    // Nếu cả getMe và Refresh đều lỗi -> User thực sự chưa login -> Clear state
    onError: () => {
      queryClient.setQueryData(['auth-user'], null);
    }
  });

  // ===== Actions =====
  const loginContext = async (token) => {
    // 1. Nhét Access Token vào RAM
    setAccessToken(token); 
    
    await queryClient.invalidateQueries(['auth-user']); 
  };

  const logoutContext = () => {
    handleLogout();
    navigate("/login"); 
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isAuthenticated: !!user,
        isLoading,
        loginContext,
        logoutContext,
        getAccessToken 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};