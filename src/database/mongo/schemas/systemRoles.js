'use strict';

const mongoose = require("mongoose");
const { Schema } = mongoose;

module.exports = new Schema({
  name: {
    type: String,
    trim: true,
    index: true
  }
}, {
  timestamps: true
});