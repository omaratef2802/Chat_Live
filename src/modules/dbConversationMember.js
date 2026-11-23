const mongoose = require("mongoose");

const conversationMemberSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversations",
      required: [true, "Conversation ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User ID is required"],
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: {
      type: Date,
      default: null,
    },
    isMuted: {
      type: Boolean,
      default: false,
    },
    lastReadMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
      default: null,
    },
  },
  { timestamps: true },
);

conversationMemberSchema.index({ conversationId: 1, userId: 1 }, { unique: true });
conversationMemberSchema.index({ userId: 1, leftAt: 1, updatedAt: -1 });
conversationMemberSchema.index({ conversationId: 1, role: 1 });

const conversationMemberModel = mongoose.model("conversationMembers", conversationMemberSchema);

module.exports = conversationMemberModel;
