const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "video", "audio", "file", "react"],
      default: "text",
    },
    forwardedFrom: {
      type: mongoose.Types.ObjectId,
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    senderId: {
      type: mongoose.Types.ObjectId,
      required: [true, "the sender Id is required"],
    },
    replyTo: {
      type: mongoose.Types.ObjectId,
    },
    conversationld: {
      type: mongoose.Types.ObjectId,
    },
    content: {
      type: String,
      default: "",
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const messageModel = mongoose.model("messages", messageSchema);

module.exports = messageModel;
