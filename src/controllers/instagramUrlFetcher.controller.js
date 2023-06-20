"use strict";

// let CONFIG = require("./../configs/config")(process.env.CONFIG_ARG);
const { statusCodes, messages, thirdpartyConfig } = require("../configs");
const { userService } = require(`../services/${thirdpartyConfig.DB_CHOICE?.toLowerCase()}`);
const { response } = require("../middleware");
const { USER_TYPE } = require('./../constants');
const { generateAccessToken, isPastDate, checkEmailOrMobileValidity, formatDate } = require('./../utils');
const puppeteer = require('puppeteer-core');

class InstagramUrlFetcher { }

async function extractVideoLink(url) {
    try {
        const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', // Specify the path to your Chromeexecutable
            headless: true
        });
        const page = await browser.newPage();
        await page.goto(url);

        // Wait for the video element to appear
        await page.waitForSelector('video');

        // Extract the video link
        const videoLink = await page.evaluate(() => {
            const videoElement = document.querySelector('video');
            return videoElement.src;
        });

        await browser.close();

        return videoLink;
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
}

InstagramUrlFetcher.fetchUrlData = async (req, res, next) => {
    try {
        let urlArray = req.body.urlArrays;
        console.log("These are the urls", urlArray);
        let finalLink;
        const batchSize = 10; // Number of URLs to process in each batch
        const numBatches = Math.ceil(urlArray.length / batchSize);
        for (let i = 0; i < numBatches; i++) {
            const batchUrls = urlArray.slice(i * batchSize, (i + 1) * batchSize);
            const promises = batchUrls.map(url => extractVideoLink(url));
            finalLink = await Promise.all(promises);
            console.log(finalLink);
        }
        if(!finalLink) {
            return response.errors(req, res, statusCodes.HTTP_BAD_REQUEST, undefined, messages.urlNotCaptured)
        }
        return response.success(
            req,
            res,
            statusCodes.HTTP_OK,
            finalLink,
            messages.urlCaptured
        );
    } catch (err) {
        console.log("err", err);
        next(err);
    }
};


module.exports = InstagramUrlFetcher;
