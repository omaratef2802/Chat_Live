const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "the full name is required"],
      minLength: 3,
      maxLength: 30,
    },
    lastName: {
      type: String,
      required: [true, "the the last name is required"],
      minLength: 3,
      maxLength: 30,
    },
    email: {
      type: String,
      required: [true, "the email is required"],
      validate: {
        validator: (email) =>
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
        message: (obj) => `${obj.value} is not valid`,
      },
      unique: [true, "the email must be unique"],
    },
    phone: {
      type: String,
      required: [true, "the phone is required"],
      maxLength: 11,
      unique: [true, "the phone number must be unique"],
    },
    password: {
      type: String,
      required: [true, "the password must be unique"],
    },
    username: {
      type: String,
      unique: [true, "the username must be unique"],
      required: [true, "the username is required"],
      minLength: 5,
      maxLength: 50,
    },
    profile: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: new Date(),
    },
    blockedUsers: {
      type: mongoose.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true },
);
userSchema.pre("save", function () {
  if (this.password && isModified(this.password)) {
    this.password = bcrypt.genSalt(10, this.password);
  }
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
