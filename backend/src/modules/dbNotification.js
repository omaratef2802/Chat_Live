const mongoose = require("mongoose");

const notoficationSchema = mongoose.Schema({
  senderld: {
    type: mongoose.Types.ObjectId,
    required: [true, "the senderId is required"],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  content: {
    type: String,
    default: "",
  },
  readAt: {
    type: Date,
  },
  relatedId: {
    type: mongoose.Types.ObjectId,
  },
  type: {
    type: String,
    enum: ["message", "mention", "react"],
  },
});

const notoficationModel = mongoose.model("notofication", notoficationSchema);

module.exports = notoficationModel;
