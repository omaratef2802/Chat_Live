const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Contact owner is required"],
    },
    contactUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Contact user is required"],
    },
    nickname: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

contactSchema.index({ ownerId: 1, contactUserId: 1 }, { unique: true });
contactSchema.index({ ownerId: 1, updatedAt: -1 });

const contactModel = mongoose.model("contacts", contactSchema);

module.exports = contactModel;
