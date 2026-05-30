// File: src/contexts/AuthProvider.jsx
import React, { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spin } from "antd";
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
    retry: false,
    onError: () => {
      queryClient.setQueryData(['auth-user'], null);
    }
  });

  const loginContext = async (token) => {
    setAccessToken(token); 
    
    try {

      await queryClient.fetchQuery({
        queryKey: ['auth-user'],
        queryFn: async () => {
          const res = await AuthService.getMe();
          return res.data;
        }
      });

      queryClient.invalidateQueries(['cart']); 
    } catch (error) {
      console.error("Lỗi khi đồng bộ User Profile:", error);
      handleLogout();
    }
  };

  const logoutContext = () => {
    handleLogout();
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-50">
        <Spin size="large" />
        <p className="mt-4 text-gray-500 font-medium">Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  const isAuth = !!user || !!getAccessToken();

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isAuthenticated: isAuth, 
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