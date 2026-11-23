const mongoose = require("mongoose");

const storyViewSchema = new mongoose.Schema(
  {
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stories",
      required: [true, "Story ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Viewer ID is required"],
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

storyViewSchema.index({ storyId: 1, userId: 1 }, { unique: true });
storyViewSchema.index({ userId: 1, viewedAt: -1 });

const storyViewModel = mongoose.model("storyViews", storyViewSchema);

module.exports = storyViewModel;
