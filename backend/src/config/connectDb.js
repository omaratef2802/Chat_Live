const mongoose = require("mongoose");
const connectDb = async () => {
  const urlDatabase =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chat_live";
  await mongoose.connect(urlDatabase);
  console.log("Successfully connected to MongoDB");
};

module.exports = connectDb;
