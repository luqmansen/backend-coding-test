const logger = require('./logger')
const rateLimit = require('express-rate-limit');

const requestLogger = (req, res, next) => {
    res.on("finish", function () {
        logger.info({
            method: req.method, path: decodeURI(req.url), status: res.statusCode, host: res.hostname});
    });
    next();
};

const isLoadTest = (process.env.IS_LOADTEST === 'true') || false

const rateLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 min
    max: async (req, _) => {
        // only limit post request
        if (req.method === "POST" && !isLoadTest) {
            return 100
        }
        return 0
    }
})


module.exports = {
    requestLogger,
    rateLimiter
}