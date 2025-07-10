import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token) {
            return res.status(401).json({
                message: "You are not authenticated! Please login to continue.",
                success: false
            })
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
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
    }
}

export default isAuthenticated;