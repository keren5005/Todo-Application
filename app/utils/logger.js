const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, requestNumber, timestamp }) => {
  return `${timestamp} ${level}: ${message} | request #${requestNumber}`;
});

const requestLogger = createLogger({
    format: combine(
        timestamp({
            format: 'DD-MM-YYYY hh:mm:ss.sss'
        }),
        myFormat
    ),
    transports: [
        new transports.File({ filename: 'logs/requests.log' }),
        new transports.Console()
    ]
});

const todoLogger = createLogger({
    format: combine(
        timestamp({
            format: 'DD-MM-YYYY hh:mm:ss.sss'
        }),
        myFormat
    ),
    transports: [
        new transports.File({ filename: 'logs/todos.log' }),
    ]
});

module.exports = {
    requestLogger,
    todoLogger
}