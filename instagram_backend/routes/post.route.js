import { Router } from "express";
const router = Router();
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { addNewPost, getAllPosts, getUserPost, likePost, disLikePost, addComment, getCommentsOfPost, deletePost, bookmarkPost, likeComment, unlikeComment } from "../constrollers/post.controller.js";

router.route("/addpost").post(isAuthenticated, upload.single("file"), addNewPost);
router.route("/all").get(isAuthenticated, getAllPosts);
router.route("/userpost/all").get(isAuthenticated, getUserPost);
router.route("/:id/like").post(isAuthenticated, likePost);
router.route("/:id/dislike").post(isAuthenticated, disLikePost);
router.route("/:id/comment").post(isAuthenticated, addComment);
router.route("/:id/comment/all").get(isAuthenticated, getCommentsOfPost);
router.route("/delete/:id").delete(isAuthenticated, deletePost);
router.route("/:id/bookmark").post(isAuthenticated, bookmarkPost);
router.route("/comment/:commentId/like").post(isAuthenticated, likeComment);
router.route("/comment/:commentId/unlike").post(isAuthenticated, unlikeComment);

export default router;