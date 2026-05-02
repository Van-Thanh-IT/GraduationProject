/* eslint-disable react-refresh/only-export-components */

// import React, { createContext, useContext } from "react";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { AuthService } from "@/services/auth.service";
// import { STORAGE_KEYS } from "@/constants/storage";

// const AuthContext = createContext(undefined);

// export const AuthProvider = ({ children }) => {
//   const queryClient = useQueryClient();

//   const getToken = () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
//   const getRefreshToken = () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

//   const setTokens = (token, refreshToken) => {
//     localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
//     localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
//   };

//   const clearTokens = () => {
//     localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
//     localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
//   };
//   const { data: user, isLoading } = useQuery({
//     queryKey: ['auth-user'],
//     queryFn: async () => {
//       const res = await AuthService.getMe();
//       return res.data;
//     },
//     // CHỈ GỌI API NẾU TRONG LOCAL STORAGE CÓ TOKEN
//     enabled: !!getToken(),
//     // Nếu token hết hạn hoặc lỗi, không cố gọi lại nhiều lần
//     retry: false, 
//     onError: () => {
//       clearTokens();
//     }
//   });

//   // ===== Actions =====
//   const loginContext = async (token, refreshToken) => {
//     setTokens(token, refreshToken);
//     // Ép React Query gọi lại API getMe ngay lập tức để cập nhật user
//     await queryClient.invalidateQueries(['auth-user']); 
//   };

//   const logoutContext = () => {
//     clearTokens();
//     queryClient.setQueryData(['auth-user'], null);
//     window.location.href = "/login";
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user: user || null,
//         isAuthenticated: !!user,
//         isLoading,
//         loginContext,
//         logoutContext,
//         getToken,
//         getRefreshToken,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within AuthProvider");
//   }
//   return context;
// };

import React, { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";
import { setAccessToken, getAccessToken, handleLogout } from "@/api/API";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // Gọi API getMe mỗi khi app load. 
  // F5 mất token trong RAM? Không sao, Axios Interceptor sẽ dùng Cookie để tự cứu lấy nó!
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
    
    // 2. Ép React Query gọi lại API getMe ngay lập tức để lấy thông tin User
    await queryClient.invalidateQueries(['auth-user']); 
  };

  const logoutContext = () => {
    handleLogout(); // Hàm bên axios sẽ clear RAM và redirect
    queryClient.setQueryData(['auth-user'], null);
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