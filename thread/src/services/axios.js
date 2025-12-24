// thread/src/services/axios.js
import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://clone-instagram-117m.onrender.com/api/v1"
      : "http://localhost:5000/api/v1",
  withCredentials: true,
});

// Interceptor cho request
api.interceptors.request.use((config) => {
  // Không cần đặt Authorization header nữa vì backend đọc từ cookie
  // Nhưng giữ lại để backup nếu cần
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

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh-token') &&
      !originalRequest.url.includes('/user/login') &&
      !originalRequest.url.includes('/user/register')
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        if (refreshResponse.data.success) {
          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh token thất bại, clear state và redirect
        localStorage.removeItem('persist:root');
        const event = new Event('token-expired');
        window.dispatchEvent(event);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;