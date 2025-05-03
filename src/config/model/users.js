const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt')
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 50,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalide email address :" + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      maxLength: 100,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Invalide Password:" + value);
        }
      },
    },
    age: {
      type: Number,
    },
    photoUrl: {
      type: String,
      default:
        "https://png.pngtree.com/element_our/20200610/ourmid/pngtree-character-default-avatar-image_2237203.jpg",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function (){
  const user =this;

  const token = jwt.sign({ _id: user._id }, 'Nain@$123', {
    expiresIn: "1D"
  })
  return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const hashingPassword = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    hashingPassword
  );
  return isPasswordValid;
};
const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
