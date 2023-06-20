'use strict';

const mongoose = require("mongoose");
const { Schema } = mongoose;

module.exports = new Schema({
  mobileNumber: {
    type: String,
    trim: true,
    index: true
  },
  emailId: {
    type: String,
    trim: true,
    index: true
  },
  smsOtp: {
    type: String,
    index: true
  },
  emailOtp: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});