const mongoose = require("mongoose");

const linkedDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User ID is required"],
      index: true,
    },
    deviceName: {
      type: String,
      required: [true, "Device name is required"],
      trim: true,
      maxlength: 100,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "browser"],
      default: "browser",
    },
    deviceId: {
      type: String,
      trim: true,
      sparse: true,
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    userAgent: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

linkedDeviceSchema.index({ userId: 1, isActive: 1 });

const linkedDeviceModel = mongoose.model("linkedDevices", linkedDeviceSchema);

module.exports = linkedDeviceModel;
