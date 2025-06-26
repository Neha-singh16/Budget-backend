// src/middleware/authenticate.js
const jwt = require("jsonwebtoken");
const { User } = require("../model/users");

async function userAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
          
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(403).json({ error: "Invalid or expired session" });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = user;
    next();

  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: "Server error during authentication" });
  }
}

module.exports = { userAuth };
