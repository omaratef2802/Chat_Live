const jwt = require("jsonwebtoken");
const User = require("../modules/dbUsers");
const Device = require("../modules/dbLinkedDevice");
const Member = require("../modules/dbConversationMember");
const Message = require("../modules/dbMessages");
const Conversation = require("../modules/dbConversation");
const Block = require("../modules/dbBlock");
const Notification = require("../modules/dbNotification");

module.exports = (io) => {
  io.use(async (socket,next) => {
    try {
      const token=socket.handshake.auth?.token;
      if(!token) return next(new Error("Authentication required"));
      const payload=jwt.verify(token,process.env.JWT_SECRET);
      const user=await User.findById(payload.id).select("_id username");
      if(!user) return next(new Error("User not found"));
      if(payload.deviceId) {
        const device=await Device.findOne({_id:payload.deviceId,userId:user._id,isActive:true,revokedAt:null});
        if(!device) return next(new Error("Device has been revoked"));
        socket.data.deviceId=device._id;
        await Device.updateOne({_id:device._id},{$set:{lastActiveAt:new Date()}});
      }
      socket.user=user;
      next();
    } catch { next(new Error("Invalid or expired token")); }
  });

  io.on("connection",async(socket)=>{
    const userId=socket.user._id;
    socket.join(String(userId));
    await User.updateOne({_id:userId},{$set:{isOnline:true,lastSeen:new Date()}});
    const memberships=await Member.find({userId,leftAt:null}).select("conversationId");
    memberships.forEach(member=>socket.join(String(member.conversationId)));

    socket.on("conversation:join",async(data={},ack=()=>{})=>{
      try {
        const conversationId=data.conversationId;
        if(socket.data.deviceId && !await Device.exists({_id:socket.data.deviceId,userId,isActive:true,revokedAt:null})) return ack({success:false,message:"Device has been revoked"});
        const member=await Member.exists({conversationId,userId,leftAt:null});
        if(!member) return ack({success:false,message:"Not a conversation member"});
        socket.join(String(conversationId));
        ack({success:true});
      } catch(error) { ack({success:false,message:error.message}); }
    });

    socket.on("message:send",async(data={},ack=()=>{})=>{
      try {
        const {conversationId}=data;
        const type=data.type||"text";
        if(!conversationId) return ack({success:false,message:"conversationId is required"});
        if(socket.data.deviceId && !await Device.exists({_id:socket.data.deviceId,userId,isActive:true,revokedAt:null})) return ack({success:false,message:"Device has been revoked"});
        if(!["text","image","video","audio","file"].includes(type)) return ack({success:false,message:"Invalid message type"});
        if(type!=="text"&&!data.media) return ack({success:false,message:"Media metadata is required"});
        if(type==="text"&&!String(data.content||"").trim()) return ack({success:false,message:"Message content is required"});
        const member=await Member.exists({conversationId,userId,leftAt:null});
        if(!member) return ack({success:false,message:"Not a conversation member"});
        const conversation=await Conversation.findById(conversationId);
        if(!conversation) return ack({success:false,message:"Conversation not found"});
        if(conversation.type==="private") {
          const participants=await Member.find({conversationId,leftAt:null}).select("userId");
          if(participants.length===2 && await Block.exists({$or:[
            {blockerId:participants[0].userId,blockedUserId:participants[1].userId},
            {blockerId:participants[1].userId,blockedUserId:participants[0].userId}
          ]})) return ack({success:false,message:"Messaging is unavailable because one user blocked the other"});
        }
        if(data.replyTo && !await Message.exists({_id:data.replyTo,conversationId})) return ack({success:false,message:"Reply target not found in this conversation"});
        const message=await Message.create({conversationId,senderId:userId,type,content:data.content||"",media:data.media||null,replyTo:data.replyTo||null});
        await Conversation.updateOne({_id:conversationId},{$set:{lastMessage:message._id,lastActivityAt:new Date()}});
        io.to(String(conversationId)).emit("message:new",message);
        if(conversation.type==="private") { const recipients=await Member.find({conversationId,leftAt:null,userId:{$ne:userId}}).select("userId"); if(recipients.length) await Notification.insertMany(recipients.map(item=>({recipientId:item.userId,senderId:userId,type:"message",content:"New message",relatedId:message._id,relatedType:"message"}))); }
        ack({success:true,message});
      } catch(error) { ack({success:false,message:error.message}); }
    });

    socket.on("typing:start",async(data={})=>{
      if(socket.data.deviceId && !await Device.exists({_id:socket.data.deviceId,userId,isActive:true,revokedAt:null})) return;
      if(await Member.exists({conversationId:data.conversationId,userId,leftAt:null}))
        socket.to(String(data.conversationId)).emit("typing:start",{conversationId:data.conversationId,userId});
    });
    socket.on("typing:stop",async(data={})=>{
      if(socket.data.deviceId && !await Device.exists({_id:socket.data.deviceId,userId,isActive:true,revokedAt:null})) return;
      if(await Member.exists({conversationId:data.conversationId,userId,leftAt:null}))
        socket.to(String(data.conversationId)).emit("typing:stop",{conversationId:data.conversationId,userId});
    });

    socket.on("disconnect",async()=>{
      const remaining=await io.in(String(userId)).fetchSockets();
      if(remaining.length===0) await User.updateOne({_id:userId},{$set:{isOnline:false,lastSeen:new Date()}});
    });
  });
};
