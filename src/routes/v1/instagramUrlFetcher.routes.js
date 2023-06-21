const { instagramUrlFetcher } = require("../../controllers/index");
const { verifyToken } = require("../../middleware");

const express = require("express");
const instagramFetcherRoutes = express.Router();

let validator = require("express-joi-validation").createValidator({
    passError: true
});

instagramFetcherRoutes.post('/fetchUrl', instagramUrlFetcher.fetchUrlData);
instagramFetcherRoutes.post('/downloadUrlData', instagramUrlFetcher.downloadUrlData);

module.exports = instagramFetcherRoutes;
