const { statusCodes, thirdpartyConfig } = require("./../configs");
const { userService } = require(`../services/${thirdpartyConfig.DB_CHOICE?.toLowerCase()}`);
// const { InternalServices } = require("./../apiServices");
const jwt = require("jsonwebtoken");
const unAuthorizedResponse = {
  status: statusCodes.HTTP_UNAUTHORIZED,
  message: "unauthorized"
};
module.exports = {
  validateToken: async (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      console.log(token)
      if (!token) {
        next(unAuthorizedResponse);
      }

      jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
          next(unAuthorizedResponse);
        }
        req.user = user;
        if (user?.skipSession) {
          next(unAuthorizedResponse);
        }
        // if (user?.skipSession == false) {
        if (!user?.sessionId) {
          next(unAuthorizedResponse);
        }
        //Validate system role
        // let [getSystemRole, getSessionData] = await Promise.all([
        //   await userService.getMultipleSystemRoles(req?.userType),
        //   await userService.getSessionData(req?.user?.sessionId)
        // ])
        let getSessionData = await userService.getSessionData(user?.sessionId)

        if (!getSessionData)
          next(unAuthorizedResponse);
        // let verifyRole = getSystemRole.find(obj => obj._id == req?.user?.systemRole)
        // if (!verifyRole)
        //   next(unAuthorizedResponse);
        // req.user.userType = req?.userType;
        next();
        // } else {
        // }
      });
    } catch (err) {
      console.log("error msgs", err.message);
      next(unAuthorizedResponse);
    }
  },
  validateTokenResetToken: async (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      console.log(token)
      if (!token) {
        next(unAuthorizedResponse);
      }

      jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
          next(unAuthorizedResponse);
        }
        console.log(user)
        if (!user?.skipSession) {
          next(unAuthorizedResponse);
        }
        req.user = user;
        next()
        // }
      });
    } catch (err) {
      console.log("error msgs", err.message);
      next(unAuthorizedResponse);
    }
  }
};
