// thread/src/services/axios.js
import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://clone-instagram-117m.onrender.com/api/v1"
      : "http://localhost:5000/api/v1",
  withCredentials: true,
});

// Flag để tránh refresh token nhiều lần
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor cho request
api.interceptors.request.use((config) => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='));
  if (token) {
    const tokenValue = token.split('=')[1];
    config.headers.Authorization = `Bearer ${tokenValue}`;
  }
  return config;
});

// Interceptor cho response
api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    // Nếu không phải lỗi 401 hoặc đã retry rồi, reject ngay
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/user/login') ||
      originalRequest.url?.includes('/user/register')
    ) {
      return Promise.reject(error);
    }

    // Nếu đang refresh token, thêm request vào queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(
        `${api.defaults.baseURL}/auth/refresh-token`,
        {},
        {
          withCredentials: true,
        }
      );

      if (refreshResponse.data.success) {
        const newToken = refreshResponse.data.accessToken;
        processQueue(null, newToken);
        isRefreshing = false;
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      
      // Clear tất cả storage và redirect ngay
      localStorage.clear();
      sessionStorage.clear();
      
      // Dispatch event để clear Redux state
      const event = new Event('token-expired');
      window.dispatchEvent(event);
      
      // Redirect ngay, không retry nữa
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = "/login";
      }
      
      return Promise.reject(refreshError);
    }
  }
);

export default api;