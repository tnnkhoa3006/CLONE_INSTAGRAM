const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ id: payload.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.cookie("token", accessToken, { httpOnly: true, sameSite: "strict", maxAge: 15*60*1000 });
    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

module.exports = router;
