const mongoose = require("mongoose");

const conversionSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },
    participants: [
      {
        userld: {
          type: mongoose.Types.ObjectId,
          required: [true, "the userid is required"],
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    groupDetails: {
      Type: Object,
    },
    lastMessage: {
      type: mongoose.Types.ObjectId,
    },
    lastActivityAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const conversionModel = mongoose.model("conversions", conversionSchema);

module.exports = conversionModel;
