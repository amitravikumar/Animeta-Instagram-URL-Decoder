// const codeMsgs = require("./../configs/codeMsgs");
const errorCodeHandlers = require("./errorCodesHandler");
// const CONSTANTS = require("./../constants");
const logs = require("./errorHandler");
// let momenttz = require("moment-timezone");
// response class
class Response {
  // triggering a success response
  //
  success(req, res, status, data, message) {
    data = data ? data : undefined;
    message = message ? message : "success";
    //this.createLogs({ status, req, data, message })
    let response = {
      status,
      message,
      data
    };
    if (!(/PROD/).test(process.env.CONFIG_ARG))
      logs.createLogsOfInfo(req, response);

    return res.status(status).json(response);
  }

  // triggering a error response
  errors(req, res, status, data, message) {
    console.log("Sending Error Response");
    let response = {
      status,
      message,
      data: data || undefined
    };
    if (!(/PROD/).test(process.env.CONFIG_ARG))
      logs.createLogsOfInfo(req, response);

    return res.status(status).json(response);
  }

  //   handler(err, req, res) {
  //     //console.log('err', err)
  //     let transStatus = err.status;
  //     if (err.error && err.error.details && err.error.isJoi) {
  //       err.code = "Unprocessable Entity";
  //     }
  //     console.log(err.code);
  //     let handler = errorCodeHandlers[err.code];
  //     console.log("harndler", handler);
  //     if (handler != undefined) {
  //       err = handler(err);
  //     }
  //     console.log(err.status, err.message);
  //     this.createLogs({ status, req, message });
  //     return res.status(err.status || 500).json({
  //       success: false,
  //       status: transStatus || "Error",
  //       message: err.message || "Internal Server Error",
  //       Error: err.Error ? err.Error : undefined
  //     });
  //   }

  async errorObjGeneator(error) {
    console.log("Inside Error object generator", error.code, error.status);

    let err = new Error();
    err.code = error.code ? error.code : 500;
    err.message = error.message ? error.message : "Technical Error";
    err.status = error.status ? error.status : "Error";

    if (error.original) {
      switch (error.original.code) {
        case "ER_DUP_ENTRY":
          var resp = await errorCodeHandlers[error.original.code](
            error.original
          );
          console.log("Response", resp);
          err.code = resp.status;
          err.message = resp.message;
          break;
        default:
          break;
      }
    }

    err.originalErr = error;
    return err;
  }

  // triggering a joi error response
  joierrors(req, res, err) {
    let error = err.details.reduce((prev, curr) => {
      prev[curr.path[0]] = curr.message.replace(/"/g, "");
      return prev;
    }, {});
    let message = "Bad Request";

    let status = 400;
    // req.appLogger.error(`URL : ${req.protocol}://${req.get('host')}${req.originalUrl} | Request : ${JSON.stringify(req.value ? req.value : {})} | BadRequestError : ${JSON.stringify(error)}`)
    this.createLogs({ status, req, message });

    return res.status(status).json({
      success: false,
      status,
      message,
      error
    });
  }

  joicustomerrors(req, res, err) {
    let error = err.details.reduce((prev, curr) => {
      // prev[curr.path[0]] = curr.message.replace(/"/g, '');
      return curr.message.replace(/"/g, "");
    }, {});
    let message = error; //messageTypes.joiValidation.badRequest;
    let status = status.HTTP_BAD_REQUEST;
    // req.appLogger.error(`URL : ${req.protocol}://${req.get('host')}${req.originalUrl} | Request : ${JSON.stringify(req.value ? req.value : {})} | BadRequestError : ${JSON.stringify(error)}`)
    this.createLogs({ status, req, message });
    return res.status(status).json({
      success: false,
      status,
      message,
      error
    });
  }

  createLogs({ status, req, data, message }) {
    if (status == 200) {
      req.appLogger.info(
        `URL : ${req.protocol}://${req.get("host")}${req.originalUrl
        } | Request : ${JSON.stringify(
          req.value ? req.value : {}
        )} | Response :  ${JSON.stringify(data)}`
      );
    } else {
      req.appLogger.error(
        `URL : ${req.protocol}://${req.get("host")}${req.originalUrl
        } | Request : ${JSON.stringify(
          req.value ? req.value : {}
        )} | Error : ${message}`
      );
    }
  }
}

// exporting the module
module.exports = new Response();
