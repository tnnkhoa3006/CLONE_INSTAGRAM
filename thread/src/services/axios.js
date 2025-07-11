import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://clone-instagram-117m.onrender.com/api/v1"
      : "http://localhost:5000/api/v1",
  withCredentials: true, // Để gửi cookie (token, refreshToken)
});

// Interceptor cho response
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // Gọi API refresh token
        await api.post("/auth/refresh-token");
        // Thử lại request cũ
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh cũng fail, logout
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
