import { Router } from "express";
const router = Router();
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { sendMessage, getMessages, markAllAsRead } from "../constrollers/message.controller.js";

router.route("/send/:id").post(isAuthenticated, sendMessage);
router.route("/all/:id").get(isAuthenticated, getMessages);
router.post('/markAllAsRead', markAllAsRead);

export default router;