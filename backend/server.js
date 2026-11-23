require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { app } = require("./src/app");
const connectDb = require("./src/config/connectDb");
const attachSocket = require("./src/realtime/socket");
(async () => {
  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET must be configured");
    await connectDb();
    const server = http.createServer(app);
    const origins = (process.env.CORS_ORIGIN || process.env.CLIENT_URL || "*").split(",").map(x => x.trim());
    const io = new Server(server, { cors: { origin: origins.includes("*") ? "*" : origins, credentials: true } });
    attachSocket(io);
    const port = Number(process.env.PORT || 3000);
    server.listen(port, () => console.log(`Chat Live API and Socket.IO listening on port ${port}`));
    process.on("SIGINT", () => server.close(() => process.exit(0)));
    process.on("SIGTERM", () => server.close(() => process.exit(0)));
  } catch (error) { console.error("Failed to start Chat Live backend:", error.message); process.exit(1); }
})();
