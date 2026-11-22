const mongoose = require("mongoose");

const contactSchema = mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["blocked", "active"],
      default: "active",
    },
    ownerId: {
      type: mongoose.Types.ObjectId,
      required: [true, "the owenrid is requierd"],
    },
    contactUserId: {
      type: mongoose.Types.ObjectId,
      required: [true, "the owenrid is requierd"],
    },
  },

  { timestamps: true },
);
const contactModel = mongoose.model("contacts", contactSchema);

module.exports = contactModel;
