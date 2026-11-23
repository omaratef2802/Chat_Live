const jwt = require("jsonwebtoken");
const User = require("../modules/dbUsers");
const Member = require("../modules/dbConversationMember");
const Message = require("../modules/dbMessages");
const Conversation = require("../modules/dbConversation");
module.exports = (io) => {
  io.use(async (socket, next) => { try { const token = socket.handshake.auth?.token; if (!token) return next(new Error("Authentication required")); const payload = jwt.verify(token, process.env.JWT_SECRET); const user = await User.findById(payload.id).select("_id username"); if (!user) return next(new Error("User not found")); socket.user = user; next(); } catch { next(new Error("Invalid token")); } });
  io.on("connection", async (socket) => {
    const userId = socket.user._id; socket.join(String(userId)); await User.updateOne({ _id: userId }, { isOnline: true, lastSeen: new Date() });
    const memberships = await Member.find({ userId, leftAt: null }).select("conversationId"); memberships.forEach(m => socket.join(String(m.conversationId)));
    socket.on("message:send", async (data, ack = () => {}) => { try { const member = await Member.exists({ conversationId: data.conversationId, userId, leftAt: null }); if (!member) return ack({ success: false, message: "Not a conversation member" }); const message = await Message.create({ conversationId: data.conversationId, senderId: userId, type: data.type || "text", content: data.content || "", media: data.media || null, replyTo: data.replyTo || null }); await Conversation.updateOne({ _id: data.conversationId }, { lastMessage: message._id, lastActivityAt: new Date() }); io.to(String(data.conversationId)).emit("message:new", message); ack({ success: true, message }); } catch (error) { ack({ success: false, message: error.message }); } });
    socket.on("typing:start", async ({ conversationId }) => { if (await Member.exists({ conversationId, userId, leftAt: null })) socket.to(String(conversationId)).emit("typing:start", { conversationId, userId }); });
    socket.on("typing:stop", async ({ conversationId }) => { if (await Member.exists({ conversationId, userId, leftAt: null })) socket.to(String(conversationId)).emit("typing:stop", { conversationId, userId }); });
    socket.on("disconnect", async () => { const remaining = await User.db.collection("users").findOne({ _id: userId }); if (remaining) await User.updateOne({ _id: userId }, { isOnline: false, lastSeen: new Date() }); });
  });
};
