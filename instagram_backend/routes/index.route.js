import { Router } from "express";
const router = Router();

import userRoute from "./user.route.js";
import messageRoute from "./message.route.js";
import postRoute from "./post.route.js";
import authRoute from "./auth.route.js";

// Health check endpoint - không cần authentication
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: "Server is running"
  });
});

router.use("/user", userRoute);
router.use("/message", messageRoute);
router.use("/post", postRoute);
router.use("/auth", authRoute);

export default router;