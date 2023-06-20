"use strict";

const mongoose = require("mongoose");
const { termsAgreement } = require("../schemas");

module.exports = mongoose.model("termsAgreement", termsAgreement);
