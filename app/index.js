/**
 * @name app
 * This module is responsible of creating and defining 
 * our todo application
 */

// Import our route implemantations
const { health, todos } = require('./routes/index.js');
const { requestLogger } = require("./utils/logger");

// Import express and default body parser to json
const express = require('express');
const bodyParser = require('body-parser');

let requestsNumber = 0;

// Init an express application
const app = express();

// Base api url prefix - will route all of our api's to:
// - http://<some-domain>/todo/<some-endpoint>
const baseApi = '/todo'

// Disbale powerd by express header (security vunrability)
app.disable('x-powered-by');

// Limit request body to max 50mb
app.use(bodyParser.json({ limit: '50mb', extended: true }))
// Limit max url encoded data to 50mb
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

// Define global logger reequest function
const logRequests = function (req,res,next) {
    
    requestsNumber += 1;

    const startTime = new Date();
    
    const requestNumber = requestsNumber;

    // Before call completion
    requestLogger.info(`Incoming request | #${requestNumber} | resource: #TODO | HTTP Verb ${req.method}`, {
        requestNumber
    })

    // Handle all other middlewares / methods
    next()

    // After call completion
    const endTime = new Date();
    const duration = endTime - startTime;
    requestLogger.debug(`request #${requestNumber} duration: ${duration}ms`, {
        requestNumber
    })
}

// Attach a global middleware function for all server requests
app.use(logRequests)

// Attach our routes to application
app.use(baseApi, health.route);
app.use(baseApi, todos.route);

// Export our application
module.exports = {
    app
}