const express = require("express");
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  next("the router is bot found");
});

// app.use((err,req,res,next)=>{
//     // err.statusCode =
// })

module.exports = { app };
