// const express = require("express");
// const auth = express.Router();
// const { User } = require("../model/users");
// const { validateSignUp } = require("../utils/validate");
// const bcrypt = require("bcrypt");
// const { userAuth } = require("../middleware/auth");

// auth.post("/signup", async (req, res) => {
//   try {
//     validateSignUp(req);
//     const { firstName, lastName, email, password } = req.body;

//     const saltRounds = 10;
//     const salt = await bcrypt.genSalt(saltRounds);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = new User({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//     });
//      await user.save();
   
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
//     // res.cookie("token", token, { expires: new Date(Date.now() + 900000) });
//      res.cookie("token", token, {
//       httpOnly: true,
//       sameSite: "lax",               
//       secure:  process.env.NODE_ENV === "production",
//       maxAge:  24 * 60 * 60 * 1000,  // 1 day
//       path:    "/",
//     });

//      const { password: _, ...userData } = user.toObject();
//       res.status(201).json(userData);

//     res.send(savedUser);
//   } catch (err) {
//     res.status(400).send(` Error: ${err.message}`);
//   }
// });

// auth.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       throw new Error("Fill all the details!!");
//     }

//     const user = await User.findOne({ email: email });
//     if (!user) {
//       throw new Error("Invalide Credentials!!");
//     }
//     const isPasswordValid = await user.validatePassword(password);
//     if (!isPasswordValid) {
//       throw new Error("Invalid Credentials!!");
//     }
//     if (isPasswordValid) {
//       // const token = await user.getJWT();
//       console.log(token);

//       // res.cookie("token", token, { expires: new Date(Date.now() + 900000) });
//       // res
//       //   .cookie("token", token, {
//       //     httpOnly: true, // prevents JavaScript from reading it (safer)
//       //     sameSite: "lax", // allows sending on top-level navigation & GETs
//       //     // sameSite: "none", secure: true  // if you later deploy to HTTPS
//       //     maxAge: 24 * 60 * 60 * 1000, // e.g. 1 day
//       //     path: "/", // default is "/", but explicit never hurts
//       //   })
//       //   .status(200);

//       // res.send(user);
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

//     // set cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       sameSite: "lax",
//       secure:  process.env.NODE_ENV === "production",
//       maxAge:  24 * 60 * 60 * 1000,
//       path:    "/",
//     });

//     // respond with user (omit password)
//     const { password: _, ...userData } = user.toObject();
//      res.json(userData);
//     }
//   } catch (err) {
//     res.status(400).send(` Error: ${err.message}`);
//   }
// });

// auth.post("/logout", async (req, res) => {
//   try {
//     res.cookie("token", null, { expires: new Date(Date.now()) });
//     res.send("User Is logged Out successfully!!");
    
//     res.json({ success: true, message: "Logged out" });
//   } catch (err) {
//     res.status(400).send(` Error: ${err.message}`);
//   }
// });


// module.exports = auth;



// src/routes/authRouter.js
const express = require("express");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");
const { User } = require("../model/users");
const { validateSignUp } = require("../utils/validate");
const { userAuth } = require("../middleware/auth");

const authRouter = express.Router();

// ─── SIGN UP ───────────────────────────────────────────
authRouter.post("/signup", async (req, res) => {
  try {
    // Validate payload (throws on failure)
    validateSignUp(req);

    const { firstName, lastName, email, password } = req.body;

    // Hash the password
    const saltRounds     = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create & save
    const user = new User({ firstName, lastName, email, password: hashedPassword });
    await user.save();

    // Issue JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Set HTTP‑only cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure:  process.env.NODE_ENV === "production",
      maxAge:  24 * 60 * 60 * 1000,
      path:    "/",
    });

    // Return user (sans password)
    const { password: _, ...userData } = user.toObject();
    res.status(201).json(userData);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── LOGIN ────────────────────────────────────────────
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid credentials");
    }

    // Issue JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure:  process.env.NODE_ENV === "production",
      maxAge:  24 * 60 * 60 * 1000,
      path:    "/",
    });

    // Return user (sans password)
    const { password: _, ...userData } = user.toObject();
    res.json(userData);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── LOGOUT ───────────────────────────────────────────
authRouter.post("/logout", userAuth, (req, res) => {
  // Clear the cookie
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure:  process.env.NODE_ENV === "production",
    path:    "/",
  });
  res.json({ success: true, message: "Logged out" });
});

module.exports = authRouter;
