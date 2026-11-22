const mongoose = require("mongoose");

const otpSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      unique: [true, "the userId must be unique"],
      required: [true, "the userId is required"],
    },
    otp: {
      type: String,
      minLength: 6,
    },
    purpose: {
      type: String,
      enum: ["verify", "reset"],
      default: "verify",
    },
    expiresAt: {
      type: Date,
    },
    attempt: {
      type: Number,
      MaxLenght: 3,
    },
  },
  { timestamps: true },
);

const otpModel = mongoose.model("otps", otpSchema);

module.exports = otpModel;
