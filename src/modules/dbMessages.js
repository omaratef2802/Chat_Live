const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
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
    thumbnailUrl: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      min: 0,
    },
  },
  { _id: false },
);

const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    emoji: {
      type: String,
      required: true,
      maxlength: 16,
    },
    reactedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file"],
      default: "text",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Sender ID is required"],
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversations",
      required: [true, "Conversation ID is required"],
    },
    content: {
      type: String,
      trim: true,
      default: "",
      maxlength: 10000,
    },
    media: {
      type: mediaSchema,
      default: null,
    },
    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
      default: null,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
      default: null,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedFor: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    }],
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

const messageModel = mongoose.model("messages", messageSchema);

module.exports = messageModel;
