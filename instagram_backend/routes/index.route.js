import { Router } from "express";
const router = Router();

import userRoute from "./user.route.js";
import messageRoute from "./message.route.js";
import postRoute from "./post.route.js";
import authRoute from "./auth.route.js";

router.use("/user", userRoute);
router.use("/message", messageRoute);
router.use("/post", postRoute);
router.use("/auth", authRoute);

export default router;