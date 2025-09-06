import { Router } from 'express';
const router = Router();
import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;


router.post('/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const payload = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Tạo token mới
    const accessToken = sign({ id: payload.id }, process.env.JWT_SECRET, { expiresIn: "5m" });
    const newRefreshToken = sign({ id: payload.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    // Set cả access token và refresh token mới
    res
      .cookie("token", accessToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 5 * 60 * 1000
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({
        success: true,
        accessToken,
        message: 'Tokens refreshed successfully'
      });
  } catch (err) {
    // Xóa cookie cũ nếu refresh token không hợp lệ
    res
      .cookie("token", null, { httpOnly: true, sameSite: "none", secure: true, maxAge: 0 })
      .cookie("refreshToken", null, { httpOnly: true, sameSite: "none", secure: true, maxAge: 0 })
      .status(403)
      .json({ 
        success: false,
        message: 'Invalid or expired refresh token' 
      });
  }
});

export default router;
