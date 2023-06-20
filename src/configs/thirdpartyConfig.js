module.exports = {
    OTP: {
        SMS: true,
        EMAIL: false,
        SAME_OTP: true
    },
    TOKEN: {
        JWT: true,
        IBMCI: false,
        OAUTH: false
    },
    DB_CHOICE: "MONGO",
    FORGOT_PASSWORD: {
        SMS_LINK: true,
        EMAIL_LINK: true
    },
    PASSWORD_COMPLEXITY: {
        min: 8,
        max: 26,
        lowerCase: 1,
        upperCase: 1,
        numeric: 1,
        symbol: 1,
        requirementCount: 4,
    },
    SESSION_LIMIT: 4
}