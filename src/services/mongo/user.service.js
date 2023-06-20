const { user, otp: otpModel, systemRoles, sessions, userBackup, termsAgreement } = require("../../database/mongo/models");
const { statusCodes, messages, thirdpartyConfig } = require("./../../configs");
const { OTPGenerator, genHash, generateAccessToken, comparePassword } = require("./../../utils");
const { OTP_TYPE, USER_TYPE, USER_STATUS, TOKEN_TYPE, SESSION_STATUS } = require('./../../constants')
const moment = require('moment-timezone')
class UserService { }

UserService.getSystemRole = async (name) => {
  try {
    return await systemRoles.findOne({ name })
  } catch (err) {
    throw new Error(err)
  }
}

UserService.getSessionData = async (_id) => {
  try {
    return await sessions.findOne({ _id, status: SESSION_STATUS.ACTIVE })
  } catch (err) {
    throw new Error(err)
  }
}

UserService.createSession = async (data) => {
  try {
    let count = await sessions.countDocuments({ userId: data?.userId, status: SESSION_STATUS.ACTIVE })
    if (count > thirdpartyConfig.SESSION_LIMIT)
      return false
    return await sessions.create(data)
  } catch (err) {
    throw new Error(err)
  }
}

UserService.getMultipleSystemRoles = async (name) => {
  try {
    return await systemRoles.find({ name: { $in: name } })
  } catch (err) {
    throw new Error(err)
  }
}
UserService.getOTP = async (body) => {
  try {
    let { mobileNumber, emailId } = body;

    /**
     *  Generate OTP
     */
    let OTP = OTPGenerator();
    let secondOTP = OTPGenerator();

    /**
     *  Save generated OTP across the mobile number
     */
    let payload = {
      emailId,
      mobileNumber
    }

    if (thirdpartyConfig?.OTP?.SMS)
      payload.smsOtp = OTP
    if (thirdpartyConfig?.OTP?.EMAIL) {
      if (thirdpartyConfig?.OTP?.SAME_OTP) payload.emailOtp = OTP
      else payload.emailOtp = secondOTP
    }

    await otpModel.create(payload);

    /**
     * TODO
     * Send this OTP through sms/email provider asynchronously before returning
     */

    /**
     *  Return to controller
     */
    return {
      code: statusCodes.HTTP_OK,
      message: messages.otpSend
    };
  } catch (err) {
    throw new Error(err);
  }
};

UserService.verifyAndRegister = async (body) => {
  try {
    let { mobileNumber, smsOtp, emailOtp, otpType, emailId, ...rest } = body;

    let query = {}
    if (thirdpartyConfig?.OTP?.SMS) {
      query.mobileNumber = mobileNumber; query.smsOtp = smsOtp
    }
    if (thirdpartyConfig?.OTP?.EMAIL) {
      query.emailId = emailId; query.emailOtp = emailOtp
    }

    console.log(query)
    let validateOTP = await otpModel.findOne(query).sort({ createdAt: -1 });

    /**
     * If OTP is not valid; throw error
     */
    if (!validateOTP)
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.otpInvalid
      };
    await otpModel.deleteMany(query)
    delete query.smsOtp;
    delete query.emailOtp;
    let findIfExists = await user.findOne({ $or: [{ ...query, status: { $ne: USER_STATUS.DELETED } }, { userName: rest?.userName }] })
    if (findIfExists) {
      let message = "";
      if (findIfExists.mobileNumber == mobileNumber)
        message += "Mobile Number already exists, ";
      if (findIfExists?.userName == rest?.userName)
        message += "User Name already exists";
      return {
        code: statusCodes.HTTP_CONFLICT,
        message
      };
    }
    /**
     * Proceed to register user when OTP is valid
     */

    let payload = {
      emailId,
      mobileNumber,
      status: USER_STATUS.ACTIVE,
      ...rest
    }
    if (payload.password)
      payload.password = genHash(payload.password)
    console.log(payload)
    let userData = new user(payload);
    data = await userData.save();
    if (!data)
      return {
        code: statusCodes.HTTP_INTERNAL_SERVER_ERROR,
        message: messages.userNotCreate
      };
    data = JSON.parse(JSON.stringify(data));
    let sessionData = await UserService.createSession({
      userId: data?._id,
      tokenType: TOKEN_TYPE.JWT,
      status: SESSION_STATUS.ACTIVE,
      userType: USER_TYPE.USER,
      logInDateTime: moment(new Date())
    })
    if (!sessionData) {
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.sessionExceeded
      };
    }
    data.token = generateAccessToken({ id: data?._id, sessionId: sessionData?._id })
    sessionData.accessToken = data?.token;
    sessionData.save();
    /**
     *  Return to controller
     */
    return {
      code: statusCodes.HTTP_OK,
      message: messages.userCreated,
      data
    };
  } catch (err) {
    throw new Error(err);
  }
};

