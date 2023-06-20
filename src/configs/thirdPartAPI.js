'use strict';

module.exports = {
    'smsAPI': {
        method: 'POST',
        url: process.env.smsAPI,
        headers: {
            contentType: 'application/data',
        },
        auth: {
            username: process.env.smsApiUname,
            password: process.env.smsApiPassword
        }
    }
};