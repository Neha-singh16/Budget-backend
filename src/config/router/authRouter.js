const express = require("express");
const auth = express.Router();
const { User } = require("../model/users");
const { validateSignUp } = require("../utils/validate");
const bcrypt = require("bcrypt");

auth.post("/signup", async (req, res) => {
  try {
    validateSignUp(req);
    const { firstName, lastName, email, password } = req.body;

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.send("The user is signed Up!!");
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});

auth.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Fill all the details!!");
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalide Credentials!!");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();
      console.log(token);

      res.cookie("token", token, { expires: new Date(Date.now() + 900000) });
      res.send(user);
    }
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});

auth.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.send("User Is logged Out successfully!!");
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});

module.exports = auth;