UserService.verifyAndLogin = async (body) => {
  try {
    let { mobileNumber, smsOtp, emailOtp, otpType, emailId } = body;

    let query = {}
    if (thirdpartyConfig?.OTP?.SMS) {
      query.mobileNumber = mobileNumber; query.smsOtp = smsOtp
    }
    if (thirdpartyConfig?.OTP?.EMAIL) {
      query.emailId = emailId; query.emailOtp = emailOtp
    }

    let validateOTP = await otpModel.findOne(query).sort({ createdAt: -1 });

    /**
     * If OTP is not valid; throw error
     */
    if (!validateOTP)
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.otpInvalid
      };
    await otpModel.deleteMany(query)
    delete query.smsOtp;
    delete query.emailOtp;
    let findIfExists = await user.findOne({ ...query, status: { $ne: USER_STATUS.DELETED } }, { password: -1 })
    if (!findIfExists) {
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.userNotExist
      };
    }
    /**
     * Proceed to register user when OTP is valid
     */
    data = JSON.parse(JSON.stringify(findIfExists));
    let sessionData = await UserService.createSession({
      userId: data?._id,
      tokenType: TOKEN_TYPE.JWT,
      status: SESSION_STATUS.ACTIVE,
      userType: USER_TYPE.USER,
      logInDateTime: moment(new Date())
    })
    if (!sessionData) {
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.sessionExceeded
      };
    }
    data.token = generateAccessToken({ id: data?._id, sessionId: sessionData?._id })
    sessionData.accessToken = data?.token;
    sessionData.save();
    /**
     *  Return to controller
     */
    return {
      code: statusCodes.HTTP_OK,
      message: messages.loginSuccess,
      data
    };
  } catch (err) {
    throw new Error(err);
  }
};

UserService.loginWithPassword = async (body, query) => {
  try {
    let { password } = body;

    let findUser = await user.findOne({ ...query, status: { $ne: USER_STATUS.DELETED } })
    if (!findUser) {
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.userNotExist
      };
    }
    let compare = await comparePassword(password, findUser?.password)
    console.log(compare)
    if (!compare) {
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.incorrectPassword
      };
    }
    data = JSON.parse(JSON.stringify(findUser));
    let sessionData = await UserService.createSession({
      userId: data?._id,
      tokenType: TOKEN_TYPE.JWT,
      status: SESSION_STATUS.ACTIVE,
      userType: USER_TYPE.USER,
      logInDateTime: moment(new Date())
    })
    if (!sessionData) {
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.sessionExceeded
      };
    }
    data.token = generateAccessToken({ id: data?._id, sessionId: sessionData?._id })
    sessionData.accessToken = data?.token;
    sessionData.save();
    /**
     *  Return to controller
     */
    return {
      code: statusCodes.HTTP_OK,
      message: messages.loginSuccess,
      data
    };
  } catch (err) {
    throw new Error(err);
  }
};

