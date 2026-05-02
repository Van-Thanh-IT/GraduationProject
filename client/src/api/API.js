// import axios from "axios";
// import { STORAGE_KEYS } from "@/constants/storage";

// // 1. Khởi tạo Axios Instance
// const API = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 10000,
// });
// let failedQueue = [];
// let isRefreshing = false;

// const processQueue = (error, token) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// // ==============================================================================
// // REQUEST INTERCEPTOR: Tự động đính kèm Token trước khi gửi
// // ==============================================================================
// API.interceptors.request.use(
//   (config) => {
//     // localStorage là đồng bộ, KHÔNG dùng await
//     const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ==============================================================================
// // RESPONSE INTERCEPTOR: Xử lý lỗi (đặc biệt là 401 Hết hạn token)
// // ==============================================================================
// API.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Bắt lỗi 401 Unauthorized và đảm bảo chưa từng retry trước đó
//     if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
//       // Chặn vòng lặp vô hạn: Nếu chính API refresh-token bị 401 thì logout luôn
//       if (originalRequest.url.includes('/auth/refresh-token')) {
//         handleLogout();
//         return Promise.reject(error);
//       }

//       // Nếu đang trong quá trình refresh token -> Đưa các request khác vào hàng đợi (Queue)
//       if (isRefreshing) {
//         return new Promise(function (resolve, reject) {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             return API(originalRequest); // Gọi lại request vừa bị hold
//           })
//           .catch((err) => {
//             return Promise.reject(err);
//           });
//       }

//       // Đánh dấu request này đã được retry và bắt đầu khóa cờ refresh
//       originalRequest._retry = true;
//       isRefreshing = true;

//       const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

//       if (!refreshToken) {
//         handleLogout();
//         return Promise.reject(error);
//       }

//       try {
//         // Gọi API cấp lại token (Dùng axios thường để không bị dính vào interceptor của API)
//         const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
//           refreshToken: refreshToken, 
//         });

//         const newAccessToken = res.data.token; // Khớp với AuthenticationResponse của backend
//         const newRefreshToken = res.data.refreshToken;

//         // Lưu token mới
//         localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
//         if (newRefreshToken) {
//           localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken); // Refresh Token Rotation
//         }

//         // Cập nhật lại header mặc định
//         API.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//         // Chạy lại tất cả các request đang bị kẹt trong Queue
//         processQueue(null, newAccessToken);

//         // Chạy lại request hiện tại
//         return API(originalRequest);

//       } catch (refreshError) {
//         // Nếu refresh token cũng thất bại/hết hạn -> Xóa queue và Logout
//         processQueue(refreshError, null);
//         handleLogout();
//         return Promise.reject(refreshError);
//       } finally {
//         // Mở khóa cờ refresh cho các lần sau
//         isRefreshing = false;
//       }
//     }

//     // Các lỗi khác ngoài 401 (như 400, 403, 500) thì trả về bình thường
//     return Promise.reject(error);
//   }
// );

// // ==============================================================================
// // HÀM LOGOUT
// // ==============================================================================
// export const handleLogout = () => {
//   // localStorage là đồng bộ, KHÔNG dùng await
//   localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
//   localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  
//   // Xóa header mặc định
//   delete API.defaults.headers.common.Authorization;

//   // Tùy chọn: Chuyển hướng người dùng về trang đăng nhập
//   // Tránh dùng window.location.href nếu bạn đang dùng React Router, nhưng đây là giải pháp hard-reset tốt nhất
//   if (window.location.pathname !== '/login') {
//      window.location.href = '/login'; 
//   }
// };

// export default API;



import axios from "axios";
// Không import STORAGE_KEYS nữa vì mình không dùng localStorage để lưu Token nữa.

// 1. BIẾN RAM (MEMORY) - Đây là nơi an toàn nhất để giấu Access Token
let inMemoryAccessToken = null;

// Hàm để lấy và set Token từ các Component khác nếu cần (Ví dụ lúc Login thành công)
export const getAccessToken = () => inMemoryAccessToken;
export const setAccessToken = (token) => {
    inMemoryAccessToken = token;
    localStorage.setItem("token" ,token);
};

// 2. Khởi tạo Axios Instance
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // RẤT QUAN TRỌNG: Để trình duyệt tự gửi HttpOnly Cookie chứa Refresh Token
    timeout: 10000,
});

let failedQueue = [];
let isRefreshing = false;

const processQueue = (error, token) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// ==============================================================================
// REQUEST INTERCEPTOR: Tự động đính kèm Token (từ RAM) trước khi gửi
// ==============================================================================
API.interceptors.request.use(
    (config) => {
        // Lấy token từ RAM (Biến inMemoryAccessToken) chứ KHÔNG lấy từ localStorage
        const token = getAccessToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ==============================================================================
// RESPONSE INTERCEPTOR: Xử lý 401 Hết hạn token
// ==============================================================================
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            
            if (originalRequest.url.includes('/auth/refresh-token')) {
                handleLogout();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return API(originalRequest);
                })
                .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Gọi API refresh token (Browser sẽ tự đính kèm HttpOnly Cookie)
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {}, {
                    withCredentials: true // Nhớ bật cái này để gửi Cookie
                });

                // Backend nhả token mới vào JSON Body
                const newAccessToken = res.data.data.token; 

                // LƯU TOKEN MỚI VÀO RAM
                setAccessToken(newAccessToken);

                // Cập nhật request hiện tại
                API.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);

                return API(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                handleLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ==============================================================================
// HÀM LOGOUT
// ==============================================================================
export const handleLogout = () => {
    // 1. Xóa Token trong RAM
    setAccessToken(null);
    delete API.defaults.headers.common.Authorization;
    axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true });
};

export default API;