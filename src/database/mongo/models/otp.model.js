"use strict";

const mongoose = require("mongoose");
const { otp } = require("../schemas");

module.exports = mongoose.model("otp", otp);
