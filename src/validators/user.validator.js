const Joi = require("joi");
const JoiDate = Joi.extend(require('@joi/date'));
const { USER_STATUS, COUNTRY_CODE } = require('./../constants')
const passwordComplexity = require("joi-password-complexity");
const { thirdpartyConfig } = require('./../configs')

const getOTP = Joi.object({
  mobileNumber: Joi.string().trim().optional().length(10).pattern(/^[0-9]+$/).messages({
    "string.pattern.base": "mobileNumber must only contain numbers"
  }),
  emailId: Joi.string().trim().email().optional(),
  countryCode: Joi.string().valid(...COUNTRY_CODE).optional().messages({ 'any.only': 'Invalid Country Code' }),
});

const verifyOTPAndRegister = Joi.object({
  userName: Joi.string().trim().required(),
  mobileNumber: Joi.string().trim().optional().length(10).pattern(/^[0-9]+$/).messages({
    "string.pattern.base": "mobileNumber must only contain numbers"
  }),
  smsOtp: Joi.string().trim().optional().length(6).pattern(/^[0-9]+$/).messages({
    "string.pattern.base": "smsOtp must only contain numbers"
  }),
  emailOtp: Joi.string().trim().optional().length(6).pattern(/^[0-9]+$/).messages({
    "string.pattern.base": "emailOtp must only contain numbers"
  }),
  firstName: Joi.string().trim().optional().pattern(/^[a-zA-Z ]{2,30}$/).messages({
    "string.pattern.base": "firstName must have characters and should be between 2 to 30 letters"
  }),
  lastName: Joi.string().trim().optional().pattern(/^[a-zA-Z ]{2,30}$/).messages({
    "string.pattern.base": "lastName must have characters and should be between 2 to 30 letters"
  }),
  emailId: Joi.string().trim().email().optional(),
  countryCode: Joi.string().trim().valid(...COUNTRY_CODE).optional().messages({ 'any.only': 'Invalid Country Code' }),
  gender: Joi.string().trim().optional().valid("Male", "Female", "Others", "Prefer not to say"),
  dob: JoiDate.date().format("YYYY-MM-DD").optional(),
  refferalCode: Joi.string().trim().optional(),
  password: new passwordComplexity(thirdpartyConfig.PASSWORD_COMPLEXITY),
  profileImage: Joi.string().trim().optional()
});

const verifyOTPAndLogin = Joi.object({
  mobileNumber: Joi.string().trim().optional().length(10).pattern(/^[0-9]+$/).messages({
    "string.pattern.base": "mobileNumber must only contain numbers"
  }),
  smsOtp: Joi.string().trim().optional().length(6).pattern(/^[0-9]+$/).messages({
    "string.pattern.base": "smsOtp must only contain numbers"
  }),
  emailOtp: Joi.string().trim().optional().length(6).pattern(/^[0-9]+$/).messages({
    "string.pattern.base": "emailOtp must only contain numbers"
  }),
  emailId: Joi.string().trim().email().optional()
});

const loginWithPassword = Joi.object({
  emaiIdOrMobile: Joi.string().trim().required(),
  password: Joi.string().trim().required()
});

const loginWithUsernameAndPassword = Joi.object({
  userName: Joi.string().trim().required(),
  password: Joi.string().trim().required()
});

const changePassword = Joi.object({
  currentPassword: Joi.string().trim().required(),
  password: new passwordComplexity(thirdpartyConfig.PASSWORD_COMPLEXITY),
  confirmPassword: new passwordComplexity(thirdpartyConfig.PASSWORD_COMPLEXITY)
});

const forgotPassword = Joi.object({
  emaiIdOrMobile: Joi.string().trim().required()
});

const resetPassword = Joi.object({
  password: new passwordComplexity(thirdpartyConfig.PASSWORD_COMPLEXITY),
  confirmPassword: new passwordComplexity(thirdpartyConfig.PASSWORD_COMPLEXITY)
});

const updateUser = Joi.object({
  userName: Joi.string().trim().optional(),
  mobileNumber: Joi.string().trim().optional().length(10).pattern(/^[0-9]+$/).messages({
    "string.pattern.base": "mobileNumber must only contain numbers"
  }),
  firstName: Joi.string().trim().optional().pattern(/^[a-zA-Z ]{2,30}$/).messages({
    "string.pattern.base": "firstName must have characters and should be between 2 to 30 letters"
  }),
  lastName: Joi.string().trim().optional().pattern(/^[a-zA-Z ]{2,30}$/).messages({
    "string.pattern.base": "lastName must have characters and should be between 2 to 30 letters"
  }),
  emailId: Joi.string().trim().email().optional(),
  countryCode: Joi.string().trim().valid(...COUNTRY_CODE).optional(),
  gender: Joi.string().trim().optional().valid("Male", "Female", "Others", "Prefer not to say"),
  dob: JoiDate.date().format("YYYY-MM-DD").optional(),
  refferalCode: Joi.string().trim().optional(),
  profileImage: Joi.string().trim().optional()
});

const terms = Joi.object({
  termsAgreed: Joi.boolean().required(),
});

const userStatus = Joi.object({
  status: Joi.string().trim().required().valid(USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.DELETED)
});

module.exports = {
  getOTP,
  verifyOTPAndRegister,
  verifyOTPAndLogin,
  loginWithPassword,
  changePassword,
  forgotPassword,
  resetPassword,
  updateUser,
  userStatus,
  loginWithUsernameAndPassword,
  terms
};
