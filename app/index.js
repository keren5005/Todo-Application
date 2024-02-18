/**
 * @name app
 * This module is responsible of creating and defining 
 * our todo application
 */

// Import our route implemantations
const { health, todos, logs } = require('./routes/index.js');
const { requestLogger, todoLogger } = require("./utils/logger");

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

app.locals.requestLogger = requestLogger;
app.locals.todoLogger = todoLogger;
// Define global logger reequest function
const logRequests = async function (req,res,next) {
    
    requestsNumber += 1;

    const startTime = new Date();
    
    const requestNumber = requestsNumber;
    req.requestNumber = requestNumber
    // Before call completion
    const resource = req.path;

    app.locals.requestLogger.info(`Incoming request | #${requestNumber} | resource: ${resource} | HTTP Verb ${req.method}`, {
        requestNumber
    })
    req.todoLogger = app.locals.todoLogger; // Set global variable in the request object

    // Handle all other middlewares / methods
    await next()

    // After call completion
    const endTime = new Date();
    const duration = endTime - startTime;
    app.locals.requestLogger.debug(`request #${requestNumber} duration: ${duration}ms`, {
        requestNumber
    })
}

// Attach a global middleware function for all server requests
app.use(logRequests)
app.use('/logs', logs.route);

// Attach our routes to application
app.use(baseApi, todos.route);
app.use(baseApi, health.route);
// Export our application
module.exports = {
    app
}