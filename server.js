/**
 * @name TodoApp
 * @version 0.0.1
 * @author Keren Cohen
 * @description This is a modern "TodoApp" built using nodeJS and HTTP web server,
 * using express framework.
 * @copyright 2023 © keren cohen
 */

// Default HTTP import
const http = require('http');
// Our todo application
const app = require('./app/index.js').app;

// Constant port value
const port = 9285;

// Set port for express applocation
app.set('port', port);
// Create normal HTTP server based on express application
const server = http.createServer(app);
// Callback function for error on server load
const onError = error => {
    if (error.syscall !== "listen") {
        throw error;
    }
    switch (error.code) {
        case "EACCES":
            process.exit(1);
            break;
        case "EADDRINUSE":
            process.exit(1);
            break;
        default:
            throw error;
    }
};

// Callback once server is listening and running on speicified port
const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
    // console.log(`Listening to [${addr.address}] ${bind}`)
};

// Define on events callback functions
server.on("error", onError);
server.on("listening", onListening);
// Start server
server.listen(port);