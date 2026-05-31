
import axios from "axios";
import Swal from "sweetalert2";

let inMemoryAccessToken = null;

export const getAccessToken = () => inMemoryAccessToken;
export const setAccessToken = (token) => {
    inMemoryAccessToken = token;
};


const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
    withCredentials: true, 
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


API.interceptors.request.use(
    (config) => {
        const token = getAccessToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
      

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            
            if (originalRequest.url.includes('/api/auth/refresh-token')) {
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
               const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh-token`, {}, {
                    withCredentials: true,
                    headers: {
                        "ngrok-skip-browser-warning": "true", // Bắt buộc phải có khi dùng ngrok
                        "Content-Type": "application/json"
                    }
                });
                const newAccessToken = res.data.data.token; 
               
                setAccessToken(newAccessToken);

                API.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);

                return API(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);

                if (isLoggingOut) {
                    isLoggingOut = false;
                    return Promise.reject(refreshError);
                }

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

export const handleLogout = async () => {
    isLoggingOut = true;

    setAccessToken(null);
    delete API.defaults.headers.common.Authorization;

    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, { 
            withCredentials: true,
            headers: { "ngrok-skip-browser-warning": "true" }
        });
    } catch (err) {
        console.error("Lỗi khi gọi API logout:", err);
    } finally {
        isLoggingOut = false;
 
        sessionStorage.clear();
        
        window.location.href = "/login";
    }
};

export default API;