UserService.loginWithUsername = async (body, query) => {
  try {
    let { password } = body;

    let findUser = await user.findOne({ ...query, status: { $ne: USER_STATUS.DELETED } })
    if (!findUser) {
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.userNotExist
      };
    }
    let compare = await comparePassword(password, findUser?.password)
    console.log(compare)
    if (!compare) {
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.incorrectPassword
      };
    }
    data = JSON.parse(JSON.stringify(findUser));
    let sessionData = await UserService.createSession({
      userId: data?._id,
      tokenType: TOKEN_TYPE.JWT,
      status: SESSION_STATUS.ACTIVE,
      userType: USER_TYPE.USER,
      logInDateTime: moment(new Date())
    })
    if (!sessionData) {
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.sessionExceeded
      };
    }
    data.token = generateAccessToken({ id: data?._id, sessionId: sessionData?._id })
    sessionData.accessToken = data?.token;
    sessionData.save();
    /**
     *  Return to controller
     */
    return {
      code: statusCodes.HTTP_OK,
      message: messages.loginSuccess,
      data
    };
  } catch (err) {
    throw new Error(err);
  }
};

UserService.changePassword = async (_id, body) => {
  try {
    let { currentPassword, password, confirmPassword } = body;

    let findUser = await user.findOne({ _id, status: { $ne: USER_STATUS.DELETED } })
    if (!findUser) {
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.userNotExist
      };
    }
    let compareCurrentPassword = await comparePassword(currentPassword, findUser?.password)

    if (!compareCurrentPassword)
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.currentPasswordIncorrect
      };

    if (password == currentPassword)
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.passwordMatchesCurrent
      };

    if (password !== confirmPassword)
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.passwordNotmatch
      };

    findUser.password = genHash(password)
    findUser.save();
    /**
     *  Return to controller
     */
    return {
      code: statusCodes.HTTP_OK,
      message: messages.passwordChanged
    };
  } catch (err) {
    throw new Error(err);
  }
};

UserService.getUserData = async (query) => {
  try {
    let findUser = await user.findOne({ ...query, status: { $ne: USER_STATUS.DELETED } }, { password: 0 });
    if (!findUser)
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.userNotExist
      };
    return {
      code: statusCodes.HTTP_OK,
      message: messages.dataFetched,
      data: findUser
    };
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

UserService.deleteUser = async (query) => {
  try {
    let findUser = await user.findOneAndDelete({ ...query });
    if (!findUser)
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.userNotExist
      };
    findUser = JSON.parse(JSON.stringify(findUser))
    userBackup.create(findUser)
    return {
      code: statusCodes.HTTP_OK,
      message: messages.deleted,
      data: findUser
    };
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

UserService.resetPassword = async (_id, body) => {
  try {
    let { password, confirmPassword } = body;

    let findUser = await user.findOne({ _id, status: { $ne: USER_STATUS.DELETED } })
    if (!findUser) {
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.userNotExist
      };
    }

    if (password !== confirmPassword)
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.passwordNotmatch
      };

    findUser.password = genHash(password)
    findUser.save();
    /**
     *  Return to controller
     */
    return {
      code: statusCodes.HTTP_OK,
      message: messages.passwordChanged
    };
  } catch (err) {
    throw new Error(err);
  }
};

UserService.updateUser = async (_id, body) => {
  try {
    let findUser = await user.findOneAndUpdate({ _id, status: { $ne: USER_STATUS.DELETED } }, body, { new: true });
    if (!findUser)
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.userNotExist
      };
    return {
      code: statusCodes.HTTP_OK,
      message: messages.updateUserSuccess,
      data: findUser
    };
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

UserService.updateTerms = async (body) => {
  try {
    let data = await termsAgreement.create(body);
    return {
      code: statusCodes.HTTP_OK,
      message: messages.updated,
      data
    };
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

UserService.userStatus = async (_id, body) => {
  try {
    let findUser = await user.findOneAndUpdate({ _id, status: { $ne: USER_STATUS.DELETED } }, body, { new: true });
    if (!findUser)
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.userNotExist
      };
    return {
      code: statusCodes.HTTP_OK,
      message: messages.statusUpdated,
      data: findUser
    };
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

UserService.logout = async (_id) => {
  try {
    let logoutSession = await sessions.findOneAndUpdate({ _id }, { status: SESSION_STATUS.INACTIVE, logoutDateTime: moment(new Date()) }, { new: true });
    if (!logoutSession)
      return {
        code: statusCodes.HTTP_CONFLICT,
        message: messages.invalidSession
      };
    return {
      code: statusCodes.HTTP_OK,
      message: messages.logoutSuccess
    };
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

module.exports = UserService;
