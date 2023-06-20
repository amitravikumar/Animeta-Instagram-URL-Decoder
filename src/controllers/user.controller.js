"use strict";

// let CONFIG = require("./../configs/config")(process.env.CONFIG_ARG);
const { statusCodes, messages, thirdpartyConfig } = require("../configs");
const { userService } = require(`../services/${thirdpartyConfig.DB_CHOICE?.toLowerCase()}`);
const { response } = require("../middleware");
const { USER_TYPE } = require('./../constants')
const { generateAccessToken, isPastDate, checkEmailOrMobileValidity, formatDate } = require('./../utils')

class UserController { }

UserController.getOTP = async (req, res, next) => {
  try {
    let { body } = req;

    /**First preference will be given to SMS otp type */
    if (thirdpartyConfig?.OTP?.SMS && !body?.mobileNumber) {
      consoel.log(true)
      return response.errors(req, res, statusCodes.HTTP_BAD_REQUEST, undefined, messages.phoneNumberReq)
    }

    if (thirdpartyConfig?.OTP?.EMAIL && !body?.emailId)
      return response.errors(req, res, statusCodes.HTTP_BAD_REQUEST, undefined, messages.emailReq)
    const result = await userService.getOTP(body);

    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      result?.data,
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

UserController.verifyOTPAndRegister = async (req, res, next) => {
  try {
    let { body } = req;

    /**First preference will be given to SMS otp type */
    if (thirdpartyConfig?.OTP?.SMS && !body?.mobileNumber)
      return response.errors(req, res, statusCodes.HTTP_BAD_REQUEST, undefined, messages.phoneNumberReq)

    if (thirdpartyConfig?.OTP?.EMAIL && !body?.emailId)
      return response.errors(req, res, statusCodes.HTTP_BAD_REQUEST, undefined, messages.emailReq)
    console.log("Date of birth", body?.dob)
    if (body?.dob) body.dob = formatDate(body?.dob)
    if (body?.dob && !isPastDate(body?.dob))
      return response.errors(req, res, statusCodes.HTTP_BAD_REQUEST, undefined, messages.futureDate)

    let result = await userService.verifyAndRegister(body);

    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      result?.data,
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

UserController.verifyOTPAndLogin = async (req, res, next) => {
  try {
    let { body } = req;

    /**First preference will be given to SMS otp type */
    if (thirdpartyConfig?.OTP?.SMS && !body?.mobileNumber)
      return response.errors(req, res, statusCodes.HTTP_BAD_REQUEST, undefined, messages.phoneNumberReq)

    if (thirdpartyConfig?.OTP?.EMAIL && !body?.emailId)
      return response.errors(req, res, statusCodes.HTTP_BAD_REQUEST, undefined, messages.emailReq)

    let result = await userService.verifyAndLogin(body);
    delete result?.data?.password
    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      result?.data,
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

UserController.loginWithPassword = async (req, res, next) => {
  try {
    let { body } = req;
    let query = {}
    if (!checkEmailOrMobileValidity(body?.emaiIdOrMobile))
      return response.errors(req, res, statusCodes.HTTP_BAD_REQUEST, undefined, messages.invalidEmailOrMobile)

    if (body?.emaiIdOrMobile?.indexOf("@") > -1)
      query.emailId = body?.emaiIdOrMobile
    else
      query.mobileNumber = body?.emaiIdOrMobile

    let result = await userService.loginWithPassword(body, query);

    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      result?.data,
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

UserController.loginWithUsername = async (req, res, next) => {
  try {
    let { body } = req;
    let query = {
      userName: body?.userName
    }

    let result = await userService.loginWithUsername(body, query);

    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      result?.data,
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

UserController.logout = async (req, res, next) => {
  try {
    if (!req?.user?.sessionId)
      return response.errors(req, res, statusCodes.HTTP_CONFLICT, undefined, messages.invalidSession)

    let result = await userService.logout(req?.user?.sessionId);

    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      result?.data,
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

UserController.changePassword = async (req, res, next) => {
  try {
    let { body } = req;
    let userId = req?.user?.id
    let result = await userService.changePassword(userId, body);

    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      result?.data,
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

UserController.forgotPassword = async (req, res, next) => {
  try {
    let { body } = req;
    let query = {}
    if (!checkEmailOrMobileValidity(body?.emaiIdOrMobile))
      return response.errors(req, res, statusCodes.HTTP_BAD_REQUEST, undefined, messages.invalidEmailOrMobile)

    if (body?.emaiIdOrMobile?.indexOf("@") > -1)
      query.emailId = body?.emaiIdOrMobile
    else
      query.mobileNumber = body?.emaiIdOrMobile
    let result = await userService.getUserData(query);
    if (!result?.data)
      return response.errors(req, res, result?.code || statusCodes.HTTP_BAD_REQUEST, result?.data, result?.message)

    let url = process.env.FE_LINK + generateAccessToken({ id: result?.data?._id, type: USER_TYPE.USER, skipSession: true }, '15min')
    if (thirdpartyConfig.FORGOT_PASSWORD.SMS_LINK) {
      //Send link via sms here
      console.log("Sending link via sms")
    }
    if (thirdpartyConfig.FORGOT_PASSWORD.EMAIL_LINK) {
      //send link via email here
      console.log("Sending link via email")
    }
    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      { url },
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

UserController.resetPassword = async (req, res, next) => {
  try {
    let { body } = req;
    let userId = req?.user?.id
    let result = await userService.resetPassword(userId, body);

    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      result?.data,
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

UserController.getUserById = async (req, res, next) => {
  try {
    let _id = req?.user?.id
    let result = await userService.getUserData({ _id });
    result = JSON.parse(JSON.stringify(result))
    delete result?.data?.password
    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      result?.data,
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

UserController.deleteUser = async (req, res, next) => {
  try {
    let _id = req?.user?.id
    let result = await userService.deleteUser({ _id });
    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      undefined,
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

UserController.updateUser = async (req, res, next) => {
  try {
    let _id = req?.user?.id
    console.log("Date of birth", req?.body?.dob)
    if (req?.body?.dob) req.body.dob = formatDate(req?.body?.dob)
    if (req?.body?.dob && !isPastDate(req?.body?.dob))
      return response.errors(req, res, statusCodes.HTTP_BAD_REQUEST, undefined, messages.futureDate)

    let result = await userService.updateUser(_id, req?.body);
    result = JSON.parse(JSON.stringify(result))
    delete result?.data?.password
    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      result?.data,
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

UserController.updateTerms = async (req, res, next) => {
  try {
    let id = req?.user?.id
    let result = await userService.updateTerms({ userId: id, ...req?.body });
    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      result?.data,
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

UserController.userStatus = async (req, res, next) => {
  try {
    let id = req?.user?.id
    let result = await userService.userStatus(id, req?.body);

    return response.success(
      req,
      res,
      result?.code || statusCodes.HTTP_OK,
      result?.data,
      result?.message
    );
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

module.exports = UserController;
