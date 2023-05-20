/**
 * @name logs
 * This module is for sanity checks
 */

const { Router } = require('express');

let route = Router();


const levelGet = (request,response,next) => {
    const query = request.query;
    let loggerName = query["logger-name"];
    let logLevel;
    switch (loggerName) {
        case "todo-logger":
            logLevel = request.app.locals.todoLogger.level;
            break;
        case "request-logger":
            logLevel = request.app.locals.requestLogger.level;
            break;
        default:
            break;
    }
    response
        .status(200)
        .send(logLevel.toUpperCase())
}

route.get('/level', levelGet)
 
const levelPut = (request,response,next) => {
    const query = request.query;
    let loggerName = query["logger-name"];
    let newLogLevel = query["logger-level"];
    switch (loggerName) {
        case "todo-logger":
            request.app.locals.todoLogger.level = newLogLevel.toLowerCase();
            break;
        case "request-logger":
            request.app.locals.requestLogger.level = newLogLevel.toLowerCase();
            break;
        default:
            break;
    }
    response
        .status(200)
        .send(newLogLevel.toUpperCase())
}

route.put('/level', levelPut)
 
module.exports = {
    route
};