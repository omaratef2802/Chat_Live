const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Notification recipient is required"],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    readAt: {
      type: Date,
      default: null,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedType: {
      type: String,
      enum: ["conversation", "message", "story", "group", "user"],
      default: null,
    },
    type: {
      type: String,
      enum: [
        "message",
        "mention",
        "reaction",
        "group-invite",
        "group-update",
        "story-view",
        "contact-request",
        "system",
      ],
      required: true,
    },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const notificationModel = mongoose.model("notifications", notificationSchema);

module.exports = notificationModel;
