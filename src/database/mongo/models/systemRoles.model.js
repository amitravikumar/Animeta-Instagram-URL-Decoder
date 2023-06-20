"use strict";

const mongoose = require("mongoose");
const { systemRoles } = require("../schemas");

module.exports = mongoose.model("systemRoles", systemRoles);
