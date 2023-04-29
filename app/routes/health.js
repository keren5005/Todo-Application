/**
 * @name health
 * This module is for sanity checks
 */

const { Router } = require('express');

let route = Router();

const health = (request,response,next) => {
    response
        .status(200)
        .send('OK')
}

// This is a sanity endpoint used to check that the server is up and running.
route.get('/health', health)

module.exports = {
    route
};