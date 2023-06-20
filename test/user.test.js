"use-strict";

/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
//During the test the env variable is set to test
const { OTP_TYPE } = require('./../src/constants')
const path = require("path");
process.env.NODE_ENV = "test";
process.env.CONFIG_ARG = "TEST";
require("dotenv").config({
  path: path.join(
    process.cwd(),
    `.env.${process.env.CONFIG_ARG.toLocaleLowerCase()}`
  )
});

console.log(process.env.DB_CHOICE);
let CONFIG = require("../src/configs/config")(process.env.CONFIG_ARG);
console.log(CONFIG);
const { messages, statusCodes, businessLayerConfig } = require("./../src/configs");
let mongoose = require("mongoose");
let { user, otp } = require("../src/database/mongo/models");

//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
let should = chai.should();
const MOBILE_NUMBER = "9283726432";
chai.use(chaiHttp);
//Our parent block
describe("Send OTP", () => {
  beforeEach((done) => {
    //Before each test we empty the database
    user.deleteMany({ mobileNumber: MOBILE_NUMBER }, (err) => {
      done();
    });
  });
  /*
   * Test the /POST route
   */
  describe("/POST Send OTP", () => {

    it("it should send SMS OTP - New user trying to register", (done) => {
      console.log("Here");
      businessLayerConfig.OTP.SMS = true;
      businessLayerConfig.OTP.EMAIL = false;
      let body = {
        mobileNumber: "8122250021",
        isNewUser: true
      };
      chai
        .request(server)
        .post("/api/v1/user/otp/get")
        .send(body)
        .end((err, res) => {
          res.should.have.status(statusCodes.HTTP_OK);
          res.body.should.be.a("object");
          res.body.message.should.be.eql(messages.otpSend);
          res.body.status.should.be.eql(statusCodes.HTTP_OK);
          done();
        });
    });
    it("it should not send SMS OTP - New user trying to login", (done) => {
      console.log("Here");
      businessLayerConfig.OTP.SMS = true;
      businessLayerConfig.OTP.EMAIL = false;
      let body = {
        mobileNumber: "8122250021",
        isNewUser: false
      };
      chai
        .request(server)
        .post("/api/v1/user/otp/get")
        .send(body)
        .end((err, res) => {
          res.should.have.status(statusCodes.HTTP_CONFLICT);
          res.body.should.be.a("object");
          res.body.message.should.be.eql(messages.userNotExist);
          res.body.status.should.be.eql(statusCodes.HTTP_CONFLICT);
          done();
        });
    });
    it("it should send EMAIL OTP - New user trying to register", (done) => {
      console.log("Here");
      businessLayerConfig.OTP.SMS = false;
      businessLayerConfig.OTP.EMAIL = true;
      let body = {
        emailId: "abc@abc.com",
        isNewUser: true
      };
      chai
        .request(server)
        .post("/api/v1/user/otp/get")
        .send(body)
        .end((err, res) => {
          res.should.have.status(statusCodes.HTTP_OK);
          res.body.should.be.a("object");
          res.body.message.should.be.eql(messages.otpSend);
          res.body.status.should.be.eql(statusCodes.HTTP_OK);
          done();
        });
    });
    it("it should not send SMS OTP - New user trying to login", (done) => {
      console.log("Here");
      businessLayerConfig.OTP.SMS = false;
      businessLayerConfig.OTP.EMAIL = true;
      let body = {
        emailId: "abc@abc.com",
        isNewUser: false,
      };
      chai
        .request(server)
        .post("/api/v1/user/otp/get")
        .send(body)
        .end((err, res) => {
          res.should.have.status(statusCodes.HTTP_CONFLICT);
          res.body.should.be.a("object");
          res.body.message.should.be.eql(messages.userNotExist);
          res.body.status.should.be.eql(statusCodes.HTTP_CONFLICT);
          done();
        });
    });
    it("it should send EMAIL OTP & SMS OTP- New user trying to register", (done) => {
      console.log("Here");
      businessLayerConfig.OTP.SMS = true;
      businessLayerConfig.OTP.EMAIL = true;
      let body = {
        emailId: "abc@abc.com",
        mobileNumber: "9839283777",
        isNewUser: true
      };
      chai
        .request(server)
        .post("/api/v1/user/otp/get")
        .send(body)
        .end((err, res) => {
          res.should.have.status(statusCodes.HTTP_OK);
          res.body.should.be.a("object");
          res.body.message.should.be.eql(messages.otpSend);
          res.body.status.should.be.eql(statusCodes.HTTP_OK);
          done();
        });
    });
    it("it should not send SMS OTP & SMS OTP - New user trying to login", (done) => {
      console.log("Here");
      businessLayerConfig.OTP.SMS = false;
      businessLayerConfig.OTP.EMAIL = true;
      let body = {
        emailId: "abc@abc.com",
        mobileNumber: "9283726352",
        isNewUser: false,
      };
      chai
        .request(server)
        .post("/api/v1/user/otp/get")
        .send(body)
        .end((err, res) => {
          res.should.have.status(statusCodes.HTTP_CONFLICT);
          res.body.should.be.a("object");
          res.body.message.should.be.eql(messages.userNotExist);
          res.body.status.should.be.eql(statusCodes.HTTP_CONFLICT);
          done();
        });
    });
  });
});
