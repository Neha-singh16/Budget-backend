const cookies = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { User } = require("../model/users");

const userAuth = async (req, res, next) => {
  try {
    const {token} = req.cookies;
    if (!token) {
      res.status(401).send("Please login first...");
      return;
    }

const decodeMessage = await jwt.verify(token, 'Nain@$123');
    const { _id } = decodeMessage;

    const user = await User.findOne({ _id });
    if (!user) {
      throw new Error("Invalid User");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
};


module.exports = {
    userAuth,
}