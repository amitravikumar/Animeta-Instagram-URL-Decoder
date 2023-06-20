"use strict";

const { messages, statusCodes } = require("../configs");

let errorCodeHandlers = {};

errorCodeHandlers[statusCodes.HTTP_UNPROCESSABLE_ENTITY] = (err) => {
  console.log("Hey there", JSON.stringify(err));
  let error = err.error.details.reduce((prev, curr) => {
    prev[curr.path[0]] = curr.message.replace(/"/g, "");
    return prev;
  }, {});
  return {
    status: statusCodes.HTTP_UNPROCESSABLE_ENTITY,
    message: "Bad request",
    Error: Object.values(error).length
      ? Object.values(error).join(", ")
      : messages[400]
  };
};

errorCodeHandlers[statusCodes.HTTP_UNAUTHORIZED] = (err) => {
  console.log(err.code, err.message, "dnsfns");
  return {
    status: err.code,
    message: err.message
  };
};

errorCodeHandlers[statusCodes.HTTP_INTERNAL_SERVER_ERROR] = (err) => {
  return {
    status: err.code,
    message: err.message
  };
};

errorCodeHandlers[statusCodes.HTTP_NOT_FOUND] = (err) => {
  return {
    status: err.code,
    message: err.message
  };
};

errorCodeHandlers[statusCodes.HTTP_CONFLICT] = (err) => {
  return {
    status: err.code,
    message: err.message
  };
};
errorCodeHandlers["ER_DUP_ENTRY"] = (err) => {
  //    console.log(err.message);
  let matchedContent = err.message.match(/'([^']*)'/);
  let field = matchedContent[1].replace("'", "");
  // let value = matchedContent[0].replace("'", '');
  let msg =
    "The following " +
    field.toLowerCase() +
    " already exist, please choose another";

  return {
    status: 409,
    message: msg
  };
};

errorCodeHandlers[400] = (err) => {
  if (err.message === "Validation error") {
    err.message = messages[400];
  }

  return {
    status: err.code,
    message: err.message
  };
};

module.exports = errorCodeHandlers;
