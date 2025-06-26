// const mongoose = require("mongoose");
// const validator = require("validator");
// const jwt = require("jsonwebtoken");

// const bcrypt = require("bcrypt");

// const userSchema = mongoose.Schema(
//   {
//     firstName: {
//       type: String,
//       required: true,
//       minLength: 3,
//       maxLength: 100,
//     },
//     lastName: {
//       type: String,
//       minLength: 3,
//       maxLength: 50,
//     },
//     email: {
//       type: String,
//       unique: true,
//       required: true,
//       validate(value) {
//         if (!validator.isEmail(value)) {
//           throw new Error("Invalide email address :" + value);
//         }
//       },
//     },
//     password: {
//       type: String,
//       required: true,
//       minLength: 8,
//       maxLength: 100,
//       validate(value) {
//         if (!validator.isStrongPassword(value)) {
//           throw new Error("Invalide Password:" + value);
//         }
//       },
//     },
//     age: {
//       type: Number,
//     },
//     dob: {
//       type: Date,
//     },

//     avatar: {
//       data: Buffer,
//       contentType: String,
//     },
//     // phoneNo: {
//     //   type: Number,
//     //   validate(value) {
//     //     if (!validator.isMobilePhone(value.toString(), "any")) {
//     //       throw new Error("Invalid phone number: " + value);
//     //     }
//     //   },
//     // },

//      phoneNo: {
//     type: Number,
//     validate: {
//       validator: function(v) {
//         // allow absent or null/undefined
//         if (v == null) return true;
//         // otherwise, string‑ify and validate
//         return validator.isMobilePhone(v.toString(), "any");
//       },
//       message: props => `Invalid phone number: ${props.value}`,
//     },
//   },
//     address: {
//       type: String,
//       default: "Not provided",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// userSchema.virtual("photoUrl").get(function() {
//   // if they’ve uploaded an avatar, point at your GET /user/:id/avatar
//   if (this.avatar && this.avatar.data) {
//     const base = process.env.BASE_URL || "http://localhost:3000";
//     return `${base}/user/${this._id}/avatar`;
//   }
//   // otherwise fall back to a placeholder
//   return "https://cdn.vectorstock.com/i/500p/66/13/default-avatar-profile-icon-social-media-user-vector-49816613.jpg";
// });

// userSchema.methods.getJWT = async function () {
//   const user = this;

//   const token = jwt.sign({ _id: user._id }, "Nain@$123", {
//     expiresIn: "1D",
//   });
//   return token;
// };

// userSchema.methods.validatePassword = async function (passwordInputByUser) {
//   const user = this;
//   const hashingPassword = user.password;

//   const isPasswordValid = await bcrypt.compare(
//     passwordInputByUser,
//     hashingPassword
//   );
//   return isPasswordValid;
// };
// const User = mongoose.model("User", userSchema);

// module.exports = {
//   User,
// };

const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minlength: 3, maxlength: 100 },
    lastName: { type: String, minlength: 3, maxlength: 50 },
    email: {
      type: String,
      unique: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 100,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Weak password");
        }
      },
    },
    dob: Date,
    avatar: {
      data: Buffer,
      contentType: String,
    },
    photoUrl: {
      type: String,
      default:
        "https://cdn.vectorstock.com/i/500p/66/13/default-avatar-profile-icon-social-media-user-vector-49816613.jpg",
    },
    phoneNo: {
      type: Number,
      validate: {
        validator(v) {
          if (v == null) return true;
          return validator.isMobilePhone(v.toString(), "any");
        },
        message: (props) => `Invalid phone number: ${props.value}`,
      },
    },
    address: { type: String, default: "Not provided" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.methods.getJWT = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET || "Nain@$123", {
    expiresIn: "1d",
  });
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = { User };
