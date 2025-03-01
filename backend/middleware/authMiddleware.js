const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ msg: "Access denied. No token provided." });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        console.error(" Invalid Token:", err.message);
        res.status(401).json({ msg: "Invalid token. Authentication failed." });
    }
};

module.exports = authMiddleware;