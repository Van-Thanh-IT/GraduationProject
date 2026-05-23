import axios from "axios";
import Swal from "sweetalert2";

// 1. BIẾN RAM (MEMORY) - Đây là nơi an toàn nhất để giấu Access Token
let inMemoryAccessToken = null;

// Hàm để lấy và set Token từ các Component khác nếu cần (Ví dụ lúc Login thành công)
export const getAccessToken = () => inMemoryAccessToken;
export const setAccessToken = (token) => {
    inMemoryAccessToken = token;
};

// 2. Khởi tạo Axios Instance
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
    withCredentials: true, // RẤT QUAN TRỌNG: Để trình duyệt tự gửi HttpOnly Cookie chứa Refresh Token
    timeout: 10000,
});

let failedQueue = [];
let isRefreshing = false;
let isLoggingOut = false;

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

                // 🔥 nếu đang logout thì KHÔNG hiện popup
                if (isLoggingOut) {
                    isLoggingOut = false;
                    return Promise.reject(refreshError);
                }

                // 🔥 nếu chưa login cũng bỏ
                if (!getAccessToken()) return Promise.reject(refreshError);

               

                Swal.fire({
                    icon: "warning",
                    title: "Phiên đăng nhập hết hạn",
                    text: "Vui lòng đăng nhập lại để tiếp tục",
                    confirmButtonText: "Đăng nhập lại",
                    allowOutsideClick: false,
                    allowEscapeKey: false
                }).then(() => {
                    window.location.href = "/login";
                });
               
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
    const hasToken = getAccessToken();
    if (!hasToken) return;

    isLoggingOut = true;

    setAccessToken(null);
    delete API.defaults.headers.common.Authorization;

    axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true });

    window.location.href = "/login";
};

export default API;