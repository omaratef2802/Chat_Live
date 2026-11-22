const mongoose = require("mongoose");

const linkedDeviceSchema = mongoose.Schema(
  {
    userld: {
      type: mongoose.Schema.ObjectId,
      required: [true, "the user id is required"],
    },
    deviceName: {
      type: String,
      required: [true, "the device name is required"],
    },
    deviceType: {
      type: String,
      default: "mobile",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: new Date(),
    },
  },
  { timestamps: true },
);

const linkedDeviceModel = mongoose.model("linkedDevices", linkedDeviceSchema);

module.exports = linkedDeviceModel;
