'use strict';

const mongoose = require("mongoose");
const { Schema } = mongoose;

module.exports = new Schema({
  termsAgreed: {
    type: Boolean,
    trim: true
  },
  userId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
}, {
  timestamps: true
});