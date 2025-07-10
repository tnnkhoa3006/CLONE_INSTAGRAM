import { Router } from "express";
const router = Router();

import userRoute from "./user.route.js";
import messageRoute from "./message.route.js";
import postRoute from "./post.route.js";

router.use("/user", userRoute);
router.use("/message", messageRoute);
router.use("/post", postRoute);

export default router;