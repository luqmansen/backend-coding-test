
require("winston-daily-rotate-file");

const {format, createLogger, transports} = require("winston");
const {json} = format;
const path = require('path');

const logPath = process.env.LOG_PATH || "logs"

const fileRotateTransport = new transports.DailyRotateFile({
    filename: path.join(logPath, "rotate-%DATE%.log"), datePattern: "YYYY-MM-DD", maxFiles: "7d",
});

const logger = createLogger({
    level: "debug", format: json(), transports: [fileRotateTransport, new transports.Console()],
});

module.exports = logger;