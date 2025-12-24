import { Router } from 'express';
const router = Router();
import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;


router.post('/refresh-token', (req, res) => {
  console.log('Refresh token request - Origin:', req.headers.origin);
  console.log('Refresh token request - Cookies:', req.cookies);
  console.log('Refresh token request - Cookie header:', req.headers.cookie);
  
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  
  if (!refreshToken) {
    console.log('No refresh token found');
    return res.status(401).json({ 
      message: 'No refresh token provided',
      success: false 
    });
  }

  try {
    const payload = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Tạo token mới
    const accessToken = sign({ id: payload.id }, process.env.JWT_SECRET, { expiresIn: "5m" });
    const newRefreshToken = sign({ id: payload.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    // Xác định cookie options dựa trên môi trường
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      path: "/",
    };

    console.log('Refreshing tokens with options:', cookieOptions);

    // Set cả access token và refresh token mới
    res
      .cookie("token", accessToken, {
        ...cookieOptions,
        maxAge: 5 * 60 * 1000
      })
      .cookie("refreshToken", newRefreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({
        success: true,
        accessToken,
        message: 'Tokens refreshed successfully'
      });
  } catch (err) {
    console.error('Refresh token error:', err.message);
    
    // Xác định cookie options để xóa cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const clearCookieOptions = {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      path: "/",
      maxAge: 0
    };
    
    res
      .cookie("token", "", clearCookieOptions)
      .cookie("refreshToken", "", clearCookieOptions)
      .status(403)
      .json({ 
        success: false,
        message: 'Invalid or expired refresh token' 
      });
  }
});

// Test endpoint để kiểm tra cookies
router.get('/test-cookies', (req, res) => {
  res.json({
    success: true,
    cookies: req.cookies,
    headers: {
      origin: req.headers.origin,
      cookie: req.headers.cookie
    },
    message: 'Cookie test endpoint'
  });
});

export default router;
