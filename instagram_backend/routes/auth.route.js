import { Router } from 'express';
const router = Router();
import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;


router.post('/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const payload = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = sign({ id: payload.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.cookie("token", accessToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 15*60*1000 });
    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

export default router;
