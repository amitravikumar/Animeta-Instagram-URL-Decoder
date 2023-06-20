"use strict";

const mongoose = require("mongoose");
const { sessions } = require("../schemas");

module.exports = mongoose.model("sessions", sessions);
