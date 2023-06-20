'use strict';

const mongoose = require("mongoose");
const { Schema } = mongoose;

module.exports = new Schema({
  userName: {
    type: String,
    trim: true,
    index: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  emailId: {
    type: String,
    trim: true,
    index: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  countryCode: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    trim: true
  },
  dob: {
    type: String,
    trim: true
  },
  profilePicPath: {
    type: String,
    trim: true
  },
  profilePicName: {
    type: String,
    trim: true
  },
  refferalCode: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    trim: true,
    default: "ACTIVE"
  },
  createdBy: {
    type: String,
    trim: true
  },
  updatedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});