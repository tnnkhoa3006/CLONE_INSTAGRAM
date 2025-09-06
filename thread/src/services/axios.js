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

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(
          "/auth/refresh-token",
          {},
          {
            baseURL: api.defaults.baseURL,
            withCredentials: true,
          }
        );

        // AccessToken đã được set lại vào cookie → không cần lưu vào localStorage hay set header
        return api(originalRequest); // gửi lại request cũ
      } catch (refreshError) {
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
