const { USER_TYPE } = require('./../constants')
const initializeRoutes = (app) => {
  app.use("/api/v1/user", require("./v1/user.routes"));
  app.use("/api/v1/instagram", require("./v1/instagramUrlFetcher.routes"));
};

module.exports = initializeRoutes;
