
// src/routes/profileRouter.js
const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const { User } = require("../model/users");
const { userAuth } = require("../middleware/auth");
const { validateFeilds } = require("../utils/validate");

const profileRouter = express.Router();

// multer memory storage for avatar uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// — GET /profile/view — return current user (minus password)
// profileRouter.get("/profile/view", userAuth, async (req, res) => {
//   //   const { password, avatar, ...userData } = req.user.toObject();
//   //   res.json(userData);
//   // });

//   try {
//     // // Strip out sensitive fields
//     // const { password, avatar, ...userData } = req.user.toObject();
//     // const hasAvatar = req.user.avatar && req.user.avatar.data;
//     // res.json({
//     //   ...userData,

//     //   hasAvatar,

//     // });

//     const { password, avatar, ...userData } = req.user.toObject();
//     res.json({
//       ...userData,
//       avatarUrl: userData.avatar?.data
//         ? `/user/${req.user._id}/avatar`
//         : userData.photoUrl,
//     });
//   } catch (err) {
//     res.status(400).send(`Error: ${err.message}`);
//   }
// });



profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const { password, avatar, ...u } = req.user.toObject();
    res.json({
      ...u,
      hasAvatar: Boolean(avatar && avatar.data?.length)
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
// — PATCH /profile/update — update text fields
profileRouter.patch("/profile/update", userAuth, async (req, res) => {
  validateFeilds(req);
  Object.assign(req.user, req.body);
  await req.user.save();
  res.json({ message: "Profile updated" });
});

// — PATCH /profile/updatePassword — change password
profileRouter.patch("/profile/updatePassword", userAuth, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "All fields required" });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  const match = await bcrypt.compare(currentPassword, req.user.password);
  if (!match) {
    return res.status(401).json({ error: "Current password incorrect" });
  }
  const salt = await bcrypt.genSalt(10);
  req.user.password = await bcrypt.hash(newPassword, salt);
  await req.user.save();
  res.json({ message: "Password updated" });
});

// — POST   /user/avatar — upload new avatar
profileRouter.post(
  "/user/avatar",
  userAuth,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    req.user.avatar = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
    await req.user.save();
    res.json({ message: "Avatar uploaded" });
  }
);

// — PATCH  /user/avatar — replace existing avatar
// profileRouter.patch(
//   "/user/avatar",
//   userAuth,
//   upload.single("avatar"),
//   async (req, res) => {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded." });
//     }
//     req.user.avatar = {
//       data: req.file.buffer,
//       contentType: req.file.mimetype,
//     };
//     await req.user.save();
//     res.json({ message: "Avatar replaced" });
//   }
// );

profileRouter.patch(
  "/user/avatar",
  userAuth,
  upload.single("avatar"),
  async (req, res) => {
    console.log(
      "🖼️  Got upload:",
      req.file && req.file.mimetype,
      req.file && req.file.size
    );
    req.user.avatar = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
    await req.user.save();
    console.log("✅  Saved avatar for", req.user._id);
    res.json({ message: "Avatar replaced" });
  }
);

// — DELETE /user/avatar — remove avatar
profileRouter.delete("/user/avatar", userAuth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.json({ message: "Avatar deleted" });
});

// — GET /user/:id/avatar — serve the stored avatar binary
profileRouter.get("/user/:id/avatar", async (req, res) => {
  const user = await User.findById(req.params.id).select("avatar");
  if (!user?.avatar?.data) {
    return res.status(404).end();
  }
  res.contentType(user.avatar.contentType).send(user.avatar.data);
});

module.exports = profileRouter;
