// const express = require("express");
// const { userAuth } = require("../middleware/auth");
// const profileRouter = express.Router();
// const { validatePassword } = require("../utils/validate");
// const bcrypt = require("bcrypt");
// const { validateFeilds} = require("../utils/validate");
// const { User } = require("../model/users");
// const multer = require("multer");

// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
// });

// profileRouter.get("/profile/view", userAuth, async (req, res) => {
//   try {
//     const user = req.user;

//     res.send(user);
//   } catch (err) {
//     res.status(400).send(`Error: ${err.message}`);
//   }
// });

// profileRouter.patch("/profile/update", userAuth, async (req, res) => {
//   try {
//     validateFeilds(req);

//     const loggedInUser = req.user;

//     console.log(loggedInUser);
//     Object.keys(req.body).forEach((key) => {
//       loggedInUser[key] = req.body[key];
//     });

//     await loggedInUser.save();
//     console.log(loggedInUser);
//     res.send(`${loggedInUser.firstName} your profile is updated!!`);
//   } catch (err) {
//     res.status(400).send(`Error: ${err.message}`);
//   }
// });

// profileRouter.patch("/profile/updatePassword", userAuth, async (req, res) => {
//   try {
//     const { currentPassword, newPassword, confirmPassword } = req.body;
//     if (!currentPassword || !newPassword || !confirmPassword) {
//       throw new Error("Please provide all the required feilds!!");
//     }

//     if (newPassword !== confirmPassword) {
//       throw new Error("New Password and confirm Password isn't same!!");
//     }

//     const loggedInUser = req.user;
//     console.log(loggedInUser);

//     const isMatch = await bcrypt.compare(
//       currentPassword,
//       loggedInUser.password
//     );
//     if (!isMatch) {
//       throw new Error("InCorrect Password!!");
//     }

//     const salted = 10;
//     const salt = await bcrypt.genSalt(salted);
//     const hashingPassword = await bcrypt.hash(newPassword, salt);

//     loggedInUser.password = hashingPassword;

//     await loggedInUser.save();
//     console.log(loggedInUser);

//     res.send("Password Updated Successfully!!");
//   } catch (err) {
//     res.status(400).send(`Error: ${err.message}`);
//   }
// });

// profileRouter.patch(
//   "/profile/password",
//   userAuth,
//   async (req, res) => {
//     try {
//       const userId = req.user._id;
//       const { currentPassword, newPassword } = req.body;

//       // 1. Find the user
//       const user = await User.findById(userId);
//       if (!user) return res.status(404).json({ error: "User not found" });

//       // 2. Verify current password
//       const valid = await user.validatePassword(currentPassword);
//       if (!valid) {
//         return res.status(401).json({ error: "Current password is incorrect" });
//       }

//       // 3. Hash & save the new password
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(newPassword, salt);
//       await user.save();

//       return res.json({ message: "Password updated successfully" });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Server error updating password" });
//     }
//   }
// );

// profileRouter.post(
//   "/user/avatar",
//   userAuth,
//   upload.single("avatar"),
//   async (req, res, next) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ error: "No file uploaded." });
//       }

//       // Save buffer & mimetype on the user document
//       req.user.avatar = {
//         data: req.file.buffer,
//         contentType: req.file.mimetype,
//       };
//       await req.user.save();

//       res.json({ message: "Avatar uploaded successfully." });
//     } catch (err) {
//       next(err);
//     }
//   }
// );

// profileRouter.get("/user/:id/avatar", async (req, res, next) => {
//   try {

//     const user = await User.findById(req.params.id).select("avatar");
//     if (!user || !user.avatar?.data) {
//       return res.status(404).json({ error: "No avatar found." });
//     }
//     res.contentType(user.avatar.contentType).send(user.avatar.data);
//   } catch (err) {
//     next(err);
//   }
// });

// profileRouter.patch(
//   "/user/avatar",
//   userAuth,
//   upload.single("avatar"),
//   async (req, res, next) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ error: "No file uploaded." });
//       }

//       // Save the new avatar buffer & contentType
//       req.user.avatar = {
//         data: req.file.buffer,
//         contentType: req.file.mimetype,
//       };
//       await req.user.save();

//       res.json({ message: "Avatar uploaded successfully." });
//     } catch (err) {
//       next(err);
//     }
//   }
// );

// // DELETE /user/avatar
// // Clears the avatar field on the user document
// profileRouter.delete(
//   "/user/avatar",
//   userAuth,
//   async (req, res, next) => {
//     try {
//       // Remove the avatar object
//       req.user.avatar = undefined;
//       await req.user.save();

//       res.json({ message: "Avatar deleted successfully." });
//     } catch (err) {
//       next(err);
//     }
//   }
// );

// module.exports = profileRouter;


const express = require("express");
const { userAuth } = require("../middleware/auth");
const profileRouter = express.Router();
const { validatePassword } = require("../utils/validate");
const bcrypt = require("bcrypt");
const { validateFeilds } = require("../utils/validate");
const { User } = require("../model/users");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const { password, avatar, ...user } = req.user.toObject();
    const hasAvatar = req.user.avatar && req.user.avatar.data?.length > 0;
    res.json({ ...user, hasAvatar });
  } catch (err) {
    res.status(400).send(`Error: ${err.message}`);
  }
});

profileRouter.patch("/profile/update", userAuth, async (req, res) => {
  try {
    validateFeilds(req);
    Object.assign(req.user, req.body);
    await req.user.save();
    res.json({ message: `${req.user.firstName} your profile is updated!!` });
  } catch (err) {
    res.status(400).send(`Error: ${err.message}`);
  }
});

profileRouter.patch("/profile/updatePassword", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error("Please provide all the required fields!!");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("New Password and Confirm Password aren't the same!!");
    }

    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      throw new Error("Incorrect Password!!");
    }

    const salt = await bcrypt.genSalt(10);
    req.user.password = await bcrypt.hash(newPassword, salt);
    await req.user.save();

    res.send("Password Updated Successfully!!");
  } catch (err) {
    res.status(400).send(`Error: ${err.message}`);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await user.validatePassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error updating password" });
  }
});

const handleAvatarUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    req.user.avatar = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
    await req.user.save();

    res.json({ message: "Avatar uploaded successfully." });
  } catch (err) {
    next(err);
  }
};

profileRouter.post("/user/avatar", userAuth, upload.single("avatar"), handleAvatarUpload);
profileRouter.patch("/user/avatar", userAuth, upload.single("avatar"), handleAvatarUpload);

profileRouter.get("/user/:id/avatar", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("avatar");
    if (!user?.avatar?.data?.length) {
      return res.status(404).json({ error: "No avatar found." });
    }
    res.contentType(user.avatar.contentType).send(user.avatar.data);
  } catch (err) {
    next(err);
  }
});

profileRouter.delete("/user/avatar", userAuth, async (req, res, next) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.json({ message: "Avatar deleted successfully." });
  } catch (err) {
    next(err);
  }
});

module.exports = profileRouter;
