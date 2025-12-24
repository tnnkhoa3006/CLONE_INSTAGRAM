// instagram_backend/middlewares/isAuthenticated.js
import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        // Ưu tiên đọc từ cookie, nếu không có thì đọc từ Authorization header
        let token = req.cookies.token;
        
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        
        if(!token) {
            return res.status(401).json({
                message: "You are not authenticated! Please login to continue.",
                success: false
            })
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                message: "You are not authenticated! Please login to continue.",
                success: false
            })
        }
        req.id = decoded.id;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false
        });
    }
}

export default isAuthenticated;