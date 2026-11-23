const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      required: true,
      default: "private",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    directKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    groupDetails: {
      name: {
        type: String,
        trim: true,
        maxlength: 80,
      },
      description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },
      image: {
        type: String,
        default: "",
      },
      imagePublicId: {
        type: String,
        default: "",
      },
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

conversationSchema.index({ lastActivityAt: -1 });

conversationSchema.pre("validate", function () {
  if (this.type === "group" && !this.groupDetails?.name) {
    this.invalidate("groupDetails.name", "Group name is required");
  }

  if (this.type === "private" && !this.directKey) {
    this.invalidate("directKey", "Private conversations require a direct key");
  }

  if (this.type === "group") {
    this.directKey = undefined;
  }
});

const conversationModel = mongoose.model("conversations", conversationSchema, "conversions");

module.exports = conversationModel;
