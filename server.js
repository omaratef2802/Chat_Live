require("dotenv").config();
const { app } = require("./src/app");
const configDb = require("./src/config/connectDb");

(async () => {
  await configDb();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log("the server run on the " + port);
  });
})();
