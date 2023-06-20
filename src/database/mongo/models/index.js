'use strict';

// const { dbConfig } = require("./../../configs");

// dbConfig();

module.exports = {
    user: require("./user.model"),
    userBackup: require("./userBackup.model"),
    otp: require('./otp.model'),
    counter: require('./counter.model'),
    systemRoles: require('./systemRoles.model'),
    sessions: require('./sessions.model'),
    termsAgreement: require('./termsAgreement.model')
};