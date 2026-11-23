const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Chat Live backend" });
});

app.use("/api/v1/health", healthRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
