'use strict';

const mongoose = require("mongoose");
const { Schema } = mongoose;

module.exports = new Schema({
  userId: {
    type: String,
    trim: true,
    index: true
  },
  tokenType: {
    type: String,
    trim: true,
    index: true
  },
  userType: {
    type: String,
    trim: true,
    index: true
  },
  accessToken: {
    type: String,
    index: true
  },
  refreshToken: {
    type: String,
  },
  logInDateTime: {
    type: Date,
    index: true
  },
  logOutDateTime: {
    type: Date,
  },
  status: {
    type: String,
  }
}, {
  timestamps: true
});