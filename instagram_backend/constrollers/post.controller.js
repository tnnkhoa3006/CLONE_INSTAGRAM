import sharp from "sharp";
import cloudinary from "cloudinary";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) {
            return res.status(400).json({
                message: "Image is required",
                success: false
            })
        }

        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 90 })
            .toBuffer();

        const fileUrl = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUrl);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });

        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(200).json({
            message: "Post created successfully",
            post,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: '-password' })
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username ProfilePicture'
                }
            });

        const postsWithBookmark = posts.map(post => {
            const isBookmarked = user.bookmarks.some(
                bookmarkId => bookmarkId.toString() === post._id.toString()
            );
            return {
                ...post.toObject(),
                isBookmarked
            };
        });

        return res.status(200).json({
            posts: postsWithBookmark,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
            .populate({ path: 'author', select: '-password' })
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username ProfilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const likePost = async (req, res) => {
    try {
        const likeUserId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(400).json({
                message: "Post does not exist",
                success: false
            });
        }

        // Cập nhật likes
        await Post.findByIdAndUpdate(postId, {
            $addToSet: { likes: likeUserId }
        });

        const updatedPost = await Post.findById(postId).select('likes author');
        const user = await User.findById(likeUserId).select('username ProfilePicture');

        const postOwnerId = updatedPost.author.toString();
        if (postOwnerId !== likeUserId) {
            const notification = {
                type: "like",
                userId: likeUserId,
                userDetails: user,
                postId,
                message: "Your post was liked."
            };

            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            if (postOwnerSocketId) {
                io.to(postOwnerSocketId).emit("notification", notification);
            }
        }

        console.log("Emit postLikeUpdated", postId, updatedPost.likes);
        io.emit("postLikeUpdated", {
            postId,
            likes: updatedPost.likes
        });

        return res.status(200).json({
            message: "Post liked successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


export const disLikePost = async (req, res) => {
    try {
        const likeUserId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(400).json({
                message: "Post does not exist",
                success: false
            });
        }

        // Pull user ID khỏi danh sách likes
        await Post.findByIdAndUpdate(postId, {
            $pull: { likes: likeUserId }
        });

        // Lấy lại thông tin post mới để emit realtime
        const updatedPost = await Post.findById(postId).select('likes author');
        const user = await User.findById(likeUserId).select('username ProfilePicture');

        const postOwnerId = updatedPost.author.toString();
        if (postOwnerId !== likeUserId) {
            const notification = {
                type: "dislike",
                userId: likeUserId,
                userDetails: user,
                postId,
                message: `Your post was disliked.`
            };
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            if (postOwnerSocketId) {
                io.to(postOwnerSocketId).emit("notification", notification);
            }
        }

        // Realtime emit để client cập nhật like count
        io.emit("postLikeUpdated", {
            postId,
            likes: updatedPost.likes
        });

        return res.status(200).json({
            message: "Post disliked successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const addComment = async (req, res) => {
    try {
        const authorId = req.id;
        const postId = req.params.id;
        const { text, parentId } = req.body; // nhận thêm parentId

        const post = await Post.findById(postId);
        if (!text) return res.status(400).json({
            message: "Text is required",
            success: false
        })
        if (!post) {
            return res.status(400).json({
                message: "Post does not exist",
                success: false
            })
        }

        const comment = await Comment.create({
            text,
            author: authorId,
            post: postId,
            parentId: parentId || null
        })

        await comment.populate({ path: 'author', select: 'username ProfilePicture' });

        post.comments.push(comment._id);
        await post.save();

        io.emit("newComment", {
            postId,
            comment
        });

        return res.status(200).json({
            message: "Comment added successfully",
            comment,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(400).json({
            message: "Post does not exist",
            success: false
        })

        if (post.author.toString() !== authorId) return res.status(401).json({
            message: "authorization denied",
        })

        await Post.findByIdAndDelete(postId);

        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        await Comment.deleteMany({ post: postId });

        // Realtime emit delete post
        io.emit("postDeleted", { postId });

        return res.status(200).json({
            message: "Post deleted successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getCommentsOfPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const comments = await Comment.find({ post: postId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username ProfilePicture'
        });
        return res.status(200).json({
            comments,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);

        if (!post) return res.status(400).json({
            message: "Post does not exist",
            success: false
        })

        const user = await User.findById(authorId);
        if (user.bookmarks.includes(post._id)) {
            await user.updateOne({ $pull: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({
                type: "unbookmark",
                message: "Post unbookmarked successfully",
                success: true
            })
        } else {
            await user.updateOne({ $addToSet: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({
                type: "bookmark",
                message: "Post bookmarked successfully",
                success: true
            })
        }
    } catch (error) {
        console.log(error);
    }
}

// Like comment
export const likeComment = async (req, res) => {
    try {
        const userId = req.id;
        const commentId = req.params.commentId;
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found", success: false });

        if (!comment.likes.includes(userId)) {
            comment.likes.push(userId);
            await comment.save();
        }
        return res.status(200).json({ message: "Liked", success: true, likes: comment.likes });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Unlike comment
export const unlikeComment = async (req, res) => {
    try {
        const userId = req.id;
        const commentId = req.params.commentId;
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found", success: false });

        comment.likes = comment.likes.filter(id => id.toString() !== userId);
        await comment.save();
        return res.status(200).json({ message: "Unliked", success: true, likes: comment.likes });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};