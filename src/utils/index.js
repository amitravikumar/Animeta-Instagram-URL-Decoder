const bcrypt = require("bcrypt");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
const objectID = require("mongodb").ObjectID;
const crypto = require('crypto');

module.exports = {
  OTPGenerator: function () {
    if (!(/PROD/).test(process.env.CONFIG_ARG)) return 123456;
    return crypto.randomBytes(8).toJSON().data.join("").substring(0, 6);
  },
  genHash: function (data) {
    let salt = bcrypt.genSaltSync(8);
    return bcrypt.hashSync(data, salt);
  },
  cleanSensitiveData: function (data) {
    data.password = data.password
      ? delete data.password
      : data;
    return data;
  },
  comparePassword: async function (password, bcryptPassword) {
    return await bcrypt.compare(password, bcryptPassword);
  },
  pagingData: require("./pagination"),
  currentDate: function (format = "YYYY-MM-DD") {
    return moment(new Date()).tz("Asia/kolkata").format(format);
  },
  currentTime: function (format = "HH:mm:ss") {
    return moment(new Date()).tz("Asia/kolkata").format(format);
  },
  currentDateTime: function () {
    return Number(moment(new Date()).tz("Asia/kolkata"));
  },
  generateAccessToken: function (data, expiry = null) {
    return jwt.sign(data, process.env.JWT_SECRET, {
      expiresIn: expiry || process.env.JWT_EXPIRE_TIME
    });
  },
  dateFormat: (date) => {
    let curDate = date.getDate();
    curDate = curDate <= 9 ? "0" + curDate : curDate;
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    return `${curDate}/${month}/${year}`;
  },
  countryCodeValidadtor: (value, helper) => {
    var countryCodeRegex = /^(\+?\d{1,3}|\d{1,4})$/gm;
    if (!value.match(countryCodeRegex)) {
      return helper.message("Invalid Country Code");
    }
    return value;
  },
  mobileNumValidator: (value, helper) => {
    var mobileNumberRegex = /^[a-zA-Z0-9\-().\s]{10,15}$/gm;
    if (!value.match(mobileNumberRegex)) {
      return helper.message("Invalid Mobile Number");
    }
    return value;
  },
  objectIDValidator: (value, helper) => {
    if (!objectID.isValid(value)) {
      return helper.message("Invalid ObjectID");
    }
    return value;
  },
  encrypt: function encrypt(plainText) {
    if (!plainText) {
      return plainText;
    }
    try {
      var m = crypto.createHash("sha256");
      m.update(process.env.ENCRYPTION_KEY);
      var key = m.digest();
      var iv =
        "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f";
      var cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
      var encoded = cipher.update(plainText.toString(), "utf8", "hex");
      encoded += cipher.final("hex");
      return encoded;
    } catch (e) {
      return plainText
    }
  },

  decrypt: function decrypt(encText) {
    if (!encText) {
      return encText;
    }
    try {
      var m = crypto.createHash("sha256");
      m.update(process.env.ENCRYPTION_KEY);
      var key = m.digest();
      var iv =
        "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f";
      var decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
      var decoded = decipher.update(encText, "hex", "utf8");
      decoded += decipher.final("utf8");
      return decoded;
    } catch (e) {
      // console.log(e)
      return encText
    }
  },

  isPastDate: function pastDate(date) {
    let isSameOrAfter = moment().isSameOrAfter(moment(moment(date).format("YYYY-MM-DD")), "days")
    if (isSameOrAfter) return true
    return false
  },

  formatDate: function formatDate(date) {
    return moment(date).format("YYYY-MM-DD")
  },

  checkEmailOrMobileValidity: function checkEmailOrMobile(input) {
    if (/^[0-9]{10}$/.test(input) || /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(input)) {
      return true
    }
    return false
  }
};
