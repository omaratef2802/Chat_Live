const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    blockerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Blocker user is required"],
    },
    blockedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Blocked user is required"],
    },
  },
  { timestamps: true },
);

blockSchema.index({ blockerId: 1, blockedUserId: 1 }, { unique: true });
blockSchema.index({ blockedUserId: 1 });

const blockModel = mongoose.model("blocks", blockSchema);

module.exports = blockModel;
