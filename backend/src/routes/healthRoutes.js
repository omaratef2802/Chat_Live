const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
router.get("/", (req,res) => res.status(200).json({ success:true, service:"chat-live-api", status:"ok", database:mongoose.connection.readyState===1?"connected":"disconnected", timestamp:new Date().toISOString() }));
module.exports = router;
