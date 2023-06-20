"use strict";

const mongoose = require("mongoose");
const { counter } = require("../schemas");

module.exports = mongoose.model("counter", counter);
