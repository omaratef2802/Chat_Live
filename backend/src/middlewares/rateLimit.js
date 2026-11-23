const buckets = new Map();
module.exports = ({ windowMs = 15 * 60 * 1000, max = 20 } = {}) => (req,res,next) => {
  const key=req.ip || req.socket.remoteAddress || "unknown";
  const now=Date.now();
  let bucket=buckets.get(key);
  if(!bucket || bucket.resetAt<=now) bucket={count:0,resetAt:now+windowMs};
  bucket.count+=1;
  buckets.set(key,bucket);
  if(buckets.size>10000) for(const [id,value] of buckets) if(value.resetAt<=now) buckets.delete(id);
  res.setHeader("RateLimit-Limit",String(max));
  res.setHeader("RateLimit-Remaining",String(Math.max(0,max-bucket.count)));
  res.setHeader("RateLimit-Reset",String(Math.ceil(bucket.resetAt/1000)));
  if(bucket.count>max) return res.status(429).json({success:false,message:"Too many requests. Please try again later."});
  next();
};
