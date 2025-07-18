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

    // Nếu lỗi là 401 (unauthorized) và chưa từng retry
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Kiểm tra xem có refreshToken trong localStorage hay không
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // Không có refresh token thì không làm gì nữa (user chưa login)
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        const res = await axios.post(
          "/auth/refresh-token",
          {},
          {
            baseURL: api.defaults.baseURL, // fix khi dùng axios gốc
            withCredentials: true,
          }
        );

        const { accessToken } = res.data;

        // Cập nhật accessToken mới vào localStorage
        localStorage.setItem("accessToken", accessToken);

        // Gắn accessToken mới vào header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Gửi lại request cũ
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token cũng fail thì xóa token và logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
