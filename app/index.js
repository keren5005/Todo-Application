/**
 * @name app
 * This module is responsible of creating and defining 
 * our todo application
 */

// Import our route implemantations
const { health, todos } = require('./routes/index.js');

// Import express and default body parser to json
const express = require('express');
const bodyParser = require('body-parser');

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

// Attach our routes to application
app.use(baseApi, health.route);
app.use(baseApi, todos.route);

// Export our application
module.exports = {
    app
}