require("winston-daily-rotate-file");
const path = require("path");
console.log(path.resolve("./src/logs"));
var winston = require("winston");
var requestId = guid();
var fileStack = "";

//Generate a random request ID for identification
function guid() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 32; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

class CustomLogger {
  constructor() {
    console.log("log file creating");
    winston.loggers.add("logger", {
      transports: [
        //new files will be generated each day, the date pattern indicates the frequency of creating a file.
        new winston.transports.DailyRotateFile({
          name: "debug-log",
          filename: "./src/logs/API-Logger-%DATE%.log",
          prepend: true,
          datePattern: "YYYY-MM-DD",
          format: winston.format.printf(
            (info) => `${this.getFormattedDate()} | ${fileStack} | ${requestId} | [${info.level
              }] | ${info.message}`
          )
        })
      ]
    });
    winston.loggers.add("errorLogger", {
      transports: [
        //new files will be generated each day, the date pattern indicates the frequency of creating a file.
        new winston.transports.DailyRotateFile({
          name: "debug-log",
          filename: "./src/logs/Error-Logger-%DATE%.log",
          prepend: true,
          datePattern: "YYYY-MM-DD",
          format: winston.format.printf(
            (info) => `${this.getFormattedDate()} | ${fileStack} | ${requestId} | [${info.level
              }] | ${info.message}`
          )
        })
      ]
    });
    winston.loggers.add("consoleLogger", {
      transports: [
        //new files will be generated each day, the date pattern indicates the frequency of creating a file.
        new winston.transports.DailyRotateFile({
          name: "debug-log",
          filename: "./src/logs/Console-Logger-%DATE%.log",
          prepend: true,
          datePattern: "YYYY-MM-DD",
          format: winston.format.printf(
            (info) => `${this.getFormattedDate()} | ${fileStack} | ${requestId} | [${info.level
              }] | ${info.message}`
          )
        })
      ]
    });
    this.logger = winston.loggers.get("logger");
    this.errorLogger = winston.loggers.get("errorLogger");
    this.consoleLogger = winston.loggers.get("consoleLogger");
  }

  //Get the file name and line number from which the log is called on
  _getCallerFile() {
    var originalFunc = Error.prepareStackTrace;

    var callerfile;
    try {
      var err = new Error();
      var currentfile;
      var number;

      Error.prepareStackTrace = function (err, stack) {
        return stack;
      };
      currentfile = err.stack.shift().getFileName();

      while (err.stack.length) {
        var st = err.stack.shift();
        callerfile = st.getFileName();
        number = st.getLineNumber();
        if (currentfile !== callerfile) break;
      }
    } catch (e) {
      console.log("_getCallerFile", e);
    }

    Error.prepareStackTrace = originalFunc;
    return callerfile.replace(__dirname, "") + "(" + number + ")";
  }

  //Get a formatted date
  getFormattedDate() {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    // let sec = date.getSeconds();

    minutes = minutes < 10 ? "0" + minutes : minutes;
    let strTime = hours + ":" + minutes;
    return day + "/" + month + "/" + year + " " + strTime;
  }

  //Write an error log
  error(message) {
    fileStack = this._getCallerFile();
    if (!(/PROD/).test(process.env.CONFIG_ARG))
      this.errorLogger.error(message);
    return true;
  }

  //Write an info log
  info(message) {
    fileStack = this._getCallerFile();
    if (!(/PROD/).test(process.env.CONFIG_ARG))
      this.logger.info(message);
    return true;
  }

  console(message) {
    fileStack = this._getCallerFile();
    if (!(/PROD/).test(process.env.CONFIG_ARG))
      this.logger.info(message);
    return true;
  }

  //Write a warning log
  warn(message) {
    fileStack = this._getCallerFile();
    if (!(/PROD/).test(process.env.CONFIG_ARG))
      this.logger.warn(message);
    return true;
  }

  //Function used as an express middleware to capture incoming IP address and request ID
  requestDetails(loggerInstance) {
    return function (req, res, next) {
      //this.clientIPAddress = get_ip(req).clientIp
      try {
        //  console.log(req)
      } catch (e) {
        console.log(e);
      }
      requestId = guid();
      req.appLogger = loggerInstance;
      next();
    };
  }
}

module.exports = { CustomLogger };
