"use strict";

module.exports = function (env) {
  const LOCAL_CONSTANTS = {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    NODE_ENV: process.env.NODE_ENV,
    DB_CHOICE: process.env.DB_CHOICE,
    SQL_CONFIG: {
      username: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DATABASE,
      host: process.env.SQL_HOST,
      dialect: process.env.SQL_DIALECT,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  };

  const TEST_CONSTANTS = {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_TEST_URL,
    NODE_ENV: process.env.NODE_ENV,
    DB_CHOICE: process.env.DB_CHOICE,
    SQL_CONFIG: {
      username: process.env.SQL_TEST_USER,
      password: process.env.SQL_TEST_PASSWORD,
      database: process.env.SQL_TEST_DATABASE,
      host: process.env.SQL_TEST_HOST,
      dialect: process.env.SQL_TEST_DIALECT,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  };

  const DEV_CONSTANTS = {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    NODE_ENV: process.env.NODE_ENV,
    DB_CHOICE: process.env.DB_CHOICE,
    SQL_CONFIG: {
      username: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DATABASE,
      host: process.env.SQL_HOST,
      dialect: process.env.SQL_DIALECT,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  };

  const PROD_CONSTANTS = {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    NODE_ENV: process.env.NODE_ENV,
    DB_CHOICE: process.env.DB_CHOICE,
    SQL_CONFIG: {
      username: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DATABASE,
      host: process.env.SQL_HOST,
      dialect: process.env.SQL_DIALECT,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  };
  let envType;

  switch (env) {
    case "DEV":
      envType = DEV_CONSTANTS;
      break;

    case "LOCAL":
      envType = LOCAL_CONSTANTS;
      break;

    case "TEST":
      envType = TEST_CONSTANTS;
      break;

    case "PROD":
      envType = PROD_CONSTANTS;
      break;

    default:
      envType = { NA: "NA" };
      break;
  }

  return envType;
};
