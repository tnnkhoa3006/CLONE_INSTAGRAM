import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://clone-instagram-117m.onrender.com/api/v1"
      : "http://localhost:5000/api/v1",
  withCredentials: true, // Để gửi cookie (token, refreshToken)
});

// Interceptor cho request
api.interceptors.request.use((config) => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='));
  if (token) {
    config.headers.Authorization = `Bearer ${token.split('=')[1]}`;
  }
  return config;
});

// Interceptor cho response
api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    // Chỉ thử refresh token một lần
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh-token')  // Tránh vòng lặp vô hạn
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          "/auth/refresh-token",
          {},
          {
            baseURL: api.defaults.baseURL,
            withCredentials: true,
          }
        );

        if (refreshResponse.data.accessToken) {
          // Nếu refresh token thành công, thử lại request ban đầu
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh token thất bại, xóa user state và chuyển về login
        localStorage.removeItem('user');
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
