import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../config/cloudinary.js";
import Post from "../models/post.model.js";


dotenv.config();

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(401).json({
        message: "Something is missing, please check!",
        success: false
      })     
    };

    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "User already exists",
        success: false
      })
    };

    const hassedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hassedPassword });

    return res.status(200).json({
      message: "Account created successfully.",
      success: true
    })
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        message: "Invalid email or password, please check!",
        success: false
      })     
    };

    let user = await User.findOne({ email })
      .populate('following', 'username ProfilePicture');

    if (!user) {
      return res.status(401).json({
        message: "User does not exist",
        success: false
      })
    };

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      return res.status(401).json({
        message: "Invalid email or password, please check!",
        success: false
      })
    };

    const populatedPosts = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post && post.author && post.author.equals(user._id)) {
          return post;
        } else {
          return null;
        }
      })
    );
    const filteredPosts = populatedPosts.filter(Boolean);

    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      ProfilePicture: user.ProfilePicture,
      bio: user.bio,
      gender: user.gender,
      followers: user.followers,
      following: user.following,
      posts: filteredPosts
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5m" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    return res
      .cookie("token", accessToken, { httpOnly: true, sameSite: "strict", maxAge: 5*60*1000 })
      .cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "strict", maxAge: 7*24*60*60*1000 })
      .json({
        message: `welcome back ${user.username}`,
        success: true,
        user
      });

  } catch (error) {
    console.log(error);
  }
}

export const logout = async (req, res) => {
  try {
    return res
      .cookie("token", null, { httpOnly: true, sameSite: "strict", maxAge: 0 })
      .cookie("refreshToken", null, { httpOnly: true, sameSite: "strict", maxAge: 0 })
      .json({
        message: "Logout successfully",
        success: true
      })
  } catch (error) {
    console.log(error);
  }
}

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
        populate: [
          { path: "author", select: "-password" },
          {
            path: "comments",
            populate: { path: "author", select: "username ProfilePicture" }
          }
        ]
      })
      .populate({
        path: "bookmarks",
        populate: [
          { path: "author", select: "-password" },
          {
            path: "comments",
            populate: { path: "author", select: "username ProfilePicture" }
          }
        ]
      })
      .populate('following', 'username ProfilePicture');

    return res.status(200).json({
      user,
      success: true
    });
  } catch (error) {
    console.log(error);
  }
}

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const {bio, gender} = req.body;
    const ProfilePicture = req.file;
    let cloudResponse;
    
    if(ProfilePicture) {
      const fileUrl = getDataUri(ProfilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUrl);
    }

    const user = await User.findById(userId).select("-password");
    if(!user) {
      return res.status(401).json({
        message: "User does not exist",
        success: false
      });
    }

    if(bio) user.bio = bio;
    if(gender) user.gender = gender;
    if(cloudResponse) user.ProfilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user
    })
  }catch (error) {
    console.log(error);
  }
}

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({_id:{$ne: req.id}}).select("-password");
    if(!suggestedUsers) {
      return res.status(400).json({
        message: "Currently do not have any users",
      })
    };

    return res.status(200).json({
      suggestedUsers,
      success: true
    })
  } catch (error) {
    console.log(error);
  }
}

export const followOrunfollow = async (req, res) => {
  try {
    const followerId = req.id;
    const followingId = req.params.id;
    if (followerId === followingId) {
      return res.status(400).json({
        message: "You cannot follow yourself",
        success: false
      })
    }

    const user = await User.findById(followerId);
    const tagetuser = await User.findById(followingId);

    if (!user || !tagetuser) {
      return res.status(400).json({
        message: "User does not exist",
        success: false
      })
    }

    const isfollowing = user.following.includes(followingId);
    if (isfollowing) {
      // unfollow logic
      await Promise.all([
        User.updateOne({_id : followerId}, {$pull: {following: followingId}}),
        User.updateOne({_id : followingId}, {$pull: {followers: followerId}})
      ])
      return res.status(200).json({
        message: "Unfollowed successfully",
        success: true
      })
    } else {
      // follow logic
      await Promise.all([
        User.updateOne({_id : followerId}, {$push: {following: followingId}}),
        User.updateOne({_id : followingId}, {$push: {followers: followerId}})
      ])
      return res.status(200).json({
        message: "Followed successfully",
        success: true
      })
    }
  } catch (error) {
    console.log(error);
  }
}