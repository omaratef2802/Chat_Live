const mongoose = require("mongoose");

const storySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: [true, "the userid is required"],
    },
    type: {
      type: String,
      enum: ["text", "video", "audio", "photo"],
      default: "text",
    },
    content: {
      type: String,
      default: null,
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    views: [
      {
        userld: {
          type: mongoose.Types.ObjectId,
          required: [true, "the userid is required"],
        },
        viewedAt: {
          type: Date,
        },
      },
    ],
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const storyModel = mongoose.Types.ObjectId;

module.exports = storyModel;
