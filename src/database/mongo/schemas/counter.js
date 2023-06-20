"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

module.exports = new Schema(
  {
    counterId: {
      type: String,
      unique: true
    },
    seq: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);
