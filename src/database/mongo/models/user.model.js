"use strict";

const mongoose = require("mongoose");
const { user: userSchema } = require("../schemas");

module.exports = mongoose.model("user", userSchema);
