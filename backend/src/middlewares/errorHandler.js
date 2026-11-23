module.exports = (err,req,res,next) => {
  if (res.headersSent) return next(err);
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";
  let details;
  if (err.name === "ValidationError") { statusCode=400; details=Object.values(err.errors).map(item=>({field:item.path,message:item.message})); message="Validation failed"; }
  if (err.name === "CastError") { statusCode=400; message="Invalid value for "+err.path; }
  if (err.code === 11000) { statusCode=409; const field=Object.keys(err.keyPattern||{})[0]||"field"; message=field+" already exists"; }
  if (statusCode>=500 && process.env.NODE_ENV==="production") message="Internal server error";
  if (process.env.NODE_ENV!=="production" && statusCode>=500) console.error(err);
  res.status(statusCode).json({success:false,message,...(details?{details}:{}),...(process.env.NODE_ENV!=="production"&&err.stack?{stack:err.stack}: {})});
};
