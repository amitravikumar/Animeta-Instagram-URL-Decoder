const { messages, statusCodes } = require("../configs");
const errorCodeHandlers = require("./errorCodesHandler");

function createLogs(req, err) {
  let userData = "Nil";
  let { body } = req;
  if (body) {
    if (body.password) {
      delete body.password
    }
  }
  if (req.user) {
    userData = req.user;
  }
  req.appLogger.error(
    `IP - ${req.ip} | User : ${userData ? JSON.stringify(userData) : ""
    } | URL : ${req.protocol}://${req.get("host")}${req.originalUrl
    } | ${req.method} | Request : ${JSON.stringify(
      body
    )} | Error : ${err.Error || err.message || "Internal Server Error"}`
  );
}

let Err = {};

Err.createLogsOfInfo = (req, response) => {
  let userData = "Nil";
  let { body } = req;
  if (body) {
    if (body?.password) {
      delete body.password;
    }
  }
  if (req.user) {
    userData = req.user;
  }
  req.appLogger.info(
    `IP - ${req.ip} | User : ${userData ? JSON.stringify(userData) : ""
    } | URL : ${req.protocol}://${req.get("host")}${req.originalUrl} | ${req.method
    } | Request : ${JSON.stringify(body)} | Response : ${JSON.stringify(
      response
    )}`
  );
};
// error handler middleware
// eslint-disable-next-line no-unused-vars
Err.handler = (err, req, res, next) => {
  console.log("err kkkkkkkkkkkkkkkkkkk");
  let transStatus = err.status;
  if (err.error && err.error.details && err.error.isJoi) {
    err.code = statusCodes.HTTP_UNPROCESSABLE_ENTITY;
  }
  console.log("Err.handler", err.code);
  let handler = errorCodeHandlers[err.code];
  console.log("harndler", handler);
  if (handler != undefined) {
    err = handler(err);
  }
  console.log("Handler", err.status, err.message);
  if (!(/PROD/).test(process.env.CONFIG_ARG))
    createLogs(req, err);
  return res.status(err.status || 500).json({
    status: transStatus || err.status || "Error",
    message: err.Error || err.message || "Internal Server Error"
  });
};

Err.errorObjGeneator = (error) => {
  console.log("sdsnf.asndnandndaklnlnddddddd", error.code, error.status);

  let err = new Error();
  err.code = error.code ? error.code : statusCodes.HTTP_INTERNAL_SERVER_ERROR;
  err.message = error.message ? error.message : messages.technicalErr;
  err.status = error.status ? error.status : "Error";

  if (error.original) {
    switch (error.original.code) {
      case "ER_DUP_ENTRY":
        err.code = error.original.code;
        err.message = error.original.sqlMessage;
        break;
      default:
        break;
    }
  }

  err.originalErr = error;
  return err;
};

module.exports = Err;
