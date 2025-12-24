const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép requests không có origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.URL_FRONTEND,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      // Thêm các domain frontend của bạn ở đây nếu có
    ].filter(Boolean); // Loại bỏ undefined values
    
    // Cho phép nếu origin trong danh sách hoặc không có origin
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      // Trong development, cho phép tất cả để dễ debug
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // QUAN TRỌNG: Phải là true để gửi cookie
  exposedHeaders: ['Set-Cookie'], // Expose Set-Cookie header
  optionsSuccessStatus: 200, // Một số trình duyệt cũ cần status 200
};

export default corsOptions;
