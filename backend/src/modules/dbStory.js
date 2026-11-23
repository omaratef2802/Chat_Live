const mongoose = require("mongoose");

const storyMediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    mimeType: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    size: {
      type: Number,
      min: 0,
    },
  },
  { _id: false },
);

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Story owner is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },
    content: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    media: {
      type: storyMediaSchema,
      default: null,
    },
    visibility: {
      type: String,
      enum: ["everyone", "contacts", "selected"],
      default: "contacts",
    },
    allowedViewers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    }],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      required: true,
    },
  },
  { timestamps: true },
);

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ userId: 1, createdAt: -1 });

const storyModel = mongoose.model("stories", storySchema);

module.exports = storyModel;
