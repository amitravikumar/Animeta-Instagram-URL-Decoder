"use strict";

// let CONFIG = require("./../configs/config")(process.env.CONFIG_ARG);
const { statusCodes, messages, thirdpartyConfig } = require("../configs");
const { userService } = require(`../services/${thirdpartyConfig.DB_CHOICE?.toLowerCase()}`);
const { response } = require("../middleware");
const { USER_TYPE } = require('./../constants');
const { generateAccessToken, isPastDate, checkEmailOrMobileValidity, formatDate } = require('./../utils');
const puppeteer = require('puppeteer-core');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const { promisify } = require('util');

const pipeline = promisify(require('stream').pipeline);

class InstagramUrlFetcher { }

function getVideoFilenameFromUrl(url) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('/').filter(part => part.trim() !== '');
    const filename = parts[parts.length - 1];
    return filename;
}
async function extractVideoLink(url) {
    try {
        const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', 
            headless: true
        });
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector('video');
        const videoLink = await page.evaluate(() => {
            const videoElement = document.querySelector('video');
            return videoElement.src;
        });
        await browser.close();
        return { url, videoLink };
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
}



const videoPath = path.resolve('../videos'); // Specify the directory path where you want to save the videos
async function downloadVideo(url, videoFilename) {
    try {
        console.log(`Downloading videos to: ${videoPath}`);
        const response = await fetch(url);
        const fileStream = fs.createWriteStream(path.join(videoPath, `IG_${videoFilename}.mp4`), { flags: 'a' });
        await pipeline(response.body, fileStream);
        console.log(`Downloaded video: ${path.join(videoPath, videoFilename)}`);
    } catch (error) {
        console.error(`Error downloading video: ${url}`, error);
    }
}

InstagramUrlFetcher.fetchUrlData = async (req, res, next) => {
    try {
        let urlArray = req.body.urlArrays;
        console.log("These are the urls", urlArray);
        let finalLink;
        const batchSize = 10;
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

InstagramUrlFetcher.downloadUrlData = async (req, res, next) => {
    try {
        let urlArray = req.body.urlArrays;
        const batchSize = 10;
        const numBatches = Math.ceil(urlArray.length / batchSize);

        for (let i = 0; i < numBatches; i++) {
            const batchUrls = urlArray.slice(i * batchSize, (i + 1) * batchSize);
            const promises = batchUrls.map(url => extractVideoLink(url));
            const finalLinks = await Promise.all(promises);

        for (const { url, videoLink } of finalLinks) {
                const videoFilename = getVideoFilenameFromUrl(url);
                await downloadVideo(videoLink, videoFilename);
            }
        }
        return response.success(
            req,
            res,
            statusCodes.HTTP_OK,
            null,
            messages.urlCaptured
        );
    } catch (err) {
        console.log("err", err);
        next(err);
    }
};


module.exports = InstagramUrlFetcher;
